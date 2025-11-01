import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Fashion Designer",
      content: "The Oud Royal fragrance is absolutely divine. It's become my signature scent, and I receive compliments everywhere I go.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      name: "James Anderson",
      role: "Business Executive",
      content: "Exceptional quality and unique fragrances. The Velvet Wood is perfect for professional settings yet luxurious enough for evenings.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
    },
    {
      name: "Aisha Nakato",
      role: "Lifestyle Blogger",
      content: "I've tried many luxury perfumes, but Ouds & Woods stands out. The Rose Gold Essence is sophisticated and long lasting.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    },
  ];

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
              key={index}
              className="border-0 shadow-elegant hover:shadow-gold transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 space-y-4">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
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
