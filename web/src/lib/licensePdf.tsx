/**
 * License agreement PDF — the binding document delivered with every purchase.
 *
 * Server-side only (@react-pdf/renderer). One page per licence, personalised with the
 * buyer's name, the beat, the tier's caps and the licence number. Keep the wording here
 * in step with /licenses and docs/PLAN.md §2.2 — and have a lawyer read it before launch.
 */
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { licenseTiers, type LicenseId } from "@/data/licenses";
import { seller } from "@/data/seller";

export interface LicenseDetails {
  licenseNumber: string;
  tierId: LicenseId;
  beatTitle: string;
  bpm?: number;
  musicalKey?: string;
  licenseeName: string;
  licenseeEmail: string;
  issuedAt?: Date;
  orderRef?: string;
  amountLabel?: string;
}

const INK = "#1c1917";
const MUTE = "#57534e";
const LINE = "#d6d3d1";
const CORAL = "#c2410c";

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingHorizontal: 48, paddingBottom: 78, fontSize: 9.5, fontFamily: "Helvetica", color: INK, lineHeight: 1.5 },
  brand: { fontSize: 15, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  meta: { fontSize: 8, color: MUTE, textAlign: "right" },
  rule: { borderBottomWidth: 1.5, borderBottomColor: INK, marginVertical: 12 },
  h1: { fontSize: 19, fontFamily: "Helvetica-Bold", lineHeight: 1.25, marginBottom: 4 },
  sub: { fontSize: 9.5, color: MUTE, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  cell: { width: "50%", paddingRight: 12, marginBottom: 8 },
  label: { fontSize: 7.5, color: MUTE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  value: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  h2: { fontSize: 10.5, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 5 },
  p: { marginBottom: 5, textAlign: "justify" },
  li: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 12, color: CORAL },
  capsRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 3.5 },
  capsKey: { width: "42%", color: MUTE },
  capsVal: { width: "58%", fontFamily: "Helvetica-Bold" },
  sign: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  signBox: { width: "46%" },
  signLine: { borderBottomWidth: 0.75, borderBottomColor: INK, height: 26, marginBottom: 4 },
  foot: { position: "absolute", left: 48, right: 48, bottom: 30, fontSize: 7.5, color: MUTE, borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 7 },
});

const Bullet = ({ children }: { children: string }) => (
  <View style={s.li} wrap={false}>
    <Text style={s.bullet}>—</Text>
    <Text style={{ flex: 1 }}>{children}</Text>
  </View>
);

const Cap = ({ k, v }: { k: string; v: string }) => (
  <View style={s.capsRow}>
    <Text style={s.capsKey}>{k}</Text>
    <Text style={s.capsVal}>{v}</Text>
  </View>
);

