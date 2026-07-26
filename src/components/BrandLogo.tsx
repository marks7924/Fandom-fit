'use client';

import React from 'react';
import { useStore } from '@/lib/store';

interface BrandLogoProps {
  /** Stroke/text color. Defaults to currentColor. */
  color?: string;
  /**
   * Font size for the text in rem. The crown scales proportionally.
   * Navbar: ~1.6  |  Footer: ~1.6  |  Loading: ~2.8
   */
  textSize?: number;
  className?: string;
}

/**
 * Fandom Fit brand mark — hand-drawn crown SVG + handwriting text.
 * If settings.logo_url is set in the admin panel, renders that image instead.
 */
export default function BrandLogo({ color = 'currentColor', textSize = 1.6, className = '' }: BrandLogoProps) {
  const logoUrl = useStore((state) => state.settings?.logo_url);

  // Crown dimensions proportional to text size
  const crownW = textSize * 28;
  const crownH = textSize * 18;

  // If admin has uploaded a custom logo image, use it
  if (logoUrl) {
    const imgH = textSize * 40;
    return (
      <div className={`flex items-center justify-center select-none ${className}`}>
        <img
          src={logoUrl}
          alt="Brand Logo"
          style={{ height: imgH, maxHeight: imgH, objectFit: 'contain' }}
          className="block"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center leading-none select-none ${className}`}>
      {/* Hand-drawn crown SVG */}
      <svg
        width={crownW}
        height={crownH}
        viewBox="0 0 80 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ marginBottom: `${textSize * -1}px` }}
      >
        {/* Shine rays */}
        <line x1="40" y1="2"  x2="40" y2="10" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="27" y1="5"  x2="23" y2="12" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="53" y1="5"  x2="57" y2="12" stroke={color} strokeWidth="4" strokeLinecap="round" />
        {/* Crown body */}
        <path
          d="M10 46 L15 22 L28 36 L40 14 L52 36 L65 22 L70 46 Z"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Base */}
        <line x1="10" y1="46" x2="70" y2="46" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Brand text */}
      <span
        className="font-handwriting font-bold tracking-tight"
        style={{ color, fontSize: `${textSize}rem`, lineHeight: 1 }}
      >
        Fandom Fit
      </span>
    </div>
  );
}
