'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useMyOrders } from '@/hooks/useOrder';
import { useWishlist } from '@/hooks/useWishlist';

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_STYLES = {
  delivered: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-sky-100 text-sky-700',
  processing: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  pending: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-700',
  refunded: 'bg-fuchsia-100 text-fuchsia-700',
};

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}

function formatBdt(n) {
  return `SAR ${Number(n || 0).toLocaleString()}`;
}

function Row({ l, v }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-semibold">{v || '—'}</span>
    </div>
  );
}

export default function Account() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { data: ordersResp, isLoading: ordersLoading } = useMyOrders({ limit: 100 });
  const wishlistHook = (() => {
    try { return useWishlist(); } catch { return null; }
  })();

  const orders = ordersResp?.data || [];
  const totalOrders = ordersResp?.pagination?.total ?? orders.length;
  const totalSpent = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    [orders],
  );
  const wishlistCount =
    wishlistHook?.items?.length ??
    wishlistHook?.data?.length ??
    wishlistHook?.count ??
    0;

  const recent = orders.slice(0, 4);

  const fullName =
    profile?.fullName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    user?.fullName ||
    '';

  const defaultAddress =
    (profile?.addresses || []).find((a) => a.isDefault) ||
    (profile?.addresses || [])[0];

  if (!authLoading && !isLoggedIn) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <h2 className="font-display text-xl font-bold">Please sign in</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need to sign in to view your account.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            v: ordersLoading ? '…' : String(totalOrders),
            l: 'Total Orders',
            c: 'from-emerald-500 to-emerald-700',
          },
          {
            v: ordersLoading ? '…' : formatBdt(totalSpent),
            l: 'Total Spent',
            c: 'from-amber-500 to-orange-600',
          },
          {
            v: String(wishlistCount || 0),
            l: 'Wishlisted',
            c: 'from-rose-500 to-pink-600',
          },
          {
            v: String(profile?.rewardPoints ?? 0),
            l: 'Reward Points',
            c: 'from-sky-500 to-blue-600',
          },
        ].map((s) => (
          <div
            key={s.l}
            className={`rounded-xl bg-gradient-to-br ${s.c} p-4 text-white shadow`}
          >
            <div className="font-display text-2xl font-bold">{s.v}</div>
            <div className="text-xs opacity-90">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            View all →
          </Link>
        </div>

        {ordersLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Loading orders…
          </div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              You haven't placed any orders yet.
            </p>
            <Link
              href="/shop"
              className="mt-3 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((o) => {
              const first = o.items?.[0];
              const itemsCount = o.items?.length || 0;
              const moreLabel =
                itemsCount > 1 ? ` +${itemsCount - 1} more` : '';
              return (
                <div
                  key={o._id || o.orderNumber}
                  className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 sm:p-4"
                >
                  <div className="h-14 w-14 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                    {itemsCount}×
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">
                      {first?.name || 'Order'}
                      {moreLabel}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {o.orderNumber} · {formatDate(o.placedAt || o.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatBdt(o.totalAmount)}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                  <Link
                    href={`/account/orders/${o._id || o.orderNumber}`}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Info & Address */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold mb-3">
            Profile Information
          </h3>
          <div className="space-y-3 text-sm">
            <Row l="Full Name" v={fullName} />
            <Row l="Email" v={profile?.email || user?.email} />
            <Row l="Phone" v={profile?.phone} />
            <Row
              l="Date of Birth"
              v={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : ''}
            />
            <Row l="Gender" v={profile?.gender} />
          </div>
          <Link
            href="/account/settings"
            className="mt-4 block w-full rounded-md bg-emerald-600 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Edit Profile
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold mb-3">Default Address</h3>
          {defaultAddress ? (
            <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 p-4 text-sm">
              <div className="font-semibold">🏠 {defaultAddress.label || 'Home'}</div>
              <div className="mt-1 text-muted-foreground">
                {defaultAddress.street}
                <br />
                {[defaultAddress.city, defaultAddress.state, defaultAddress.zipCode]
                  .filter(Boolean)
                  .join(', ')}
                <br />
                {defaultAddress.country}
              </div>
              {profile?.phone && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {profile.phone}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              No default address yet. Add one to speed up checkout.
            </div>
          )}
          <Link
            href="/account/addresses"
            className="mt-4 block w-full rounded-md border border-border py-2 text-center text-sm font-semibold hover:bg-emerald-50"
          >
            Manage Addresses
          </Link>
        </div>
      </div>
    </div>
  );
}
