import Link from "next/link";
import { seller } from "@/data/seller";

const links = [
  { href: "/licenses", label: "Licenses" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden">
      <div className="container-sg flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-bone">
          {seller.name} ({seller.legalForm}) © {new Date().getFullYear()}
        </p>
        <nav aria-label="Footer" className="-mx-2 flex flex-wrap gap-x-1 gap-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-2 py-2 text-mute transition-colors hover:text-bone">
              {l.label}
            </Link>
          ))}
          <a href={seller.instagramUrl} target="_blank" rel="noreferrer" className="rounded-full px-2 py-2 text-mute transition-colors hover:text-bone">
            Instagram {seller.instagram}
          </a>
        </nav>
      </div>
      <p
        aria-hidden
        className="display pointer-events-none -mb-[0.22em] select-none whitespace-nowrap text-center text-[18.5vw] leading-[0.9] text-[#292524]"
      >
        SLAPGOD
      </p>
    </footer>
  );
}
