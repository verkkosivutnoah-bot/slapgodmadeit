import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const PlayIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}>
    <path d="M7 5v14l11-7z" />
  </svg>
);
export const PauseIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}>
    <path d="M6 5h3v14H6zM15 5h3v14h-3z" />
  </svg>
);
export const CartIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </svg>
);
export const ArrowIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const DownloadIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
  </svg>
);
export const CheckIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
export const GridIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);
export const ListIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);
export const InstagramIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </svg>
);
export const MailIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);
export const MenuIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const CloseIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const SparkIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}>
    <path d="M12 2c.6 4.8 2.2 7.4 10 10-7.8 2.6-9.4 5.2-10 10-.6-4.8-2.2-7.4-10-10 7.8-2.6 9.4-5.2 10-10z" />
  </svg>
);

export const SearchIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
export const ArrowUpIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

/* ---- social (brand marks, filled) ---- */
export const TikTokIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}>
    <path d="M16.5 3c.4 1.9 1.6 3.3 3.5 3.6v2.6c-1.3.1-2.6-.3-3.7-1v5.6c0 3.6-2.6 6.2-6 6.2A5.9 5.9 0 0 1 4.5 14c0-3.3 2.7-6 6-6 .3 0 .6 0 .9.1v2.9a3 3 0 1 0 2.1 2.9V3h3z" />
  </svg>
);

export const YouTubeIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}>
    <path d="M21.6 7.2c-.2-.9-.9-1.5-1.8-1.7C18.2 5.1 12 5.1 12 5.1s-6.2 0-7.8.4c-.9.2-1.6.8-1.8 1.7C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.5 1.8 1.7 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.8 1.8-1.7.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
  </svg>
);
