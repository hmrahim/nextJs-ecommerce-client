"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  Ticket,
  Star,
  Gift,
  Bell,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    label: "Orders",
    href: "/account/orders",
    icon: ShoppingBag,
  },
  {
    label: "Payment Methods",
    href: "/account/payment-methods",
    icon: CreditCard,
  },
  {
    label: "Vouchers",
    href: "/account/vouchers",
    icon: Ticket,
    badge: 3,
  },
  {
    label: "Reviews",
    href: "/account/reviews",
    icon: Star,
  },
  {
    label: "Rewards",
    href: "/account/rewards",
    icon: Gift,
  },
  {
    label: "Notifications",
    href: "/account/notifications",
    icon: Bell,
    badge: 5,
  },
];

// --- Mock user data (replace with real data from props/context/API) ---
const user = {
  initials: "SK",
  name: "Sarah Khan",
  email: "sarah.khan@example.com",
  tier: "Gold Member",
  points: 1240,
  nextTierPoints: 380,
  nextTier: "Platinum",
  progressPercent: 75, // (1240 / (1240 + 380)) * 100
};

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="space-y-4 lg:sticky lg:top-32 h-fit">
      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        {/* Avatar */}
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white">
          {user.initials}
        </div>

        {/* Name & Email */}
        <div className="mt-3 font-semibold text-sm">{user.name}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>

        {/* Tier Badge */}
        <div className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs">
          <span className="font-bold text-emerald-700">🏅 {user.tier}</span>
          <div className="text-muted-foreground mt-0.5">
            {user.points.toLocaleString()} points · {user.nextTierPoints} to{" "}
            {user.nextTier}
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-emerald-100">
            <div
              className="h-1.5 rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${user.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Card */}
      <nav className="rounded-xl border border-border bg-card p-2">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          // Matches exact path AND any nested routes under it
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-1.5 h-px bg-border" />

        {/* Logout */}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Logout
        </button>
      </nav>
    </aside>
  );
}