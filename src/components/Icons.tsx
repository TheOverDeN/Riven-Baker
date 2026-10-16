// Small inline icons. Kept as plain SVG so the app needs no icon library.

interface IconProps {
  className?: string;
}

// The logo: a baker's hat with a riven diamond on the band.
export function BakerHatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 23c-6-1-6-11 1.5-10.5C13.5 6 26.5 6 27.5 12.5 35 12 35 22 29 23" />
      <path d="M11 23v9.5a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5V23z" />
      <path d="M20 24.5l2.5 3.5-2.5 3.5-2.5-3.5z" />
    </svg>
  );
}

export function DiamondIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 1l5 7-5 7-5-7z" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l4 4" />
    </svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v5M10 6.2v.1" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}
