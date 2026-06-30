"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Premium horizontal product slider
 * Props:
 *   children  – product cards (rendered at their natural size)
 *   autoPlay  – ms between slides (0 = off, default 4000)
 *   gap       – gap between cards in px (default 20)
 *   cardWidth – explicit card width string, e.g. "clamp(200px,28vw,280px)"
 */
export default function ProductSlider({
  children,
  autoPlay = 4000,
  gap = 20,
  cardWidth = "clamp(180px, 28vw, 260px)",
}) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const autoPlayRef = useRef(null);

  const items = Array.isArray(children) ? children : [children];

  /* ── card width helper ── */
  const getCardWidth = useCallback(() => {
    const first = trackRef.current?.children[0];
    return first ? first.offsetWidth + gap : 240;
  }, [gap]);

  /* ── scroll helpers ── */
  const slide = useCallback(
    (dir) => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollBy({ left: dir * getCardWidth() * 2, behavior: "smooth" });
    },
    [getCardWidth]
  );

  const updateButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const sl = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(sl > 4);
    setCanRight(sl < max - 4);
    // update dot index
    const cw = getCardWidth();
    setActiveIndex(Math.round(sl / cw));
  }, [getCardWidth]);

  /* ── auto-play ── */
  const resetAutoPlay = useCallback(() => {
    if (!autoPlay) return;
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
      el.scrollTo({
        left: atEnd ? 0 : el.scrollLeft + getCardWidth() * 2,
        behavior: "smooth",
      });
    }, autoPlay);
  }, [autoPlay, getCardWidth]);

  useEffect(() => {
    resetAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [resetAutoPlay]);

  /* ── drag ── */
  const onMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.pageX, scrollLeft: trackRef.current.scrollLeft };
    clearInterval(autoPlayRef.current);
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    trackRef.current.scrollLeft =
      dragStart.current.scrollLeft - (e.pageX - dragStart.current.x);
  };
  const onMouseUp = () => {
    setIsDragging(false);
    resetAutoPlay();
  };

  /* ── touch ── */
  const onTouchStart = (e) => {
    dragStart.current = {
      x: e.touches[0].pageX,
      scrollLeft: trackRef.current.scrollLeft,
    };
    clearInterval(autoPlayRef.current);
  };
  const onTouchMove = (e) => {
    trackRef.current.scrollLeft =
      dragStart.current.scrollLeft - (e.touches[0].pageX - dragStart.current.x);
  };
  const onTouchEnd = () => resetAutoPlay();

  /* ── dot count ── */
  const dotCount = Math.max(1, items.length - 1);

  return (
    <div className="relative group/slider select-none">
      {/* ══ LEFT BUTTON ══ */}
      <button
        onClick={() => {
          slide(-1);
          resetAutoPlay();
        }}
        aria-label="Previous"
        disabled={!canLeft}
        style={{
          /* sits flush outside the track, blends with the fade */
          position: "absolute",
          left: "-1px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          transition: "opacity .25s, transform .25s",
          opacity: canLeft ? 1 : 0,
          pointerEvents: canLeft ? "auto" : "none",
        }}
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full",
          "shadow-[0_4px_20px_rgba(0,0,0,0.18)]",
          "bg-white/95 backdrop-blur-sm border border-white/60",
          "text-gray-700 hover:bg-white hover:scale-105 active:scale-95",
          "opacity-0 group-hover/slider:opacity-100",
          "transition-all duration-200",
          !canLeft && "!opacity-0 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
      </button>

      {/* ══ TRACK ══ */}
      <div
        ref={trackRef}
        onScroll={updateButtons}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: "flex",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          gap: `${gap}px`,
          paddingBottom: "6px",
          paddingTop: "4px",           /* prevent card shadow clip on top */
          paddingLeft: "2px",
          paddingRight: "2px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: isDragging ? "grabbing" : "grab",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
        }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            style={{
              flex: "none",
              width: cardWidth,
              scrollSnapAlign: "start",
              /* lift cards on hover for depth */
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
            className="hover:z-10 hover:-translate-y-0.5"
          >
            {child}
          </div>
        ))}
      </div>

      {/* ══ RIGHT BUTTON ══ */}
      <button
        onClick={() => {
          slide(1);
          resetAutoPlay();
        }}
        aria-label="Next"
        disabled={!canRight}
        style={{
          position: "absolute",
          right: "-1px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          transition: "opacity .25s, transform .25s",
          opacity: canRight ? 1 : 0,
          pointerEvents: canRight ? "auto" : "none",
        }}
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full",
          "shadow-[0_4px_20px_rgba(0,0,0,0.18)]",
          "bg-white/95 backdrop-blur-sm border border-white/60",
          "text-gray-700 hover:bg-white hover:scale-105 active:scale-95",
          "opacity-0 group-hover/slider:opacity-100",
          "transition-all duration-200",
          !canRight && "!opacity-0 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ChevronRight className="h-4 w-4 stroke-[2.5]" />
      </button>

      {/* ══ PROGRESS DOTS ══ */}
      {items.length > 2 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                const el = trackRef.current;
                if (!el) return;
                el.scrollTo({ left: i * getCardWidth(), behavior: "smooth" });
                resetAutoPlay();
              }}
              style={{
                width: activeIndex === i ? "20px" : "6px",
                height: "6px",
                borderRadius: "9999px",
                border: "none",
                background:
                  activeIndex === i
                    ? "var(--primary, #16a34a)"
                    : "var(--muted-foreground, #94a3b8)",
                opacity: activeIndex === i ? 1 : 0.35,
                transition: "width .3s ease, opacity .3s ease, background .3s ease",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}