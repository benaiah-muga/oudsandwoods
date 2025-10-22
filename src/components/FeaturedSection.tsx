import ProductCard from "./ProductCard";
import featuredImage from "@/assets/featured-perfume.jpg";

const FeaturedSection = () => {
  // Mock featured products - will be replaced with real data
  const featuredProducts = [
    {
      id: "1",
      name: "Oud Royal",
      brand: "Ouds & Woods",
      price: 189.99,
      originalPrice: 249.99,
      imageUrl: featuredImage,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Rose Gold Essence",
      brand: "Ouds & Woods",
      price: 159.99,
      imageUrl: featuredImage,
      rating: 4.6,
    },
    {
      id: "3",
      name: "Amber Nights",
      brand: "Ouds & Woods",
      price: 179.99,
      originalPrice: 219.99,
      imageUrl: featuredImage,
      rating: 4.7,
    },
    {
      id: "4",
      name: "Velvet Wood",
      brand: "Ouds & Woods",
      price: 169.99,
      imageUrl: featuredImage,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
