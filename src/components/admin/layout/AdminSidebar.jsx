'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        href: '/dashboard', label: 'Dashboard',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      },
      {
        href: '/dashboard/orders', label: 'Orders', badge: '12',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      },
      {
        href: '/dashboard/products', label: 'Products',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      },
      {
        href: '/dashboard/customers', label: 'Customers',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      },
    ]
  },
  {
    id: 'store',
    label: 'Store',
    items: [
      {
        href: '/dashboard/categories', label: 'Categories',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
      },
      {
        href: '/dashboard/coupons', label: 'Coupons',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
      },
      {
        href: '/dashboard/reviews', label: 'Reviews',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
      },
      {
        href: '/dashboard/inventory', label: 'Inventory',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      {
        href: '/dashboard/reports', label: 'Reports',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      },
      {
        href: '/dashboard/analytics', label: 'Analytics',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      },
    ]
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        href: '/dashboard/settings', label: 'Settings',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      },
      {
        href: '/dashboard/profile', label: 'My Profile',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      },
    ]
  },
];

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

      {/* Logo + Toggle */}
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

      {/* Nav */}
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
                  maxHeight: isGroupCollapsed && !collapsed ? '0px' : '500px',
                  opacity: isGroupCollapsed && !collapsed ? 0 : 1,
                  pointerEvents: isGroupCollapsed && !collapsed ? 'none' : 'auto',
                }}
              >
                {group.items.map((item) => {
                  // exact match for /dashboard, startsWith for nested
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn('nav-item-new', isActive && 'nav-item-active')}>
                        {isActive && <span className="nav-active-bar" />}
                        <span className="nav-icon-new flex-shrink-0">{item.icon}</span>
                        <span
                          className="nav-label-new transition-all duration-300 overflow-hidden whitespace-nowrap"
                          style={{
                            opacity: collapsed ? 0 : 1,
                            width: collapsed ? 0 : 'auto',
                            marginLeft: collapsed ? 0 : undefined,
                          }}
                        >
                          {item.label}
                        </span>
                        {item.badge && !collapsed && (
                          <span className="nav-badge-new">{item.badge}</span>
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

      {/* Footer */}
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
