import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Flower2, Flame, Wind, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CategorySection = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: any = {
    Flame,
    Flower2,
    Wind,
    Sparkles,
    Package,
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

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
            const Icon = Package;
            return (
              <Card
                key={category.id}
                className="group cursor-pointer border-0 shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-luxury flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description || "Explore our collection"}
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
