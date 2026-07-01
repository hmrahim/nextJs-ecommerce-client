'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { visitorService } from '@/services/visitorService';

/**
 * Silent visitor tracker — no browser permission prompts.
 * Fires a beacon to the backend on every route change so the admin
 * "Visitor Analytics" dashboard shows real traffic.
 *
 * - Device / browser / OS: read server-side from the User-Agent header.
 * - Location: read server-side from the request IP (no navigator.geolocation).
 * - Session identity: reuses the existing guest `x-session-id` header
 *   already attached by lib/api.js, so guest → logged-in journeys link up.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const lastClickSent = useRef(0);

  // Track page views
  useEffect(() => {
    if (!pathname || pathname.startsWith('/dashboard')) return;

    visitorService.trackVisit({
      path: pathname,
      referrer: document.referrer || null,
      screenResolution: `${window.screen.width}×${window.screen.height}`,
      connectionType: navigator.connection?.effectiveType || null,
      language: navigator.language || null,
    }).catch(() => {});
  }, [pathname]);

  // Best-effort scroll depth + click count, throttled
  useEffect(() => {
    if (pathname?.startsWith('/dashboard')) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop + window.innerHeight;
      const pct = Math.min(100, Math.round((scrolled / doc.scrollHeight) * 100));
      visitorService.trackEvent({ type: 'scroll', value: pct }).catch(() => {});
    };
    const onClick = () => {
      const now = Date.now();
      if (now - lastClickSent.current < 3000) return; // throttle to 1 per 3s
      lastClickSent.current = now;
      visitorService.trackEvent({ type: 'click' }).catch(() => {});
    };

    let scrollTimer;
    const throttledScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(onScroll, 800);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('click', onClick);
      clearTimeout(scrollTimer);
    };
  }, [pathname]);

  return null;
}
