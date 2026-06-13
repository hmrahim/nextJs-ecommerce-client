const categories = [
  { slug: "electronics", name: "Electronics", icon: "\u{1F4F1}", image: "https://picsum.photos/seed/electronics/600/400", subcategories: ["Smartphones", "Laptops", "Cameras", "Audio", "Wearables", "Accessories"] },
  { slug: "fashion", name: "Fashion", icon: "\u{1F455}", image: "https://picsum.photos/seed/fashion/600/400", subcategories: ["Men", "Women", "Kids", "Shoes", "Bags", "Jewelry"] },
  { slug: "home-living", name: "Home & Living", icon: "\u{1F6CB}\uFE0F", image: "https://picsum.photos/seed/home/600/400", subcategories: ["Furniture", "Decor", "Kitchen", "Bedding", "Lighting", "Storage"] },
  { slug: "beauty", name: "Beauty & Health", icon: "\u{1F484}", image: "https://picsum.photos/seed/beauty/600/400", subcategories: ["Skincare", "Makeup", "Haircare", "Fragrance", "Wellness", "Personal care"] },
  { slug: "groceries", name: "Groceries", icon: "\u{1F966}", image: "https://picsum.photos/seed/grocery/600/400", subcategories: ["Fruits", "Vegetables", "Dairy", "Snacks", "Beverages", "Organic"] },
  { slug: "sports", name: "Sports & Outdoor", icon: "\u26BD", image: "https://picsum.photos/seed/sports/600/400", subcategories: ["Fitness", "Cycling", "Camping", "Footwear", "Apparel", "Team Sports"] },
  { slug: "toys", name: "Toys & Baby", icon: "\u{1F9F8}", image: "https://picsum.photos/seed/toys/600/400", subcategories: ["Educational", "Outdoor toys", "Diapers", "Baby food", "Strollers", "Puzzles"] },
  { slug: "automotive", name: "Automotive", icon: "\u{1F697}", image: "https://picsum.photos/seed/auto/600/400", subcategories: ["Car care", "Accessories", "Tires", "Tools", "Parts", "Motorcycle"] },
  { slug: "books", name: "Books & Stationery", icon: "\u{1F4DA}", image: "https://picsum.photos/seed/books/600/400", subcategories: ["Fiction", "Academic", "Notebooks", "Office", "Art supplies", "Kids books"] },
  { slug: "pets", name: "Pet Supplies", icon: "\u{1F43E}", image: "https://picsum.photos/seed/pets/600/400", subcategories: ["Dog", "Cat", "Birds", "Aquarium", "Food", "Toys"] }
];
const vendors = [
  { id: "v1", slug: "techverse", name: "TechVerse Official", banner: "https://picsum.photos/seed/techverse-b/1600/400", logo: "https://picsum.photos/seed/techverse-l/120/120", rating: 4.8, followers: 128400, products: 1284, location: "Dhaka, BD", since: "2019", verified: true, description: "Authorized retailer of leading electronics brands. Genuine warranty on every product." },
  { id: "v2", slug: "greenleaf-organics", name: "GreenLeaf Organics", banner: "https://picsum.photos/seed/greenleaf-b/1600/400", logo: "https://picsum.photos/seed/greenleaf-l/120/120", rating: 4.9, followers: 56200, products: 312, location: "Chittagong, BD", since: "2021", verified: true, description: "Farm-fresh organic produce delivered to your door within 24 hours." },
  { id: "v3", slug: "urbanthread", name: "Urban Thread Co.", banner: "https://picsum.photos/seed/urban-b/1600/400", logo: "https://picsum.photos/seed/urban-l/120/120", rating: 4.7, followers: 94300, products: 842, location: "Dhaka, BD", since: "2018", verified: true, description: "Contemporary fashion for the modern city dweller." },
  { id: "v4", slug: "homecraft", name: "HomeCraft Studio", banner: "https://picsum.photos/seed/home-b/1600/400", logo: "https://picsum.photos/seed/home-l/120/120", rating: 4.6, followers: 41100, products: 506, location: "Sylhet, BD", since: "2020", verified: true, description: "Handcrafted home decor and furniture made by local artisans." },
  { id: "v5", slug: "playzone", name: "PlayZone Toys", banner: "https://picsum.photos/seed/playzone-b/1600/400", logo: "https://picsum.photos/seed/playzone-l/120/120", rating: 4.5, followers: 22800, products: 218, location: "Khulna, BD", since: "2022", verified: false, description: "Safe, fun, educational toys for every age." },
  { id: "v6", slug: "glowbeauty", name: "Glow Beauty House", banner: "https://picsum.photos/seed/glow-b/1600/400", logo: "https://picsum.photos/seed/glow-l/120/120", rating: 4.8, followers: 73900, products: 421, location: "Dhaka, BD", since: "2020", verified: true, description: "Premium K-beauty & global skincare brands at unbeatable prices." }
];
const titles = [
  "Wireless Noise Cancelling Headphones Pro",
  "Smart Fitness Watch Series 9",
  "Ultra HD 4K Action Camera",
  "Ergonomic Mesh Office Chair",
  "Organic Cold Pressed Olive Oil 1L",
  "Premium Cotton Bedsheet Set",
  "Stainless Steel Cookware 8 Piece Set",
  "Men's Slim Fit Cotton Shirt",
  "Women's Leather Crossbody Bag",
  "LED Desk Lamp with Wireless Charger",
  "Gaming Mechanical Keyboard RGB",
  "Portable Bluetooth Speaker Waterproof",
  "Memory Foam Pillow 2 Pack",
  "Air Fryer 5.5L Digital",
  "Yoga Mat Premium Non-slip 6mm",
  "Smart LED Bulb Color Changing",
  "Kids Educational Wooden Puzzle",
  "Anti-aging Vitamin C Serum 30ml",
  "Stainless Insulated Water Bottle 1L",
  "Wireless Mouse Ergonomic Silent",
  "Robot Vacuum Cleaner Smart Mapping",
  "Electric Toothbrush Sonic",
  "Cast Iron Grill Pan 28cm",
  "Premium Espresso Coffee Beans 1kg"
];
const seeds = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x"];
const products = titles.map((title, i) => {
  const cat = categories[i % categories.length];
  const vendor = vendors[i % vendors.length];
  const oldPrice = 50 + Math.round(Math.random() * 400);
  const price = Math.round(oldPrice * (0.55 + Math.random() * 0.3));
  const id = `p${i + 1}`;
  const seed = seeds[i] || String(i);
  return {
    id,
    slug: id,
    title,
    price,
    oldPrice,
    rating: 3.8 + Math.random() * 1.2,
    reviews: Math.floor(50 + Math.random() * 5e3),
    sold: Math.floor(100 + Math.random() * 12e3),
    image: `https://picsum.photos/seed/prod-${seed}/600/600`,
    images: [
      `https://picsum.photos/seed/prod-${seed}-1/800/800`,
      `https://picsum.photos/seed/prod-${seed}-2/800/800`,
      `https://picsum.photos/seed/prod-${seed}-3/800/800`,
      `https://picsum.photos/seed/prod-${seed}-4/800/800`
    ],
    vendor: { id: vendor.id, name: vendor.name },
    category: cat.slug,
    badge: i % 5 === 0 ? "Best Seller" : i % 7 === 0 ? "New" : i % 4 === 0 ? "Hot Deal" : void 0,
    freeShipping: i % 3 !== 0,
    stock: Math.floor(5 + Math.random() * 300)
  };
});
const heroSlides = [
  { id: 1, eyebrow: "Mega Green Sale", title: "Up to 70% Off on Electronics", subtitle: "Top brands, lowest prices, free delivery nationwide.", cta: "Shop Now", href: "/category/electronics", image: "https://picsum.photos/seed/hero-1/1600/700", accent: "from-emerald-600 to-emerald-800" },
  { id: 2, eyebrow: "Fresh & Organic", title: "Farm to Table in 24 Hours", subtitle: "Hand picked groceries delivered fresh daily.", cta: "Order Fresh", href: "/category/groceries", image: "https://picsum.photos/seed/hero-2/1600/700", accent: "from-lime-600 to-emerald-700" },
  { id: 3, eyebrow: "New Season", title: "Fashion That Moves With You", subtitle: "Discover the latest trends from 500+ verified brands.", cta: "Explore Fashion", href: "/category/fashion", image: "https://picsum.photos/seed/hero-3/1600/700", accent: "from-emerald-700 to-teal-800" }
];
function getProduct(id) {
  return products.find((p) => p.id === id);
}
function getCategory(slug) {
  return categories.find((c) => c.slug === slug);
}
function getVendor(slug) {
  return vendors.find((v) => v.slug === slug);
}
export {
  categories,
  getCategory,
  getProduct,
  getVendor,
  heroSlides,
  products,
  vendors
};
