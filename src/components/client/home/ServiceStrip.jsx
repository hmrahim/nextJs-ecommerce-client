import React from 'react';

const ServiceStrip = () => {
    return (
        <section className="grid grid-cols-2 gap-2 rounded-2xl bg-emerald-50 p-3 md:grid-cols-4">
            {[
                { i: "🚚", t: "Free Shipping", s: "Orders over SAR 999" },
                { i: "↩️", t: "7-Day Returns", s: "Easy refund policy" },
                { i: "🔒", t: "Secure Checkout", s: "100% protected" },
                { i: "🎁", t: "Rewards Program", s: "Earn on every order" }
            ].map((b) => (
                <div key={b.t} className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <div className="text-2xl">{b.i}</div>
                    <div><div className="text-sm font-semibold">{b.t}</div><div className="text-xs text-muted-foreground">{b.s}</div></div>
                </div>
            ))}
        </section>
    );
};

export default ServiceStrip;