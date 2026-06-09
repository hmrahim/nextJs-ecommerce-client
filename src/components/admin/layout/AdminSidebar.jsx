'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   SVG ICON HELPERS  (keeps NAV_GROUPS readable)
───────────────────────────────────────────────────────── */
const Icon = ({ d, d2 }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d2} />}
  </svg>
);

/* ─────────────────────────────────────────────────────────
   NAV GROUPS
───────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  /* ── MAIN ───────────────────────────────────────────── */
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      },
      {
        href: '/dashboard/orders',
        label: 'Orders',
        badge: '12',
        icon: <Icon d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
      },
      {
        href: '/dashboard/products',
        label: 'Products',
        icon: <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
      },
      {
        href: '/dashboard/customers',
        label: 'Customers',
        icon: <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
      },
      {
        href: '/dashboard/returns',
        label: 'Returns & Refunds',
        badge: '3',
        badgeColor: 'amber',
        icon: <Icon d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />,
      },
      {
        href: '/dashboard/dispute',
        label: 'Disputes',
        badge: '5',
        badgeColor: 'red',
        icon: <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
      },
    ],
  },

  /* ── STORE ───────────────────────────────────────────── */
  {
    id: 'store',
    label: 'Store',
    items: [
      {
        href: '/dashboard/categories',
        label: 'Categories',
        icon: <Icon d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
      },
      {
        href: '/dashboard/brands',
        label: 'Brands',
        icon: <Icon d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
      },
      {
        href: '/dashboard/attributes',
        label: 'Attributes',
        icon: <Icon d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />,
      },
  
      {
        href: '/dashboard/inventory',
        label: 'Inventory',
        icon: <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
      },
      {
        href: '/dashboard/bundles',
        label: 'Bundles',
        icon: <Icon d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
      },
      {
        href: '/dashboard/flash-sales',
        label: 'Flash Sales',
        icon: <Icon d="M13 10V3L4 14h7v7l9-11h-7z" />,
      },
      {
        href: '/dashboard/gift-cards',
        label: 'Gift Cards',
        icon: <Icon d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />,
      },
      {
        href: '/dashboard/coupons',
        label: 'Coupons',
        icon: <Icon d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
      },
      {
        href: '/dashboard/reviews',
        label: 'Reviews',
        icon: <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
      },
    ],
  },

  /* ── MARKETING ───────────────────────────────────────── */
  {
    id: 'marketing',
    label: 'Marketing',
    items: [
      {
        href: '/dashboard/campaigns',
        label: 'Campaigns',
        icon: <Icon d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
      },
      {
        href: '/dashboard/promotions',
        label: 'Promotions',
        icon: <Icon d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
      },
      {
        href: '/dashboard/affiliates',
        label: 'Affiliates',
        icon: <Icon d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
      },
      {
        href: '/dashboard/loyalty',
        label: 'Loyalty Points',
        icon: <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      },
      {
        href: '/dashboard/abandoned-carts',
        label: 'Abandoned Carts',
        badge: '8',
        badgeColor: 'amber',
        icon: <Icon d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
      },
    ],
  },

  /* ── SHIPPING ─────────────────────────────────────────── */
  {
    id: 'shipping',
    label: 'Shipping',
    items: [
      {
        href: '/dashboard/shipping-zones',
        label: 'Shipping Zones',
        icon: <Icon d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      },
      {
        href: '/dashboard/couriers',
        label: 'Couriers',
        icon: <Icon d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />,
      },
      {
        href: '/dashboard/tracking',
        label: 'Tracking',
        icon: <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" d2="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
      },
    ],
  },

  /* ── FINANCE ──────────────────────────────────────────── */
  {
    id: 'finance',
    label: 'Finance',
    items: [
      {
        href: '/dashboard/transactions',
        label: 'Transactions',
        icon: <Icon d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />,
      },
      {
        href: '/dashboard/payouts',
        label: 'Payouts',
        icon: <Icon d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
      },
      {
        href: '/dashboard/invoices',
        label: 'Invoices',
        icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      },
      {
        href: '/dashboard/tax-rules',
        label: 'Tax Rules',
        icon: <Icon d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
      },
    ],
  },

  /* ── SUPPORT ──────────────────────────────────────────── */
  {
    id: 'support',
    label: 'Support',
    items: [
      {
        href: '/dashboard/tickets',
        label: 'Tickets',
        badge: '7',
        badgeColor: 'red',
        icon: <Icon d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
      },
      {
        href: '/dashboard/live-chat',
        label: 'Live Chat',
        badge: '2',
        badgeColor: 'emerald',
        icon: <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
      },
      {
        href: '/dashboard/faq',
        label: 'FAQ Manager',
        icon: <Icon d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      },
    ],
  },

  /* ── CONTENT ──────────────────────────────────────────── */
  {
    id: 'content',
    label: 'Content',
    items: [
      {
        href: '/dashboard/banners',
        label: 'Banners',
        icon: <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      },
      {
        href: '/dashboard/blog',
        label: 'Blog / News',
        icon: <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
      },
      {
        href: '/dashboard/pages',
        label: 'Pages',
        icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      },
      {
        href: '/dashboard/popups',
        label: 'Popups',
        icon: <Icon d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />,
      },
    ],
  },

  /* ── ANALYTICS ────────────────────────────────────────── */
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      {
        href: '/dashboard/reports',
        label: 'Reports',
        icon: <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      },
      {
        href: '/dashboard/analytics',
        label: 'Analytics',
        icon: <Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
      },
      {
        href: '/dashboard/visitors',
        label: 'Visitors',
        icon: <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" d2="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
      },
    ],
  },

  /* ── SYSTEM ───────────────────────────────────────────── */
  {
    id: 'system',
    label: 'System',
    items: [
      {
        href: '/dashboard/admin-users',
        label: 'Admin Users',
        icon: <Icon d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      },
      {
        href: '/dashboard/roles',
        label: 'Roles & Permissions',
        icon: <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
      },
      {
        href: '/dashboard/activity-logs',
        label: 'Activity Logs',
        icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
      },
      {
        href: '/dashboard/api-keys',
        label: 'API Keys',
        icon: <Icon d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
      },
      {
        href: '/dashboard/notifications',
        label: 'Notifications',
        icon: <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
      },
      {
        href: '/dashboard/settings',
        label: 'Settings',
        icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" d2="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
      },
      {
        href: '/dashboard/profile',
        label: 'My Profile',
        icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   BADGE COLOR MAP
───────────────────────────────────────────────────────── */
const BADGE_STYLES = {
  default: 'bg-violet-600 text-white',
  red:     'bg-red-500/20 text-red-400 border border-red-500/30',
  amber:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

/* ─────────────────────────────────────────────────────────
   SIDEBAR COMPONENT
───────────────────────────────────────────────────────── */
export default function AdminSidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (id) => {
    if (collapsed) return;
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={cn('admin-sidebar-new', collapsed && 'admin-sidebar-collapsed')}>
      <div className="sidebar-glow" />

      {/* ── Logo + Toggle ── */}
      <div className="sidebar-logo-new">
        <div className="logo-icon-new">M</div>
        <span className={cn(
          'logo-text-new transition-all duration-300 overflow-hidden whitespace-nowrap',
          collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'
        )}>
          Moom24
        </span>
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'sidebar-toggle-btn ml-auto flex-shrink-0',
            'p-1.5 rounded-md transition-all duration-200',
            'hover:bg-white/10 active:scale-90',
            'text-white/60 hover:text-white'
          )}
        >
          <svg
            className={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav-new">
        {NAV_GROUPS.map((group, gi) => {
          const isGroupCollapsed = !!collapsedGroups[group.id];
          return (
            <div key={group.id} className="nav-group-new">
              {gi > 0 && <div className="nav-divider-new" />}

              {!collapsed && (
                <div
                  className="nav-group-header-new cursor-pointer select-none"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className="nav-group-label-new">{group.label}</span>
                  <svg
                    className="group-chevron-new transition-transform duration-200"
                    style={{ transform: isGroupCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}

              <div
                className="nav-group-items-new overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isGroupCollapsed && !collapsed ? '0px' : '1000px',
                  opacity:   isGroupCollapsed && !collapsed ? 0 : 1,
                  pointerEvents: isGroupCollapsed && !collapsed ? 'none' : 'auto',
                }}
              >
                {group.items.map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);

                  const badgeStyle = BADGE_STYLES[item.badgeColor ?? 'default'];

                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn('nav-item-new', isActive && 'nav-item-active')}>
                        {isActive && <span className="nav-active-bar" />}
                        <span className="nav-icon-new flex-shrink-0">{item.icon}</span>

                        <span
                          className="nav-label-new transition-all duration-300 overflow-hidden whitespace-nowrap"
                          style={{
                            opacity:     collapsed ? 0 : 1,
                            width:       collapsed ? 0 : 'auto',
                            marginLeft:  collapsed ? 0 : undefined,
                          }}
                        >
                          {item.label}
                        </span>

                        {item.badge && !collapsed && (
                          <span className={cn('nav-badge-new ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold', badgeStyle)}>
                            {item.badge}
                          </span>
                        )}

                        {collapsed && (
                          <span className="nav-tooltip">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer-new">
        <div className="user-card-new">
          <div className="user-avatar-new flex-shrink-0">AD</div>
          <div
            className="user-info-new transition-all duration-300 overflow-hidden"
            style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          >
            <div className="user-name-new">Admin User</div>
            <div className="user-role-new">Super Admin</div>
          </div>
          {!collapsed && (
            <svg className="user-chevron-new flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          )}
        </div>
      </div>
    </aside>
  );
}