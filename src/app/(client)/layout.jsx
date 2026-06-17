import { SiteHeader } from '@/components/client/layout/SiteHeader';
import { SiteFooter } from '@/components/client/layout/SiteFooter';
import { MobileBottomNav } from '@/components/client/layout/MobileBottomNav';
import TopLoadingBarWrapper from '@/components/common/Toploadingbarwrapper';



export default function ClientLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
      {/* ── Premium top loading bar (green, matches client brand) ── */}
      <TopLoadingBarWrapper variant="client" />

      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}