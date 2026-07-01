'use client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '@/services/notificationService';

const TYPE_CONFIG = {
  order: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    ),
  },
  user: {
    bg: 'bg-sky-500/15',
    text: 'text-sky-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    ),
  },
  stock: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
  },
  payment: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  review: {
    bg: 'bg-pink-500/15',
    text: 'text-pink-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
  },
  system: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    ),
  },
  shipment: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    ),
  },
  promo: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 3a2 2 0 100-4h-4m-8 0H4a2 2 0 110 4h4m12 0v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7" />
    ),
  }
};

const FALLBACK_CONFIG = {
  bg: 'bg-slate-500/15',
  text: 'text-slate-400',
  icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  )
};

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function AdminHeader({ onToggleSidebar, sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen,   setNotifOpen]     = useState(false);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => notificationService.getAdminNotifications(),
    refetchInterval: 30000,
  });

  const rawNotifications = notifData?.notifications || [];
  const unreadCount = rawNotifications.filter(n => !n.isRead).length;

  const notifications = rawNotifications.map(n => ({
    id: n._id,
    type: n.type,
    title: n.title,
    message: n.message,
    time: formatTimeAgo(n.createdAt),
    unread: !n.isRead
  }));

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  const markOneReadMutation = useMutation({
    mutationFn: (id) => notificationService.markOneRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  const markAllRead = () => {
    markAllReadMutation.mutate();
  };

  const markOneRead = (id) => {
    markOneReadMutation.mutate(id);
  };
  // outside click
  useEffect(() => {
    function handle(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (

    <header className="admin-header-new">
      {/* Toggle */}
      <button className="header-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <svg
          className="toggle-icon-new"
          style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="header-search-new">
        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search…" className="header-search-input" />
      </div>

      {/* Right */}
      <div className="header-right-new">

        {/* ── Notification ── */}
        <div ref={notifRef} className="relative">
          <button
            className="icon-btn-new"
            aria-label="Notifications"
            onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
          >
            <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-[#111118]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#111118] shadow-2xl shadow-black/60 z-50 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-white/5">
                {notifications.map(n => {
                  const cfg = TYPE_CONFIG[n.type];
                  return (
                    <div
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03] ${n.unread ? 'bg-white/[0.02]' : ''}`}
                    >
                      {/* Icon */}
                      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                        <svg className={`w-4 h-4 ${cfg.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {cfg.icon}
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${n.unread ? 'text-white' : 'text-slate-400'}`}>
                            {n.title}
                          </p>
                          {n.unread && (
                            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-violet-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 px-4 py-2.5">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  View all notifications
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

            </div>
          )}
        </div>

        {/* ── Avatar + Profile Dropdown ── */}
        <div ref={profileRef} className="relative">
          <button
            className="header-avatar-new"
            onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
            title="Account menu"
          >
            {initials}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#111118] shadow-2xl shadow-black/50 z-50 overflow-hidden">

              {/* User info */}
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {user?.email || 'admin@moom24.com'}
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 capitalize">
                  {user?.role || 'admin'}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <Link href="/" target="_blank" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Store
                </Link>
              </div>

              <div className="border-t border-white/10 py-1.5">
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
