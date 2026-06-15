// 📁 PATH: src/components/client/layout/UserAccountMenu.jsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  User, ChevronDown, LogOut, Package, Heart, MapPin, Gift,
  Star, CreditCard, Settings, Bell, LayoutDashboard, Store,
  UserCircle2, LogIn, UserPlus, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Amazon / Noon style user account menu.
 * - Logged-out → "Hello, Sign in" trigger → dropdown with Sign In + Register CTAs
 * - Logged-in  → "Hello, {firstName}" + "Account & Lists" → full account dropdown
 *
 * Renders only its own trigger + dropdown. Drop this into SiteHeader where the
 * old static `/account` link used to live.
 */
export function UserAccountMenu() {
  const { user, isLoggedIn, loading, logout, isAdmin, isSeller } = useAuth();

  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef(null);
  const closeTimer = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Hover open with small delay (Amazon-style)
  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      await logout();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  };

  // ── Trigger label ──────────────────────────────────────────────
  const greeting = loading
    ? "Hello,"
    : isLoggedIn
      ? `Hello, ${user?.firstName || "there"}`
      : "Hello, Sign in";
  const subLabel = isLoggedIn ? "Account & Lists" : "Account & Lists";

  return (
    <div
      ref={wrapRef}
      className="relative hidden md:block"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
      >
        {isLoggedIn && user?.image ? (
          <img
            src={user.image}
            alt={user.fullName || "Account"}
            className="h-6 w-6 rounded-full object-cover ring-2 ring-amber-300/60"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
        <div className="hidden xl:block text-left text-xs leading-tight">
          <div className="text-emerald-200/70 truncate max-w-[140px]">{greeting}</div>
          <div className="font-semibold flex items-center gap-1">
            {subLabel} <ChevronDown className="h-3 w-3 opacity-70" />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-2xl animate-in fade-in zoom-in-95"
        >
          {/* Caret */}
          <span className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 border-l border-t border-border bg-white" />

          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> &nbsp;Loading…
            </div>
          ) : isLoggedIn ? (
            <LoggedInMenu
              user={user}
              isAdmin={isAdmin}
              isSeller={isSeller}
              onLogout={handleLogout}
              signingOut={signingOut}
              onItemClick={() => setOpen(false)}
            />
          ) : (
            <LoggedOutMenu onItemClick={() => setOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Logged-out view ─────────────────────────── */

function LoggedOutMenu({ onItemClick }) {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-2">
        <Link
          href="/auth/login"
          onClick={onItemClick}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-sm font-bold text-emerald-950 hover:from-amber-500 hover:to-amber-600"
        >
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          New customer?{" "}
          <Link
            href="/auth/register"
            onClick={onItemClick}
            className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
          >
            <UserPlus className="h-3 w-3" /> Start here
          </Link>
        </p>
      </div>

      <div className="my-3 h-px bg-border" />

      <div className="grid grid-cols-2 gap-1 text-xs">
        <MenuLink href="/account/orders" icon={Package} label="Your Orders" onClick={onItemClick} />
        <MenuLink href="/wishlist" icon={Heart} label="Wishlist" onClick={onItemClick} />
        <MenuLink href="/account/vouchers" icon={Gift} label="Vouchers" onClick={onItemClick} />
        <MenuLink href="/help" icon={Bell} label="Help Center" onClick={onItemClick} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Logged-in view ─────────────────────────── */

function LoggedInMenu({ user, isAdmin, isSeller, onLogout, signingOut, onItemClick }) {
  return (
    <div>
      {/* Header / identity */}
      <Link
        href="/account"
        onClick={onItemClick}
        className="flex items-center gap-3 bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white hover:from-emerald-700 hover:to-emerald-800"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.fullName || "Account"}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-300"
          />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-400 font-bold text-emerald-950 ring-2 ring-amber-300">
            {initials(user)}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{user?.fullName || "Your Account"}</div>
          <div className="truncate text-xs text-emerald-100/80">{user?.email}</div>
          <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {user?.role || "buyer"}
          </div>
        </div>
      </Link>

      {/* Role-specific quick links */}
      {(isAdmin || isSeller) && (
        <div className="border-b border-border bg-emerald-50/60 px-2 py-2">
          {isAdmin && (
            <MenuRow
              href="/dashboard"
              icon={LayoutDashboard}
              label="Admin Dashboard"
              accent
              onClick={onItemClick}
            />
          )}
          {isSeller && (
            <MenuRow
              href="/dashboard"
              icon={Store}
              label="Seller Dashboard"
              accent
              onClick={onItemClick}
            />
          )}
        </div>
      )}

      {/* Main account links */}
      <div className="py-1">
        <MenuRow href="/account" icon={UserCircle2} label="Account Overview" onClick={onItemClick} />
        <MenuRow href="/account/orders" icon={Package} label="Your Orders" onClick={onItemClick} />
        <MenuRow href="/wishlist" icon={Heart} label="Wishlist" onClick={onItemClick} />
        <MenuRow href="/account/addresses" icon={MapPin} label="Addresses" onClick={onItemClick} />
        <MenuRow href="/account/payment-methods" icon={CreditCard} label="Payment Methods" onClick={onItemClick} />
        <MenuRow href="/account/vouchers" icon={Gift} label="Vouchers & Coupons" onClick={onItemClick} />
        <MenuRow href="/account/rewards" icon={Star} label="Rewards" onClick={onItemClick} />
        <MenuRow href="/account/reviews" icon={Star} label="My Reviews" onClick={onItemClick} />
        <MenuRow href="/account/notifications" icon={Bell} label="Notifications" onClick={onItemClick} />
        <MenuRow href="/account/settings" icon={Settings} label="Settings" onClick={onItemClick} />
      </div>

      {/* Sign out */}
      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onLogout}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
        >
          {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── shared bits ─────────────────────────── */

function MenuRow({ href, icon: Icon, label, accent = false, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
        accent
          ? "font-semibold text-emerald-800 hover:bg-emerald-100"
          : "text-foreground hover:bg-emerald-50"
      }`}
    >
      <Icon className="h-4 w-4 opacity-80" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function MenuLink({ href, icon: Icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-emerald-50"
    >
      <Icon className="h-3.5 w-3.5 opacity-80" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function initials(user) {
  const a = (user?.firstName || "").trim()[0];
  const b = (user?.lastName || "").trim()[0];
  const fallback = (user?.email || "U").trim()[0];
  return ((a || "") + (b || "") || fallback).toUpperCase();
}

export default UserAccountMenu;
