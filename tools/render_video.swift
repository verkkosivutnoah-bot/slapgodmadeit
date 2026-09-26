// Render a YouTube-ready MP4 from a cover image + an audio file, using only macOS frameworks
// (AVFoundation / CoreGraphics) — no ffmpeg.
//
//   SDKROOT=<sdk> swift tools/render_video.swift <thumbnail.jpg> <audio.mp3> <out.mp4>
//
// Frame: the thumbnail full-frame at 1920×1080. One still frame per second (YouTube is fine with
// it), then the audio is muxed in and the whole thing exported as H.264 + AAC.
import AVFoundation
import AppKit
import CoreGraphics
import Foundation

let args = CommandLine.arguments
guard args.count >= 4 else {
    FileHandle.standardError.write("usage: render_video.swift <thumbnail> <audio> <out.mp4>\n".data(using: .utf8)!)
    exit(2)
}
let coverURL = URL(fileURLWithPath: args[1])
let audioURL = URL(fileURLWithPath: args[2])
let outURL = URL(fileURLWithPath: args[3])

let W = 1920, H = 1080

func fail(_ msg: String) -> Never {
    FileHandle.standardError.write("✗ \(msg)\n".data(using: .utf8)!)
    exit(1)
}

// ---------------------------------------------------------------- frame
/// The owner's thumbnail, full-frame (cover-fit to 1920×1080). It's the same picture used as the
/// YouTube thumbnail and the cover on the website, so the video matches both.
func renderFrame() -> CGImage {
    guard let nsCover = NSImage(contentsOf: coverURL),
          let cover = nsCover.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        fail("can't read thumbnail \(coverURL.path)")
    }
    let cs = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0,
                              space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue) else {
        fail("can't create drawing context")
    }
    ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
    ctx.interpolationQuality = .high
    let cw = CGFloat(cover.width), ch = CGFloat(cover.height)
    let scale = max(CGFloat(W) / cw, CGFloat(H) / ch)
    let dw = cw * scale, dh = ch * scale
    ctx.draw(cover, in: CGRect(x: (CGFloat(W) - dw) / 2, y: (CGFloat(H) - dh) / 2, width: dw, height: dh))
    guard let img = ctx.makeImage() else { fail("can't finish frame") }
    return img
}

func pixelBuffer(from image: CGImage) -> CVPixelBuffer {
    var pb: CVPixelBuffer?
    let attrs = [kCVPixelBufferCGImageCompatibilityKey: true, kCVPixelBufferCGBitmapContextCompatibilityKey: true] as CFDictionary
    CVPixelBufferCreate(kCFAllocatorDefault, W, H, kCVPixelFormatType_32ARGB, attrs, &pb)
    guard let buffer = pb else { fail("can't allocate pixel buffer") }
    CVPixelBufferLockBaseAddress(buffer, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buffer), width: W, height: H, bitsPerComponent: 8,
                        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer), space: CGColorSpaceCreateDeviceRGB(),
                        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    ctx.draw(image, in: CGRect(x: 0, y: 0, width: W, height: H))
    CVPixelBufferUnlockBaseAddress(buffer, [])
    return buffer
}

// ---------------------------------------------------------------- main
let semaphore = DispatchSemaphore(value: 0)
Task {
    let audioAsset = AVURLAsset(url: audioURL)
    guard let audioDuration = try? await audioAsset.load(.duration), audioDuration.seconds > 0 else {
        fail("can't read audio \(audioURL.path)")
    }
    let seconds = Int(ceil(audioDuration.seconds))

    // 1) silent video: the still frame once per second
    let silentURL = FileManager.default.temporaryDirectory.appendingPathComponent("sg-silent-\(UUID().uuidString).mp4")
    guard let writer = try? AVAssetWriter(outputURL: silentURL, fileType: .mp4) else { fail("can't create writer") }
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: W,
        AVVideoHeightKey: H,
        AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 2_000_000],
    ])
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: nil)
    writer.add(input)
    writer.startWriting()
    writer.startSession(atSourceTime: .zero)

    let frame = pixelBuffer(from: renderFrame())
    for s in 0...seconds {
        while !input.isReadyForMoreMediaData { try? await Task.sleep(nanoseconds: 2_000_000) }
        adaptor.append(frame, withPresentationTime: CMTime(value: CMTimeValue(s), timescale: 1))
    }
    input.markAsFinished()
    await writer.finishWriting()
    guard writer.status == .completed else { fail("video write failed: \(writer.error?.localizedDescription ?? "?")") }

    // 2) mux the audio in and export H.264 + AAC
    let comp = AVMutableComposition()
    let videoAsset = AVURLAsset(url: silentURL)
    guard let vTrack = try? await videoAsset.loadTracks(withMediaType: .video).first,
          let aTrack = try? await audioAsset.loadTracks(withMediaType: .audio).first,
          let cv = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
          let ca = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else {
        fail("can't combine audio and video")
    }
    let range = CMTimeRange(start: .zero, duration: audioDuration)
    try? cv.insertTimeRange(range, of: vTrack, at: .zero)
    try? ca.insertTimeRange(range, of: aTrack, at: .zero)

    try? FileManager.default.removeItem(at: outURL)
    guard let export = AVAssetExportSession(asset: comp, presetName: AVAssetExportPreset1920x1080) else {
        fail("can't create exporter")
    }
    export.outputURL = outURL
    export.outputFileType = .mp4
    await export.export()
    try? FileManager.default.removeItem(at: silentURL)
    guard export.status == .completed else { fail("export failed: \(export.error?.localizedDescription ?? "?")") }

    print("✓ \(outURL.path) (\(seconds)s)")
    semaphore.signal()
}
semaphore.wait()
