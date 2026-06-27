// 📁 PATH: src/components/client/home/HeroSidePannels.jsx
"use client";

import React from "react";
import Link from "next/link";
import { HeroSlider } from "./HeroSlider";
import { useBanners } from "@/hooks/useBanners";
import { getBannerHref, getBannerImage } from "@/lib/banner-helpers";

const FALLBACK_PANELS = [
  {
    title: "Mega Discounts",
    subtitle: "Min. 40% off",
    image: "https://picsum.photos/seed/promo-1/400/200",
    accent: "from-emerald-500 to-teal-600",
    href: "#",
    buttonText: "Shop now",
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh drops daily",
    image: "https://picsum.photos/seed/promo-2/400/200",
    accent: "from-amber-500 to-orange-600",
    href: "#",
    buttonText: "Shop now",
  },
];

const ACCENTS = [
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

const HeroSidePannels = () => {
  const { banners: panel1 } = useBanners("web_home_side_panel_1");
  const { banners: panel2 } = useBanners("web_home_side_panel_2");


  console.log(panel1,panel2);
  const apiPanels = [...(panel1 || []), ...(panel2 || [])]
    .slice(0, 2)
    .map((b, i) => ({
      title: b.title,
      subtitle: b.subtitle,
      image: getBannerImage(b.image),
      accent: ACCENTS[i % ACCENTS.length],
      href: getBannerHref(b),
      buttonText: b.buttonText || "Shop now",
    }));

  const panels = apiPanels.length > 0 ? apiPanels : FALLBACK_PANELS;

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <HeroSlider />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {panels.map((p, i) => (
          <div
            key={(p.title || "panel") + i}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.accent} p-5 text-white card-hover`}
          >
            <div className="relative z-10">
              <div className="font-display text-lg font-bold">{p.title}</div>
              {p.subtitle && (
                <div className="text-sm opacity-90">{p.subtitle}</div>
              )}
              <Link
                href={p.href || "#"}
                className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/30"
              >
                {p.buttonText} →
              </Link>
            </div>
            {p.image && (
              <img
                src={p.image}
                className="absolute -right-4 -bottom-4 h-24 w-24 rounded-xl object-cover opacity-80"
                alt=""
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSidePannels;
