import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import FeaturedSection from "@/components/FeaturedSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import CampaignBanner from "@/components/CampaignBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <CampaignBanner />
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
