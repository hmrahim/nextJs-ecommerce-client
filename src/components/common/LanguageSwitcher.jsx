"use client";

/**
 * LanguageSwitcher
 * -----------------
 * Site-wide Google Translate switcher.
 *
 * Two things this version fixes from the previous one:
 *  1. The Google Translate top banner / toolbar (the white/grey bar that
 *     pushes the whole page down by ~40px) is now fully suppressed:
 *      - we inject the override CSS BEFORE the Google script loads, so it
 *        wins from the very first paint;
 *      - we also clear the inline `top` / `margin-top` Google forces onto
 *        <body> and <html> via a MutationObserver (CSS alone can't always
 *        beat inline styles in every browser);
 *      - the iframe banner and tooltip widgets are display:none'd.
 *  2. Language selection still goes through the `googtrans` cookie +
 *     reload, which is the only reliable way to translate server-rendered
 *     and client-navigated pages consistently.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "bn", label: "বাংলা",     flag: "🇧🇩" },
  { code: "ar", label: "العربية",   flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी",     flag: "🇮🇳" },
  { code: "ur", label: "اردو",      flag: "🇵🇰" },
 
];

const COOKIE_NAME = "googtrans";
const STORAGE_KEY = "site_lang";
const RTL_LANGS = new Set(["ar", "ur", "he", "fa"]);

/* ---------------- cookie helpers ---------------- */

function writeCookie(name, value, { remove = false } = {}) {
  if (typeof document === "undefined") return;
  const expires = remove
    ? "expires=Thu, 01 Jan 1970 00:00:00 GMT"
    : "max-age=31536000";
  document.cookie = `${name}=${value};path=/;${expires}`;
  try {
    const host = window.location.hostname;
    if (host && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      const parts = host.split(".");
      if (parts.length > 1) {
        const root = "." + parts.slice(-2).join(".");
        document.cookie = `${name}=${value};path=/;domain=${root};${expires}`;
      }
    }
  } catch {}
}

function setGoogTransCookie(langCode) {
  writeCookie(COOKIE_NAME, `/en/${langCode}`);
}
function clearGoogTransCookie() {
  writeCookie(COOKIE_NAME, "", { remove: true });
}
function readGoogTransFromCookie() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/* ---------------- banner suppression ---------------- */

function injectHideBannerStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("gtranslate-style")) return;

  const style = document.createElement("style");
  style.id = "gtranslate-style";
  style.innerHTML = `
    /* Hide the Google Translate top banner / toolbar entirely */
    .goog-te-banner-frame.skiptranslate,
    .goog-te-banner-frame,
    iframe.goog-te-banner-frame,
    iframe.skiptranslate,
    .goog-te-balloon-frame,
    .goog-te-ftab,
    .goog-tooltip,
    .goog-tooltip:hover,
    #goog-gt-tt,
    .goog-te-spinner-pos {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* Google pushes <body> down with inline top:40px — neutralise it */
    body { top: 0 !important; position: static !important; }
    html { margin-top: 0 !important; }

    /* Hide our hidden mount node + remove highlight + Google logo */
    #google_translate_element,
    .goog-logo-link,
    .goog-te-gadget-icon { display: none !important; }
    .goog-te-gadget { font-size: 0 !important; height: 0 !important; }
    .goog-text-highlight {
      background: none !important;
      box-shadow: none !important;
    }
  `;
  // Prepend so site CSS can't accidentally override the hide rules later.
  const head = document.head || document.documentElement;
  head.insertBefore(style, head.firstChild);
}

let observerStarted = false;
function startBannerObserver() {
  if (observerStarted || typeof document === "undefined") return;
  observerStarted = true;

  const stripOffsets = () => {
    if (document.body && document.body.style.top) {
      document.body.style.top = "";
    }
    if (
      document.documentElement &&
      document.documentElement.style.marginTop
    ) {
      document.documentElement.style.marginTop = "";
    }
    // Remove the banner iframe if it ever gets re-injected
    document
      .querySelectorAll(
        ".goog-te-banner-frame, iframe.goog-te-banner-frame"
      )
      .forEach((n) => n.remove());
  };

  stripOffsets();
  const obs = new MutationObserver(stripOffsets);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style"],
    childList: true,
    subtree: true,
  });
  if (document.body) {
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
}

/* ---------------- widget loader ---------------- */

let widgetLoaded = false;
function loadGoogleTranslateWidget(includedLangs) {
  if (widgetLoaded || typeof window === "undefined") return;
  widgetLoaded = true;

  // 1) hide styles FIRST (before the script runs)
  injectHideBannerStyles();
  startBannerObserver();

  // 2) hidden mount point
  if (!document.getElementById("google_translate_element")) {
    const div = document.createElement("div");
    div.id = "google_translate_element";
    div.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;visibility:hidden;";
    document.body.appendChild(div);
  }

  // 3) global init callback (must exist before the script loads)
  window.googleTranslateElementInit = function () {
    try {
      /* eslint-disable no-undef */
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: includedLangs,
          autoDisplay: false,
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    } catch {}
    // Re-run cleanup once the widget has finished mounting
    setTimeout(() => {
      injectHideBannerStyles();
      startBannerObserver();
    }, 0);
  };

  if (!document.querySelector('script[data-gtranslate="1"]')) {
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.dataset.gtranslate = "1";
    document.body.appendChild(script);
  }
}

/* ---------------- component ---------------- */

export default function LanguageSwitcher({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const rootRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    // Make sure the suppression styles are in the DOM as early as possible,
    // even if the user has English selected (the widget may not load yet,
    // but if it ever does, the rules are already there).
    injectHideBannerStyles();
    startBannerObserver();

    const saved =
      (typeof localStorage !== "undefined" &&
        localStorage.getItem(STORAGE_KEY)) ||
      readGoogTransFromCookie();

    if (saved && saved !== "en") {
      setCurrent(saved);
      setGoogTransCookie(saved);
      document.documentElement.dir = RTL_LANGS.has(saved) ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }

    const langs = LANGUAGES.map((l) => l.code).join(",");
    loadGoogleTranslateWidget(langs);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Calculate fixed position based on button location so dropdown
  // escapes the sticky header's stacking context
  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  const choose = useCallback((code) => {
    setCurrent(code);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}

    if (code === "en") clearGoogTransCookie();
    else setGoogTransCookie(code);

    // Cookie-based switching + reload is the only reliable way to translate
    // both server-rendered HTML and client-navigated pages consistently.
    window.location.reload();
  }, []);

  const currentLang =
    LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1 hover:text-white notranslate"
        aria-haspopup="listbox"
        aria-expanded={open}
        translate="no"
      >
        <Globe className="h-3 w-3" />
        <span className="font-medium">
          {currentLang.flag} {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div
          role="listbox"
          style={dropdownStyle}
          className="z-[9999] w-56 max-h-80 overflow-y-auto rounded-lg border border-border bg-white text-foreground shadow-2xl notranslate"
          translate="no"
        >
          {LANGUAGES.map((l) => {
            const active = l.code === current;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => choose(l.code)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-emerald-50 ${
                  active
                    ? "bg-emerald-50 font-semibold text-emerald-700"
                    : ""
                }`}
                role="option"
                aria-selected={active}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{l.flag}</span>
                  <span>{l.label}</span>
                </span>
                {active && <Check className="h-4 w-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}