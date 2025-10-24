import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Award, Globe } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Sparkles,
      title: "Craftsmanship",
      description: "Each fragrance is meticulously crafted by master perfumers using traditional techniques passed down through generations.",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Our love for perfumery drives us to source the finest ingredients from around the world, creating unforgettable scent experiences.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We never compromise on quality. Every bottle represents our commitment to luxury and sophistication.",
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "We are committed to ethical sourcing and sustainable practices, ensuring our fragrances are as kind to the planet as they are luxurious.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-luxury opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1600&q=80')] bg-cover bg-center" />
          <div className="relative z-10 text-center space-y-6 px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary-foreground animate-fade-in">
              Our Story
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              A journey through scent, tradition, and timeless elegance
            </p>
          </div>
        </section>

        {/* Brand Story */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8 text-center">
              <p className="text-sm uppercase tracking-widest text-secondary font-semibold">
                Since 2010
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold">
                The Art of Perfumery
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Ouds & Woods began with a simple vision: to create fragrances that transcend time and trends, 
                  capturing the essence of luxury in every bottle. Our founders, passionate about the ancient art 
                  of perfumery, set out to craft scents that tell stories and evoke emotions.
                </p>
                <p>
                  Drawing inspiration from the rich heritage of Middle Eastern and Asian perfume traditions, 
                  we specialize in rare ingredients like agarwood (oud), amber, and exotic spices. Each fragrance 
                  is a masterpiece, blending traditional craftsmanship with modern sophistication.
                </p>
                <p>
                  Today, Ouds & Woods is celebrated worldwide for its commitment to quality, authenticity, and 
                  artistry. We believe that a fragrance is more than just a scent—it's an experience, a memory, 
                  and an expression of one's unique identity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <p className="text-sm uppercase tracking-widest text-secondary font-semibold">
                Our Values
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold">
                What Drives Us
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="border-0 bg-card hover:shadow-luxury transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary">
                      <value.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Image Gallery Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">
                Behind the Scenes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                A glimpse into our atelier where magic happens
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 h-[400px] overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1000&q=80"
                  alt="Perfume crafting"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="h-[400px] overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80"
                  alt="Ingredients"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="h-[400px] overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80"
                  alt="Laboratory"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="md:col-span-2 h-[400px] overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1000&q=80"
                  alt="Finished products"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              Experience Luxury
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Visit our boutique or explore our collections online to discover your signature scent
            </p>
            <div className="mt-8 space-y-2">
              <p className="text-lg font-semibold">Visit Our Store</p>
              <p className="text-muted-foreground">
                New Pioneer Mall, Shop PB87<br />
                Near Mapeera Building / Centenary Bank<br />
                Kampala, Uganda
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
