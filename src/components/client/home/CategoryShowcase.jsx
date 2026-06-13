"use client";
import Link from "next/link";
import { useCategories } from "@/hooks/client/useCategories";

function SkeletonItem() {
  return (
    <div className="animate-pulse bg-muted rounded-xl p-6 text-center">
      <div className="h-10 w-10 mx-auto rounded-full bg-muted-foreground/20 mb-2" />
      <div className="h-3 w-16 mx-auto rounded bg-muted-foreground/20" />
    </div>
  );
}

export default function CategoryShowcase() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)
          : categories.slice(0, 8).map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="bg-gray-50 hover:bg-emerald-50 rounded-xl p-6 text-center transition-colors card-hover"
              >
                <div className="h-10 w-10 mx-auto mb-2 rounded-full overflow-hidden bg-emerald-100 grid place-items-center">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">{c.icon ?? "🛍️"}</span>
                  )}
                </div>
                <p className="font-medium text-sm">{c.name}</p>
              </Link>
            ))
        }
      </div>
    </section>
  );
}