function LicenseDoc(d: LicenseDetails) {
  const tier = licenseTiers.find((t) => t.id === d.tierId) ?? licenseTiers[0];
  const exclusive = tier.id === "exclusive";
  const issued = d.issuedAt ?? new Date();
  const date = issued.toISOString().slice(0, 10);
  const track = [d.bpm ? `${d.bpm} BPM` : null, d.musicalKey].filter(Boolean).join(" · ");

  return (
    <Document
      title={`${tier.name} — ${d.beatTitle}`}
      author={seller.name}
      subject={`License agreement ${d.licenseNumber}`}
    >
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <Text style={s.brand}>SLAPGOD</Text>
          <Text style={s.meta}>
            License no. {d.licenseNumber}
            {"\n"}
            Issued {date}
            {d.orderRef ? `\nOrder ${d.orderRef}` : ""}
          </Text>
        </View>
        <View style={s.rule} />

        <Text style={s.h1}>{exclusive ? "Exclusive Rights Agreement" : "Non-Exclusive License Agreement"}</Text>
        <Text style={s.sub}>{tier.name}</Text>

        <View style={s.grid}>
          <View style={s.cell}>
            <Text style={s.label}>Licensor</Text>
            <Text style={s.value}>{seller.name}</Text>
            <Text style={{ color: MUTE }}>
              {seller.legalForm} · Business ID {seller.businessId}
              {"\n"}
              {seller.street}, {seller.postalCode} {seller.city}, {seller.country}
            </Text>
          </View>
          <View style={s.cell}>
            <Text style={s.label}>Licensee</Text>
            <Text style={s.value}>{d.licenseeName}</Text>
            <Text style={{ color: MUTE }}>{d.licenseeEmail}</Text>
          </View>
          <View style={s.cell}>
            <Text style={s.label}>Composition</Text>
            <Text style={s.value}>{d.beatTitle}</Text>
            {!!track && <Text style={{ color: MUTE }}>{track}</Text>}
          </View>
          <View style={s.cell}>
            <Text style={s.label}>Fee</Text>
            <Text style={s.value}>{d.amountLabel ?? `€${tier.price}`}</Text>
            <Text style={{ color: MUTE }}>Files delivered: {tier.files}</Text>
          </View>
        </View>

        <Text style={s.h2} minPresenceAhead={60}>1. Grant of rights</Text>
        <Text style={s.p}>
          In consideration of the fee above, the Licensor grants the Licensee a worldwide,{" "}
          {exclusive ? "exclusive" : "non-exclusive"}, non-transferable licence to record one (1) new musical
          work incorporating the Composition, and to distribute that work within the limits set out in section 2.
          This licence has no expiry date. The Licensor retains all copyright in the Composition and in the
          underlying sound recording.
        </Text>
        <Text style={s.p}>
          Synchronisation of the new work with visual media — including film, television, advertising, video
          games and trailers — is not included. It requires the Licensor&apos;s prior written consent and a separately
          agreed fee split. Music videos within the limits of section 2 and short-form social video (TikTok, Reels,
          Shorts) are permitted.
        </Text>
        {exclusive && (
          <Text style={s.p}>
            The Composition is withdrawn from sale on the Licensor&apos;s store upon execution of this agreement.
            Non-exclusive licences granted to third parties before that date remain valid and are not revoked by
            this agreement; the Licensee acknowledges having been informed of this. This agreement is an exclusive
            licence, not an assignment: no copyright in the Composition or its sound recording is transferred.
          </Text>
        )}

        <Text style={s.h2} minPresenceAhead={60}>2. Limits</Text>
        <Cap k="Audio streams" v={tier.streams} />
        <Cap k="Sales / paid downloads" v={tier.sales} />
        <Cap k="Music videos" v={tier.videos} />
        <Cap k="Paid live performances" v={tier.paidPerformances} />
        <Cap k="Radio broadcasting" v={tier.radio} />
        <Cap k="Synchronisation (film, TV, ads, games)" v="Written consent required" />
        <Cap k="Term" v="No expiry" />
        <Text style={[s.p, { marginTop: 6 }]}>
          Counts are cumulative across all platforms and territories. On reaching a limit, the Licensee shall
          upgrade to a higher tier, paying the difference, before continuing to exploit the work.
        </Text>

        <Text style={s.h2} minPresenceAhead={60}>3. Credit, publishing and royalties</Text>
        <Bullet>{`The Licensee shall credit the Licensor as "Prod. by SLAPGOD" wherever the work is released, including in distributor metadata.`}</Bullet>
        <Bullet>{`The Licensor owns ${tier.compositionShare} of the composition of the new work — both the writer's share and the publisher's share. The Licensee shall register the Licensor with that share, as co-writer and co-publisher, with their performing rights organisation, publisher and distributor, and shall not register a lower share.`}</Bullet>
        {exclusive && (
          <Bullet>{`Master royalty: the Licensee shall pay the Licensor ${tier.masterRoyalty} of all net income received from the master recording of the new work (streaming, downloads, physical sales, synchronisation and any other exploitation), with a written statement every six months, within 30 days of the end of June and December.`}</Bullet>
        )}
        <Bullet>The Licensee owns the master recording of their new work and any lyrics or topline they author, subject to the shares above.</Bullet>
        <Bullet>Within 14 days of the new work&apos;s first commercial release, the Licensee shall notify the Licensor of the release date, the ISRC and the distributor, and provide a signed split sheet.</Bullet>
        <Bullet>The Licensor may name the Licensee and the new work, and use excerpts of it, to promote the Licensor&apos;s own services, including in portfolios and on social media.</Bullet>

        <Text style={s.h2} minPresenceAhead={60}>4. Restrictions</Text>
        <Bullet>The Composition may not be resold, redistributed, licensed on, or made available as a beat, loop or sample.</Bullet>
        <Bullet>The Composition and the new work may not be registered with YouTube Content ID, Facebook Rights Manager or any comparable rights-management system.</Bullet>
        <Bullet>Neither the Composition nor the new work may be used to train machine-learning or generative AI systems, or included in any dataset for that purpose.</Bullet>
        <Bullet>The Licensee may not claim authorship of the Composition.</Bullet>
        <Bullet>This licence may not be sublicensed, transferred or assigned without the Licensor&apos;s written consent.</Bullet>

        <Text style={s.h2} minPresenceAhead={60}>5. Termination and liability</Text>
        <Text style={s.p}>
          Breach of sections 1, 2, 3 or 4 terminates this licence immediately, and the Licensee shall remove the
          work from distribution. Royalty and publishing shares already earned remain due. The Licensor warrants that the Composition is original and clear of third-party
          samples. The Licensor&apos;s total liability is limited to the fee paid. Fees are non-refundable once the
          files have been delivered.
        </Text>

        <Text style={s.h2} minPresenceAhead={60}>6. Governing law</Text>
        <Text style={s.p}>
          This agreement is governed by the laws of {seller.country}. Disputes fall to the courts of {seller.city},{" "}
          {seller.country}. Where the Licensee is a consumer, mandatory consumer-protection rules of their country
          of residence continue to apply.
        </Text>

        <View style={s.sign}>
          <View style={s.signBox}>
            <View style={s.signLine} />
            <Text style={s.label}>Licensor — {seller.name}</Text>
          </View>
          <View style={s.signBox}>
            <View style={s.signLine} />
            <Text style={s.label}>Licensee — {d.licenseeName}</Text>
          </View>
        </View>

        <Text style={s.foot} fixed>
          {seller.name} · {seller.instagram} · License {d.licenseNumber} · Issued {date}. This document is the
          binding agreement; summaries elsewhere are for guidance only.
        </Text>
      </Page>
    </Document>
  );
}

