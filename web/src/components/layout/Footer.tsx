import Link from "next/link";
import { FooterWordmark } from "./FooterWordmark";
import { seller, socials } from "@/data/seller";

const links = [
  { href: "/licenses", label: "Licenses" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="hairline-grad" aria-hidden />
      <div className="container-sg flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-bone">
          {seller.name} © {new Date().getFullYear()}
        </p>
        <nav aria-label="Footer" className="-mx-2 flex flex-wrap gap-x-1 gap-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="link-u mx-2 py-2 text-mute transition-colors hover:text-coral">
              {l.label}
            </Link>
          ))}
          {socials.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="link-u mx-2 py-2 text-mute transition-colors hover:text-coral">
              {s.name}
            </a>
          ))}
        </nav>
      </div>
      <FooterWordmark />
    </footer>
  );
}
