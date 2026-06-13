"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";

export function MobileBottomNav() {
  const path = usePathname();
  const active = (href) => path === href;

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: 3 },
    { href: "/wishlist", icon: Heart, label: "Saved", badge: 12 },
    { href: "/account", icon: User, label: "Account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-white shadow-lg md:hidden">
      {items.map(({ href, icon: Icon, label, badge }) => (
        <Link
          key={href}
          href={href}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${
            active(href)
              ? "text-emerald-700"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="relative">
            <Icon className={`h-5 w-5 ${active(href) ? "stroke-[2.5]" : ""}`} />
            {badge && (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-0.5 text-[9px] font-bold text-emerald-950">
                {badge}
              </span>
            )}
          </div>
          <span>{label}</span>
          {active(href) && (
            <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-emerald-600" />
          )}
        </Link>
      ))}
    </nav>
  );
}
