import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12 animate-fade-in">
          <p className="text-sm uppercase tracking-widest text-secondary font-semibold">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered their signature scent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="border-0 shadow-elegant hover:shadow-gold transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 space-y-4">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="w-12 h-12 rounded-full bg-gradient-luxury flex items-center justify-center text-white font-semibold">
                    {testimonial.reviewer_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.reviewer_name || "Anonymous"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
