import HeroSidePannels from "@/components/client/home/HeroSidePannels";
import ServiceStrip from "@/components/client/home/ServiceStrip";
import CategoriesByShop from "@/components/client/home/CategoriesByShop";
import FlashSale from "@/components/client/home/FlashSale";
import Trending from "@/components/client/home/Trending";
import FeaturedProducts from "@/components/client/home/FeaturedProducts";
import Vendor from "@/components/client/home/Vendor";
import Banners from "@/components/client/home/Banners";
import Recommended from "@/components/client/home/Recommended";

export default function Home() {
  return (
    <div className="container-x py-4 space-y-10">
      {/* Hero + side panels */}
      <HeroSidePannels />

      {/* Service strip */}
      <ServiceStrip />

      {/* Categories */}
      <CategoriesByShop />

      {/* Flash sale */}
      <FlashSale />

      {/* Trending */}
      <Trending />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Banners */}
      <Banners />

      {/* Recommended */}
      <Recommended />

      {/* Top Vendors */}
      <Vendor />
    </div>
  );
}