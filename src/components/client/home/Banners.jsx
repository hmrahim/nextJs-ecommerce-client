// 📁 PATH: src/components/client/home/Banners.jsx
"use client";

import Link from "next/link";
import React from "react";
import { useBanners } from "@/hooks/useBanners";
import { getBannerHref, getBannerImage } from "@/lib/banner-helpers";

const ACCENTS = [
  "from-emerald-700 to-emerald-900",
  "from-amber-600 to-orange-700",
];

const FALLBACK = [
  {
    title: "Become a Seller",
    subtitle: "Reach millions of customers. Open a store in 5 minutes.",
    buttonText: "Start Selling",
    href: "/become-seller",
    image: "https://picsum.photos/seed/seller-cta/800/300",
  },
  {
    title: "Download Our App",
    subtitle: "Faster checkout, exclusive app-only deals & notifications.",
    buttonText: "Get the App",
    href: "/app",
    image: "https://picsum.photos/seed/app-cta/800/300",
  },
];

const Banners = () => {
  const { banners: promo1 } = useBanners("web_home_promo_banner_1");
  const { banners: promo2 } = useBanners("web_home_promo_banner_2");

  const apiBanners = [...(promo1 || []), ...(promo2 || [])]
    .slice(0, 2)
    .map((b) => ({
      title: b.title,
      subtitle: b.subtitle,
      buttonText: b.buttonText || "Shop now",
      href: getBannerHref(b),
      image: getBannerImage(b.image),
    }));

  const items = apiBanners.length > 0 ? apiBanners : FALLBACK;

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {items.map((b, i) => (
        <div
          key={(b.title || "banner") + i}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${ACCENTS[i % ACCENTS.length]} p-5 sm:p-8 text-white`}
        >
          <div className="relative z-10 max-w-sm">
            <h3 className="font-display text-xl sm:text-2xl font-bold">
              {b.title}
            </h3>
            {b.subtitle && <p className="mt-2 text-white/85">{b.subtitle}</p>}
            {b.href && b.href !== "#" && (
              <Link
                href={b.href}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-800 hover:bg-amber-300"
              >
                {b.buttonText} →
              </Link>
            )}
          </div>
          {b.image && (
            <img
              src={b.image}
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-40"
              alt=""
            />
          )}
        </div>
      ))}
    </section>
  );
};

export default Banners;
