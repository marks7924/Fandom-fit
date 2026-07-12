import React from 'react';

interface BrandLogoProps {
  /** Color of the text and crown. Defaults to black. */
  color?: string;
  /** Controls the overall scale. Defaults to 1. */
  scale?: number;
  className?: string;
}

/**
 * The Fandom Fit brand mark — hand-drawn crown SVG + handwriting text.
 * Matches the official logo image exactly without relying on an image file.
 */
export default function BrandLogo({ color = 'currentColor', scale = 1, className = '' }: BrandLogoProps) {
  return (
    <div
      className={`flex flex-col items-center leading-none select-none ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
    >
      {/* Hand-drawn crown SVG */}
      <svg
        width="40"
        height="26"
        viewBox="0 0 80 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ marginBottom: '-2px' }}
      >
        {/* Shine rays above crown */}
        <line x1="40" y1="2" x2="40" y2="9"  stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="5" x2="25" y2="11" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="52" y1="5" x2="55" y2="11" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Crown body — hand-drawn zig-zag shape */}
        <path
          d="M10 46 L14 22 L28 36 L40 14 L52 36 L66 22 L70 46 Z"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Crown base line */}
        <line x1="10" y1="46" x2="70" y2="46" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      </svg>

      {/* Handwriting text */}
      <span
        className="font-handwriting font-bold tracking-tight"
        style={{ color, fontSize: `${2.1 * scale}rem`, lineHeight: 1 }}
      >
        Fandom Fit
      </span>
    </div>
  );
}
