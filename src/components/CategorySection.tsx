import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Flower2, Flame, Wind } from "lucide-react";

const CategorySection = () => {
  const categories = [
    {
      name: "Oud Collection",
      description: "Rich & Woody",
      icon: Flame,
      color: "text-amber-600",
    },
    {
      name: "Floral Elegance",
      description: "Soft & Romantic",
      icon: Flower2,
      color: "text-rose-400",
    },
    {
      name: "Fresh & Citrus",
      description: "Light & Energizing",
      icon: Wind,
      color: "text-emerald-500",
    },
    {
      name: "Oriental Luxury",
      description: "Bold & Mysterious",
      icon: Sparkles,
      color: "text-purple-500",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <p className="text-sm uppercase tracking-widest text-secondary font-semibold">
            Explore
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.name}
                className="group cursor-pointer border-0 shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-luxury flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
