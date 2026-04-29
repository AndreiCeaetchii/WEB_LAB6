import type { SVGProps } from 'react';

interface LogoMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * CarTrack monogram. The outer arc reads as a road/curve; the diagonal stroke
 * is the path of a tracked car; the dot is the position marker. Fits inside
 * a square viewBox and works at any size.
 */
export function LogoMark({ size = 32, ...rest }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="11.5"
        fill="rgb(var(--brand))"
        stroke="rgb(var(--brand) / 0.85)"
      />
      {/* outer arc (road) */}
      <path
        d="M11 29 A11 11 0 1 1 29 11"
        stroke="rgb(var(--brand-contrast))"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* inner ridge — adds depth, suggests a track lane */}
      <path
        d="M14 26 A8 8 0 0 1 26 14"
        stroke="rgb(var(--brand-contrast) / 0.45)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* tracker dot at the leading end of the arc */}
      <circle cx="29" cy="11" r="3" fill="rgb(var(--brand-contrast))" />
      <circle cx="29" cy="11" r="1.2" fill="rgb(var(--brand))" />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

/**
 * Mark + wordmark lockup. Wordmark uses a deliberate two-weight kerning so it
 * doesn't read as Tailwind-default sans.
 */
export function Logo({ size = 32, className = '', showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="flex items-baseline text-[15px] tracking-tight">
          <span className="font-semibold text-ink">Car</span>
          <span className="font-light text-ink-muted">Track</span>
        </span>
      )}
    </span>
  );
}
