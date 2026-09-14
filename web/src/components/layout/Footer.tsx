import Link from "next/link";
import { InstagramIcon, MailIcon, SparkIcon, YoutubeIcon } from "@/components/ui/Icons";
import { Marquee } from "@/components/ui/motion";
import { sellerLine } from "@/data/seller";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/beats", label: "Beats" },
      { href: "/packs", label: "Loops & packs" },
      { href: "/packs/guitar-vault-vol-1", label: "Guitar Vault Vol. 1" },
      { href: "/free", label: "Free downloads" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/#rights", label: "Know your rights" },
      { href: "/licenses", label: "License agreements" },
      { href: "/contact", label: "Custom beats" },
      { href: "/contact", label: "Content ID help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/licenses", label: "License Agreements" },
      { href: "/refunds", label: "Refund Policy" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-surface">
      <Marquee
        className="border-b border-line py-5 font-mono text-xs uppercase tracking-[0.3em] text-mute"
        duration={40}
        items={["100% original sounds", "Prod. by SLAPGOD", "Royalty-free loops", "Instant delivery", "@slapgodmadeit", "Leases from €29"]}
      />
      <div className="container-sg grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] grid-cols-1">
        <div>
          <Link href="/" className="flex items-center gap-2" aria-label="SLAPGOD home">
            <SparkIcon className="text-ember" />
            <span className="display text-4xl">SLAPGOD</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">
            Beats, live guitar loops and sample packs made by hand. Built for artists and producers who want sounds nobody else has.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href="https://instagram.com/slapgodmadeit"
              target="_blank"
              rel="noreferrer"
              aria-label="SLAPGOD on Instagram"
              className="grid h-11 w-11 place-items-center rounded-full border border-line transition hover:border-ember hover:text-ember"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              aria-label="SLAPGOD on YouTube (link coming soon)"
              className="grid h-11 w-11 place-items-center rounded-full border border-line transition hover:border-ember hover:text-ember"
            >
              <YoutubeIcon />
            </a>
            <Link
              href="/contact"
              aria-label="Contact SLAPGOD"
              className="grid h-11 w-11 place-items-center rounded-full border border-line transition hover:border-ember hover:text-ember"
            >
              <MailIcon />
            </Link>
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="eyebrow mb-4">{c.title}</h2>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-bone/85 transition hover:text-ember">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-sg relative">
        <p aria-hidden className="display pointer-events-none select-none text-center text-[23vw] leading-[0.78] text-bone/[0.04]">
          SLAPGOD
        </p>
      </div>
      <div className="border-t border-line">
        <div className="container-sg flex flex-col gap-2 py-6 font-mono text-[11px] leading-relaxed text-mute lg:flex-row lg:justify-between lg:gap-8">
          <p>© {new Date().getFullYear()} SLAPGOD. All sounds 100% original. EUR prices incl. VAT.</p>
          <address className="not-italic">{sellerLine}</address>
        </div>
      </div>
    </footer>
  );
}
