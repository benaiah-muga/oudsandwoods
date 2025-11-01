import ProductCard from "./ProductCard";
import oudRoyalImage from "@/assets/perfume-oud-royal.jpg";
import roseGoldImage from "@/assets/perfume-rose-gold.jpg";
import amberNightsImage from "@/assets/perfume-amber-nights.jpg";
import velvetWoodImage from "@/assets/perfume-velvet-wood.jpg";

const FeaturedSection = () => {
  const featuredProducts = [
    {
      id: "1",
      name: "Oud Royal",
      brand: "Ouds & Woods",
      price: 699000,
      originalPrice: 899000,
      imageUrl: oudRoyalImage,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Rose Gold Essence",
      brand: "Ouds & Woods",
      price: 599000,
      imageUrl: roseGoldImage,
      rating: 4.6,
    },
    {
      id: "3",
      name: "Amber Nights",
      brand: "Ouds & Woods",
      price: 649000,
      originalPrice: 799000,
      imageUrl: amberNightsImage,
      rating: 4.7,
    },
    {
      id: "4",
      name: "Velvet Wood",
      brand: "Ouds & Woods",
      price: 629000,
      imageUrl: velvetWoodImage,
      rating: 4.9,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12 animate-fade-in">
          <p className="text-sm uppercase tracking-widest text-secondary font-semibold">
            Best Sellers
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Featured Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most beloved fragrances, handcrafted with rare ingredients
            and inspired by timeless elegance
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 animate-fade-in">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
