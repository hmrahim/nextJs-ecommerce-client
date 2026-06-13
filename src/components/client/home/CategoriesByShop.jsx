"use client";
import React from "react";
import SectionHeader from "./SectionHeader";
import { Tag } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/client/useCategories";

function SkeletonItem() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-1 rounded-xl border border-border bg-white p-2 sm:p-3">
      <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-muted" />
      <div className="h-3 w-12 rounded bg-muted" />
    </div>
  );
}

const CategoriesByShop = () => {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <section>
      <SectionHeader
        icon={<Tag className="h-5 w-5" />}
        title="Shop by Category"
        link="/shop"
      />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonItem key={i} />)
          : categories.map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white p-2 sm:p-3 text-center card-hover"
              >
                <div className="grid h-10 w-10 sm:h-14 sm:w-14 place-items-center rounded-full bg-emerald-50 overflow-hidden">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl">{c.icon ?? "🛍️"}</span>
                  )}
                </div>
                <div className="text-xs font-medium line-clamp-1">{c.name}</div>
              </Link>
            ))
        }
      </div>
    </section>
  );
};

export default CategoriesByShop;