export interface LoopLicenseDetails {
  licenseNumber: string;
  packTitle: string;
  licenseeName: string;
  licenseeEmail: string;
  issuedAt?: Date;
  orderRef?: string;
  amountLabel?: string;
}

/** Royalty-free licence for loop / sample packs (also used for the free Vault Sampler). */
function LoopLicenseDoc(d: LoopLicenseDetails) {
  const date = (d.issuedAt ?? new Date()).toISOString().slice(0, 10);
  return (
    <Document title={`Loop License — ${d.packTitle}`} author={seller.name} subject={`License agreement ${d.licenseNumber}`}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <Text style={s.brand}>SLAPGOD</Text>
          <Text style={s.meta}>
            License no. {d.licenseNumber}
            {"\n"}
            Issued {date}
            {d.orderRef ? `\nOrder ${d.orderRef}` : ""}
          </Text>
        </View>
        <View style={s.rule} />

        <Text style={s.h1}>Loop &amp; Sample License Agreement</Text>
        <Text style={s.sub}>Royalty-free, non-exclusive</Text>

        <View style={s.grid}>
          <View style={s.cell}>
            <Text style={s.label}>Licensor</Text>
            <Text style={s.value}>{seller.name}</Text>
            <Text style={{ color: MUTE }}>
              {seller.legalForm} · Business ID {seller.businessId}
              {"\n"}
              {seller.street}, {seller.postalCode} {seller.city}, {seller.country}
            </Text>
          </View>
          <View style={s.cell}>
            <Text style={s.label}>Licensee</Text>
            <Text style={s.value}>{d.licenseeName}</Text>
            <Text style={{ color: MUTE }}>{d.licenseeEmail}</Text>
          </View>
          <View style={s.cell}>
            <Text style={s.label}>Product</Text>
            <Text style={s.value}>{d.packTitle}</Text>
          </View>
          <View style={s.cell}>
            <Text style={s.label}>Fee</Text>
            <Text style={s.value}>{d.amountLabel ?? "—"}</Text>
          </View>
        </View>

        <Text style={s.h2} minPresenceAhead={60}>1. Grant of rights</Text>
        <Text style={s.p}>
          The Licensor grants the Licensee a worldwide, non-exclusive, non-transferable, perpetual licence to use the
          loops and samples in the Product (the &quot;Sounds&quot;) as part of new musical works the Licensee creates,
          including beats the Licensee sells or leases, and to distribute those works commercially without further
          fees, subject to sections 2 to 4. The Licensor retains all copyright in the Sounds.
        </Text>

        <Text style={s.h2} minPresenceAhead={60}>2. Composition share and credit</Text>
        <Bullet>The Licensor owns 25% of the composition — writer&apos;s and publisher&apos;s share — of any musical work that uses the Sounds and is commercially released, distributed to streaming services or placed with an artist. The Licensee shall register this share with their performing rights organisation, publisher and distributor, and shall pass this obligation on to any artist who licenses a beat containing the Sounds.</Bullet>
        <Bullet>Within 14 days of such a release, the Licensee shall notify the Licensor of the release date, the ISRC and the distributor, and provide a signed split sheet.</Bullet>
        <Bullet>{`Credit "Prod. by SLAPGOD" or "Loops by @slapgodmadeit" wherever the work is released.`}</Bullet>
        <Bullet>The Licensor may name the Licensee and the work, and use excerpts of it, to promote the Licensor&apos;s own services.</Bullet>

        <Text style={s.h2} minPresenceAhead={60}>3. Restrictions</Text>
        <Bullet>The Sounds may not be resold, shared or redistributed on their own or in any sample pack, loop kit, construction kit, library or sound bank, whether modified or not.</Bullet>
        <Bullet>Works that use the Sounds, and the Sounds themselves, may not be registered with YouTube Content ID, Facebook Rights Manager or any comparable system.</Bullet>
        <Bullet>The Sounds may not be used to train machine-learning or generative AI systems, or included in any dataset for that purpose.</Bullet>
        <Bullet>Synchronisation of a work that uses the Sounds with film, television, advertising or video games requires the Licensor&apos;s prior written consent.</Bullet>
        <Bullet>The Licensee may not claim authorship of the Sounds, and may not sublicense or transfer this licence.</Bullet>

        <Text style={s.h2} minPresenceAhead={60}>4. Termination and law</Text>
        <Text style={s.p}>
          Breach of sections 2 or 3 terminates this licence immediately; shares already earned remain due. The
          Licensor warrants that the Sounds are original and clear of third-party samples; liability is limited to
          the fee paid. This agreement is governed by the laws of {seller.country}, with disputes before the courts of{" "}
          {seller.city}, without affecting mandatory consumer rights.
        </Text>

        <Text style={s.foot} fixed>
          {seller.name} · {seller.instagram} · License {d.licenseNumber} · Issued {date}. This document is the
          binding agreement; summaries elsewhere are for guidance only.
        </Text>
      </Page>
    </Document>
  );
}

export function renderLoopLicensePdf(details: LoopLicenseDetails): Promise<Buffer> {
  return renderToBuffer(<LoopLicenseDoc {...details} />);
}

/** License number like SG-2026-4F8A21. */
export function licenseNumber(seed = ""): string {
  const rand = (seed || Math.random().toString(36)).replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `SG-${new Date().getFullYear()}-${rand.slice(0, 6).padEnd(6, "0")}`;
}

export function renderLicensePdf(details: LicenseDetails): Promise<Buffer> {
  return renderToBuffer(<LicenseDoc {...details} />);
}
