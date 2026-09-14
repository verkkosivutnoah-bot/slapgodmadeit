"use client";
// Global, persistent player: one MusicPlayer instance living in the root layout,
// rendered as a sticky mini bar that expands into the full card.
// Any component can queue tracks with usePlayer().playQueue(tracks, index).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { scrollLock } from "@/components/ui/SmoothScroll";
import { MusicPlayer, type PlayerApi, type Track } from "./MusicPlayer";
import { DEFAULT_SHORTCUT_OWNER } from "./audioFocus";
import { beats, toPlayerTrack } from "@/data/beats";

interface PlayerCtx {
  currentId: string | null;
  isPlaying: boolean;
  started: boolean;
  playQueue: (tracks: Track[], index: number) => void;
  toggle: () => void;
}

const Ctx = createContext<PlayerCtx | null>(null);
const DEFAULT_QUEUE: Track[] = beats.map(toPlayerTrack);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Track[]>(DEFAULT_QUEUE);
  const [startIndex, setStartIndex] = useState(0);
  const [loadKey, setLoadKey] = useState(0);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const apiRef = useRef<PlayerApi | null>(null);

  const playQueue = useCallback((tracks: Track[], index: number) => {
    setQueue(tracks);
    setStartIndex(index);
    setLoadKey((k) => k + 1);
    setStarted(true);
  }, []);

  const toggle = useCallback(() => apiRef.current?.toggle(), []);
  const dockRef = useRef<HTMLDivElement>(null);

  // expanded on mobile = full-screen sheet: lock scroll, Esc closes
  useEffect(() => {
    if (!expanded) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (mobile) scrollLock.lock();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    document.addEventListener("keydown", onKey);
    return () => {
      if (mobile) scrollLock.unlock();
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  // swipe-down to close the sheet (handle only, so controls stay tappable)
  const drag = useRef<{ y0: number; dy: number } | null>(null);
  const onHandleDown = (e: React.PointerEvent) => {
    drag.current = { y0: e.clientY, dy: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onHandleMove = (e: React.PointerEvent) => {
    if (!drag.current || !dockRef.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y0);
    dockRef.current.style.transition = "none";
    dockRef.current.style.transform = `translateY(${drag.current.dy}px)`;
  };
  const onHandleUp = () => {
    const el = dockRef.current;
    if (!drag.current || !el) return;
    const close = drag.current.dy > 110;
    el.style.transition = "";
    el.style.transform = "";
    drag.current = null;
    if (close) setExpanded(false);
  };

  const value = useMemo(
    () => ({ currentId, isPlaying, started, playQueue, toggle }),
    [currentId, isPlaying, started, playQueue, toggle]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        ref={dockRef}
        className={`dock ${started ? "is-visible" : ""} ${expanded ? "is-expanded" : ""}`}
        aria-hidden={!started}
        inert={!started}
      >
        <MusicPlayer
          id={DEFAULT_SHORTCUT_OWNER}
          label="Now playing"
          className={expanded ? "card--expanded" : "card--dock"}
          tracks={queue}
          startIndex={startIndex}
          loadKey={loadKey}
          autoPlay
          apiRef={apiRef}
          onPlayingChange={(p) => {
            setIsPlaying(p);
            if (p) setStarted(true);
          }}
          onTrackChange={(_, t) => setCurrentId(t?.id ?? null)}
        >
          <div
            className="dock-handle"
            aria-hidden
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={onHandleUp}
          />
          <button
            type="button"
            className="dock-expand"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((x) => !x);
            }}
            aria-label={expanded ? "Collapse player" : "Expand player"}
            aria-expanded={expanded}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {expanded ? <path d="M6 9l6 6 6-6" /> : <path d="M6 15l6-6 6 6" />}
            </svg>
          </button>
        </MusicPlayer>
      </div>
    </Ctx.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
