import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Collections = () => {
  const collections = [
    {
      id: "1",
      name: "Oud Collection",
      description: "Rich, woody fragrances featuring the finest agarwood from Southeast Asia",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      productCount: 12,
    },
    {
      id: "2",
      name: "Floral Essence",
      description: "Delicate floral notes capturing the beauty of blooming gardens",
      image: "https://images.unsplash.com/photo-1588159343745-445ae0b47a5b?w=800&q=80",
      productCount: 18,
    },
    {
      id: "3",
      name: "Amber Nights",
      description: "Warm, sensual fragrances perfect for evening wear",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
      productCount: 8,
    },
    {
      id: "4",
      name: "Fresh & Citrus",
      description: "Bright, invigorating scents for everyday elegance",
      image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80",
      productCount: 15,
    },
    {
      id: "5",
      name: "Oriental Spice",
      description: "Exotic spices blended with precious ingredients",
      image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
      productCount: 10,
    },
    {
      id: "6",
      name: "Leather & Woods",
      description: "Sophisticated masculine scents with depth and character",
      image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      productCount: 14,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-luxury opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1600&q=80')] bg-cover bg-center" />
          <div className="relative z-10 text-center space-y-4 px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary-foreground animate-fade-in">
              Our Collections
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Discover curated collections crafted for every mood and moment
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection, index) => (
                <Card
                  key={collection.id}
                  className="group relative overflow-hidden border-0 bg-card hover:shadow-luxury transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-[300px] overflow-hidden">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-sm text-secondary uppercase tracking-widest font-semibold">
                      {collection.productCount} Products
                    </p>
                    <h3 className="text-3xl font-serif font-bold text-foreground">
                      {collection.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {collection.description}
                    </p>
                    <Link to="/shop">
                      <Button
                        variant="default"
                        className="mt-4 bg-secondary hover:bg-secondary/90 text-primary font-semibold"
                      >
                        Explore Collection
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our full range of luxury fragrances or get in touch with our experts for personalized recommendations
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/shop">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-primary font-semibold">
                  Browse All Products
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn About Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
