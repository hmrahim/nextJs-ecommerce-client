import Navbar from '@/components/client/layout/Navbar';
import Footer from '@/components/client/layout/Footer';
import CartDrawer from '@/components/client/cart/CartDrawer';

export default function ClientLayout({ children }) {
  return (
    <>
   
      <main className="min-h-screen">{children}</main>
    
    </>
  );
}
