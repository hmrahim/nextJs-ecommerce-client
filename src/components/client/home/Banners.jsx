import Link from 'next/link';
import React from 'react';

const Banners = () => {
    return (
        <section className="grid gap-3 md:grid-cols-2">
            {[
                { t: "Become a Seller", s: "Reach millions of customers. Open a store in 5 minutes.", b: "Start Selling", h: "/become-seller", img: "https://picsum.photos/seed/seller-cta/800/300", c: "from-emerald-700 to-emerald-900" },
                { t: "Download Our App", s: "Faster checkout, exclusive app-only deals & notifications.", b: "Get the App", h: "/app", img: "https://picsum.photos/seed/app-cta/800/300", c: "from-amber-600 to-orange-700" }
            ].map((b) => (
                <div key={b.t} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.c} p-5 sm:p-8 text-white`}>
                    <div className="relative z-10 max-w-sm">
                        <h3 className="font-display text-xl sm:text-2xl font-bold">{b.t}</h3>
                        <p className="mt-2 text-white/85">{b.s}</p>
                        <Link href={b.h} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-800 hover:bg-amber-300">{b.b} →</Link>
                    </div>
                    <img src={b.img} className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-40" alt="" />
                </div>
            ))}
        </section>
    );
};

export default Banners;