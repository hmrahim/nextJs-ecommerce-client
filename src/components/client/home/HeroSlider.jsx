"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { heroSlides } from "@/lib/shop-data";
import { useState } from "react";

export function HeroSlider() {
  const [slide, setSlide] = useState(0);
  const hero = heroSlides[slide];

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <img src={hero.image} alt="" className="h-[200px] w-full object-cover sm:h-[280px] md:h-[420px]" />
      <div className={`absolute inset-0 bg-gradient-to-r ${hero.accent} opacity-85`} />
      <div className="absolute inset-0 flex flex-col justify-center gap-2 p-4 sm:p-8 md:p-14 text-white">
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-400/95 px-3 py-1 text-xs font-bold text-emerald-950">
          <Sparkles className="h-3 w-3" /> {hero.eyebrow}
        </span>
        <h1 className="font-display max-w-2xl text-xl sm:text-3xl font-extrabold md:text-5xl">{hero.title}</h1>
        <p className="hidden sm:block max-w-xl text-white/90 md:text-lg">{hero.subtitle}</p>
        <Link
          href={hero.href}
          className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 hover:bg-amber-300"
        >
          {hero.cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSlide(i)}
            className={`h-2 rounded-full transition-all ${i === slide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
