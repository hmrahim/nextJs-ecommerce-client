'use client';
import { useState } from 'react';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function AdminLayoutClient({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  // 🔴 Single global realtime listener for the entire admin dashboard.
  // Any create / update / delete on the backend automatically refreshes
  // the relevant react-query caches → UI updates instantly.
  useRealtimeSync();

  return (
    <div className="admin-layout-new">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
      />
      <div className="admin-main-new">
        <AdminHeader
          onToggleSidebar={() => setCollapsed(p => !p)}
          sidebarCollapsed={collapsed}
        />
        <main className="admin-content-new">
          {children}
        </main>
      </div>
    </div>
  );
}
