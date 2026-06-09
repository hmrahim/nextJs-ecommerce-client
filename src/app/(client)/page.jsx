import HeroBanner from '@/components/client/home/HeroBanner';
import FeaturedProducts from '@/components/client/home/FeaturedProducts';
import CategoryShowcase from '@/components/client/home/CategoryShowcase';
import { generateMetadata as meta } from '@/lib/seo';
import { useSession } from "next-auth/react"
export const metadata = meta({ title: 'Home' });

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryShowcase />
      <FeaturedProducts />
    </>
  );
}
