// 📁 PATH: src/components/client/home/HeroSlider.jsx
"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heroSlides } from "@/lib/shop-data";
import { useBanners } from "@/hooks/useBanners";
import { getBannerHref, getBannerImage } from "@/lib/banner-helpers";

const AUTOPLAY_MS = 5000;

export function HeroSlider() {
  const { banners, loading } = useBanners("web_home_hero_slider");
 

  // Map backend banners -> slide shape; fallback to static heroSlides when empty.
  const slides =
    banners && banners.length > 0
      ? banners.map((b) => ({
          id: b._id,
          image: getBannerImage(b.image),
          eyebrow: b.buttonText || "Featured",
          title: b.title,
          subtitle: b.subtitle,
          cta: b.buttonText || "Shop now",
          href: getBannerHref(b),
          accent: "from-emerald-700/70 via-emerald-800/40 to-transparent",
        }))
      : heroSlides;

  const [slide, setSlide] = useState(0);
  const timerRef = useRef(null);

  // Reset index whenever the slide set changes.
  useEffect(() => {
    setSlide(0);
  }, [slides.length]);

  // Auto-slide every AUTOPLAY_MS.
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setSlide((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length > 1) {
      timerRef.current = setInterval(() => {
        setSlide((i) => (i + 1) % slides.length);
      }, AUTOPLAY_MS);
    }
  };

  if (loading && slides.length === 0) {
    return (
      <div className="relative h-[200px] sm:h-[280px] md:h-[420px] w-full animate-pulse rounded-2xl bg-gray-200" />
    );
  }

  const hero = slides[slide] || slides[0];
  if (!hero) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <img
        src={hero.image}
        alt={hero.title || ""}
        className="h-[200px] w-full object-cover sm:h-[280px] md:h-[420px] transition-opacity duration-700"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-r ${hero.accent || "from-emerald-700/70 via-emerald-800/40 to-transparent"} opacity-85`}
      />
      <div className="absolute inset-0 flex flex-col justify-center gap-2 p-4 sm:p-8 md:p-14 text-white">
        {hero.eyebrow && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-400/95 px-3 py-1 text-xs font-bold text-emerald-950">
            <Sparkles className="h-3 w-3" /> {hero.eyebrow}
          </span>
        )}
        <h1 className="font-display max-w-2xl text-xl sm:text-3xl font-extrabold md:text-5xl">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className="hidden sm:block max-w-xl text-white/90 md:text-lg">
            {hero.subtitle}
          </p>
        )}
        {hero.href && hero.href !== "#" && (
          <Link
            href={hero.href}
            className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 hover:bg-amber-300"
          >
            {hero.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id || i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setSlide(i);
                restartTimer();
              }}
              className={`h-2 rounded-full transition-all ${
                i === slide ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroSlider;
