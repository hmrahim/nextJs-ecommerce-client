'use client';
import { useState } from 'react';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

export default function AdminLayoutClient({ children }) {
  const [collapsed, setCollapsed] = useState(false);

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