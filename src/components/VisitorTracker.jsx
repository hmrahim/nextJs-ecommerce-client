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
 *
 * 🔧 TEMPORARY DEBUG BUILD — console.log lines added to trace why the
 * pageview ping wasn't firing. Remove the console.log lines once confirmed
 * working, revert to the original clean version.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const lastClickSent = useRef(0);

  console.log('[VisitorTracker] component rendered, pathname =', pathname);

  // Track page views
  useEffect(() => {
    console.log('[VisitorTracker] useEffect fired, pathname =', pathname);

    if (!pathname || pathname.startsWith('/dashboard')) {
      console.log('[VisitorTracker] SKIPPED — pathname is falsy or starts with /dashboard');
      return;
    }

    const runTrackVisit = async () => {
      let clientIp = null;
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          clientIp = ipData.ip;
        }
      } catch (err) {
        console.warn('[VisitorTracker] Failed to fetch client public IP side-channel:', err.message);
      }

      console.log('[VisitorTracker] calling visitorService.trackVisit with IP:', clientIp);

      visitorService.trackVisit({
        path: pathname,
        referrer: document.referrer || null,
        screenResolution: `${window.screen.width}×${window.screen.height}`,
        connectionType: navigator.connection?.effectiveType || null,
        language: navigator.language || null,
        ip: clientIp,
      })
        .then((res) => {
          console.log('[VisitorTracker] trackVisit SUCCESS:', res.data);
          if (res.data?.success && res.data?.geo) {
            const { city, postalCode, country, streetAddress } = res.data.geo;
            let text = '';
            if (streetAddress) {
              const parts = streetAddress.split(',').map(p => p.trim());
              if (parts.length > 3) {
                text = parts.slice(0, 3).join(', ');
              } else {
                text = streetAddress;
              }
            } else if (city && city !== 'Unknown') {
              text = city;
              if (postalCode && postalCode !== '—' && postalCode !== null) text += ` ${postalCode}`;
            } else if (country && country !== 'Unknown') {
              // Strip any leading emoji if it has one (like flag emoji)
              text = country.replace(/^.+\s/, '');
            } else {
              text = 'Dhaka 1207';
            }
            sessionStorage.setItem('moom24_user_location', text);
            window.dispatchEvent(new Event('user-location-updated'));
          }
        })
        .catch((err) => console.error('[VisitorTracker] trackVisit FAILED:', err));
    };

    runTrackVisit();
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

  // Disable GPS coordinate request to respect "no browser permission prompt" requirement
  useEffect(() => {
    /* 
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('[VisitorTracker] GPS allowed:', latitude, longitude);
        visitorService.trackEvent({
          type: 'gps_coords',
          value: `${latitude},${longitude}`
        }).catch(() => {});
      },
      (error) => {
        console.log('[VisitorTracker] Geolocation error or blocked:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    */
  }, []);

  return null;
}