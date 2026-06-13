import { SiteHeader } from '@/components/client/layout/SiteHeader';
import { SiteFooter } from '@/components/client/layout/SiteFooter';
import { MobileBottomNav } from '@/components/client/layout/MobileBottomNav';

export default function ClientLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
