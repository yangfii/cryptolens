"use client";

type Props = {
  size?: number;
  className?: string;
};

/**
 * Animated Sastra trader logo:
 * - Premium gold gradient background (existing `.logo-premium` style)
 * - An "S" monogram in the center
 * - An orbiting arc with a glowing dot rotating around it (the "lens" effect)
 * - Subtle outer glow that pulses
 */
export default function AnimatedLogo({ size = 36, className = "" }: Props) {
  return (
    <span
      className={`logo-animated relative inline-grid place-items-center rounded-xl ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Rotating ring + orbiting dot (SVG) */}
      <svg
        className="logo-orbit absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle full ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="rgba(0, 0, 0, 0.18)"
          strokeWidth="1.5"
        />
        {/* Bright arc segment */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="55 250"
        />
        {/* Glowing dot at the end of the arc */}
        <circle cx="50" cy="6" r="3.5" fill="#fff">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* The "S" monogram */}
      <span className="relative z-10 text-accent-foreground font-black text-[length:inherit]">
        S
      </span>
    </span>
  );
}
