import type { SVGProps } from "react";

const SIZE_MAP = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64,
} as const;

type LogoSize = keyof typeof SIZE_MAP | number;

interface LogoProps extends Omit<
  SVGProps<SVGSVGElement>,
  "viewBox" | "xmlns" | "height" | "width"
> {
  variant?: "full" | "mark";
  size?: LogoSize;
}

/**
 * MideSofek/Tools brand logo.
 *
 * @example
 *   <Logo />                          // full lockup, 32px height
 *   <Logo variant="mark" size="sm" /> // mark only, 20px height
 *   <Logo size={48} className="text-white" />  // custom size, white via Tailwind
 *
 * Color: uses `currentColor` so parent text color drives the mark.
 * Font: requires IBM Plex Mono (400, 500) loaded on the page.
 */
export function Logo({
  variant = "full",
  size = "md",
  className,
  ...props
}: LogoProps) {
  const height = typeof size === "number" ? size : SIZE_MAP[size];
  const viewBox = variant === "mark" ? "0 0 64 68" : "0 0 372 68";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      height={height}
      className={className}
      role="img"
      aria-label="MideSofek/Tools"
      {...props}
    >
      <title>MideSofek/Tools</title>

      {/* Off-dots: structural grid at reduced opacity */}
      <g fill="currentColor" opacity="0.35">
        <circle cx="20" cy="10" r="1.8" />
        <circle cx="32" cy="10" r="1.8" />
        <circle cx="44" cy="10" r="1.8" />
        <circle cx="32" cy="22" r="1.8" />
        <circle cx="20" cy="34" r="1.8" />
        <circle cx="44" cy="34" r="1.8" />
        <circle cx="20" cy="46" r="1.8" />
        <circle cx="32" cy="46" r="1.8" />
        <circle cx="44" cy="46" r="1.8" />
        <circle cx="20" cy="58" r="1.8" />
        <circle cx="32" cy="58" r="1.8" />
        <circle cx="44" cy="58" r="1.8" />
      </g>

      {/* On-dots: the M silhouette */}
      <g fill="currentColor">
        <circle cx="8" cy="10" r="3.5" />
        <circle cx="56" cy="10" r="3.5" />
        <circle cx="8" cy="22" r="3.5" />
        <circle cx="20" cy="22" r="3.5" />
        <circle cx="44" cy="22" r="3.5" />
        <circle cx="56" cy="22" r="3.5" />
        <circle cx="8" cy="34" r="3.5" />
        <circle cx="32" cy="34" r="3.5" />
        <circle cx="56" cy="34" r="3.5" />
        <circle cx="8" cy="46" r="3.5" />
        <circle cx="56" cy="46" r="3.5" />
        <circle cx="8" cy="58" r="3.5" />
        <circle cx="56" cy="58" r="3.5" />
      </g>

      {variant === "full" && (
        <text
          x="80"
          y="44"
          fill="currentColor"
          fontFamily="'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"
          fontSize="32"
          fontWeight="500"
          letterSpacing="-0.02em"
        >
          <tspan>MideSofek</tspan>
          <tspan opacity="0.45">/</tspan>
          <tspan>Tools</tspan>
        </text>
      )}
    </svg>
  );
}
