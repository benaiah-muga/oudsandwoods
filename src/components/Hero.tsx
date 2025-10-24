import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-perfumes.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury Perfumes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <p className="text-sm uppercase tracking-widest text-secondary font-semibold">
            Luxury Fragrances
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
            Discover Your
            <br />
            Signature Scent
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Indulge in our exquisite collection of premium perfumes and cosmetics,
            crafted with the finest ingredients for the discerning connoisseur.
          </p>
          <div className="flex gap-4 pt-4">
            <Link to="/collections">
              <Button size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant">
                Explore Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/shop">
              <Button size="lg" variant="outline" className="border-2">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
