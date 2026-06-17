'use client';

import { useEffect } from 'react';
import { loadingBar } from './Toploadingbar';


/**
 * NavigationEvents
 * Detects any <a> / Next.js <Link> click and starts the loading bar immediately.
 * Place this once inside your layout, alongside <TopLoadingBarWrapper />.
 */
export default function NavigationEvents() {
  useEffect(() => {
    const handleClick = (e) => {
      // Walk up the DOM to find the nearest <a> tag
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip: external links, hash-only, mailto, tel, javascript:
      const isExternal  = anchor.target === '_blank' || /^https?:\/\//.test(href);
      const isHashOnly  = href.startsWith('#');
      const isSpecial   = /^(mailto:|tel:|javascript:)/.test(href);

      if (isExternal || isHashOnly || isSpecial) return;

      // Same page? skip
      const currentPath = window.location.pathname + window.location.search;
      try {
        const targetUrl  = new URL(href, window.location.origin);
        const targetPath = targetUrl.pathname + targetUrl.search;
        if (targetPath === currentPath) return;
      } catch (_) {
        // relative path — allow
      }

      loadingBar.start();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}