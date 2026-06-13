"use client"
import React from "react";
import SectionHeader from "./SectionHeader";
import { vendors, products } from "@/lib/shop-data";
import { Award, BadgeCheck, Star } from "lucide-react";
import Link from "next/link";

const Vendor = () => {
  return (
    <section>
      <SectionHeader
        icon={<Award className="h-5 w-5" />}
        title="Top Vendors This Month"
        link="/vendors"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.slice(0, 6).map((v) => {
          const vendorProducts = products
            .filter((p) => p.vendor.id === v.id)
            .slice(0, 3);

          return (
            <Link
              key={v.id}
              href={`/vendor/${v.slug}`}
              className="overflow-hidden rounded-2xl border border-border bg-card card-hover"
            >
              {/* Banner */}
              <div className="relative h-24">
                <img
                  src={v.banner}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Logo + Info */}
              <div className="relative -mt-8 flex items-center gap-3 p-4">
                <img
                  src={v.logo}
                  className="h-14 w-14 rounded-xl border-4 border-white object-cover"
                  alt=""
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate font-semibold">
                    {v.name}
                    {v.verified && (
                      <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {v.rating} · {v.followers.toLocaleString()} followers
                  </div>
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Follow
                </button>
              </div>

              {/* Product thumbnails */}
              <div className="grid grid-cols-3 gap-1 p-2 pt-0">
                {vendorProducts.map((p) => (
                  <img
                    key={p.id}
                    src={p.image}
                    alt=""
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Vendor;