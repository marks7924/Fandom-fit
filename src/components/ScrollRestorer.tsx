'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * Restores scroll position after a locale switch and manages dynamic brand favicon.
 * The Navbar saves window.scrollY to sessionStorage before navigating;
 * this component reads it on mount and jumps back to the same position.
 */
export default function ScrollRestorer() {
  const faviconUrl = useStore((state) => state.settings?.favicon_url);

  // Manage Favicon dynamically
  useEffect(() => {
    if (faviconUrl && typeof window !== 'undefined') {
      const linkTags = document.querySelectorAll("link[rel*='icon']");
      if (linkTags.length > 0) {
        linkTags.forEach((link: any) => {
          link.href = faviconUrl;
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }
  }, [faviconUrl]);

  // Restore scroll
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
