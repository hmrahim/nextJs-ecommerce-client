"use client";
import React from "react";
import SectionHeader from "./SectionHeader";
import { Tag, Shirt, Smartphone, Home, Utensils, Dumbbell, BookOpen, Heart, Car, Gem, Gift, Music, Camera, Baby, Leaf, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/client/useCategories";

/* ── per-category gradient + icon palette (cycles by index) ── */
const PALETTES = [
  { from: "#fde68a", to: "#fbbf24", icon: <Gift   className="h-6 w-6 text-amber-700"   /> },
  { from: "#a7f3d0", to: "#34d399", icon: <Leaf   className="h-6 w-6 text-emerald-700" /> },
  { from: "#bfdbfe", to: "#60a5fa", icon: <Smartphone className="h-6 w-6 text-blue-700"  /> },
  { from: "#fecdd3", to: "#fb7185", icon: <Heart  className="h-6 w-6 text-rose-700"    /> },
  { from: "#ddd6fe", to: "#a78bfa", icon: <Music  className="h-6 w-6 text-violet-700"  /> },
  { from: "#fed7aa", to: "#fb923c", icon: <Utensils className="h-6 w-6 text-orange-700"/> },
  { from: "#cffafe", to: "#22d3ee", icon: <Camera className="h-6 w-6 text-cyan-700"    /> },
  { from: "#dcfce7", to: "#86efac", icon: <Dumbbell className="h-6 w-6 text-green-700" /> },
  { from: "#fae8ff", to: "#e879f9", icon: <Gem    className="h-6 w-6 text-fuchsia-700" /> },
  { from: "#ffedd5", to: "#fdba74", icon: <Baby   className="h-6 w-6 text-orange-600"  /> },
  { from: "#f0fdf4", to: "#4ade80", icon: <Shirt  className="h-6 w-6 text-green-600"   /> },
  { from: "#eff6ff", to: "#93c5fd", icon: <Car    className="h-6 w-6 text-blue-600"    /> },
  { from: "#fef9c3", to: "#fde047", icon: <BookOpen className="h-6 w-6 text-yellow-700"/> },
  { from: "#f3e8ff", to: "#c084fc", icon: <Gamepad2 className="h-6 w-6 text-purple-700"/>},
  { from: "#ffe4e6", to: "#fda4af", icon: <Home   className="h-6 w-6 text-rose-600"    /> },
];

/* ── keyframe injected once ── */
const STYLE_ID = "cat-marquee-style";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .cat-track {
      display: flex;
      width: max-content;
      animation: marquee 28s linear infinite;
      will-change: transform;
    }
    .cat-track:hover {
      animation-play-state: paused;
    }
    .cat-wrapper {
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    }
  `;
  document.head.appendChild(s);
}

function SkeletonItem() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-3 w-[88px] shrink-0">
      <div className="h-14 w-14 rounded-full bg-muted" />
      <div className="h-2.5 w-12 rounded bg-muted" />
    </div>
  );
}

function CategoryItem({ c, index = 0 }) {
  const palette = PALETTES[index % PALETTES.length];

  return (
    <Link
      href={`/category/${c.slug}`}
      className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-3 w-[88px] shrink-0 text-center
        hover:shadow-[0_4px_18px_rgba(16,185,129,0.13)]
        transition-all duration-200"
      style={{
        border: "1px solid #e5e7eb",       /* fixed: gray-200, never black */
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#6ee7b7"}   /* emerald-300 */
      onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}
    >
      {/* avatar */}
      <div
        className="relative h-14 w-14 rounded-full overflow-hidden
          ring-2 ring-transparent group-hover:ring-emerald-300
          transition-all duration-200 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        }}
      >
        {c.image ? (
          <img
            src={c.image}
            alt={c.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          /* no image → coloured gradient circle with matching lucide icon */
          <span className="flex h-full w-full items-center justify-center drop-shadow-sm">
            {palette.icon}
          </span>
        )}
      </div>

      {/* label */}
      <span className="text-[11px] font-semibold leading-tight line-clamp-2 text-gray-600 group-hover:text-emerald-700 transition-colors duration-200">
        {c.name}
      </span>
    </Link>
  );
}

const CategoriesByShop = () => {
  const { data: categories = [], isLoading } = useCategories();

  /* duplicate list so it loops seamlessly */
  const doubled = [...categories, ...categories];

  return (
    <section>
      <SectionHeader
        icon={<Tag className="h-5 w-5" />}
        title="Shop by Category"
        link="/shop"
      />

      <div className="cat-wrapper">
        {isLoading ? (
          /* skeleton: static row */
          <div className="flex gap-3 pb-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : (
          <div className="cat-track gap-3">
            {doubled.map((c, i) => (
              <div key={`${c._id}-${i}`} className="px-1.5">
                <CategoryItem c={c} index={i % categories.length} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesByShop;