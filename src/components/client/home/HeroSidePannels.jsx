import React from 'react';
import { HeroSlider } from './HeroSlider';

const HeroSidePannels = () => {
    return (
         <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <HeroSlider />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {[
            { t: "Mega Discounts", s: "Min. 40% off", img: "https://picsum.photos/seed/promo-1/400/200", c: "from-emerald-500 to-teal-600" },
            { t: "New Arrivals", s: "Fresh drops daily", img: "https://picsum.photos/seed/promo-2/400/200", c: "from-amber-500 to-orange-600" }
          ].map((p) => (
            <div key={p.t} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.c} p-5 text-white card-hover`}>
              <div className="font-display text-lg font-bold">{p.t}</div>
              <div className="text-sm opacity-90">{p.s}</div>
              <button className="mt-3 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/30">Shop now →</button>
              <img src={p.img} className="absolute -right-4 -bottom-4 h-24 w-24 rounded-xl object-cover opacity-80" alt="" />
            </div>
          ))}
        </div>
      </section>
    );
};

export default HeroSidePannels;