'use client';

import { useEffect } from 'react';

/**
 * Restores scroll position after a locale switch.
 * The Navbar saves window.scrollY to sessionStorage before navigating;
 * this component reads it on mount and jumps back to the same position.
 */
export default function ScrollRestorer() {
  useEffect(() => {
    const savedY = sessionStorage.getItem('scrollRestoreY');
    if (savedY !== null) {
      sessionStorage.removeItem('scrollRestoreY');
      const y = parseInt(savedY, 10);
      if (!isNaN(y) && y > 0) {
        // Use instant so the user never sees the top-flash
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
      }
    }
  }, []);

  return null;
}
