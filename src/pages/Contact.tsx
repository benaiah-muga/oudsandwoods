import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
              Visit Our Store
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience luxury fragrances in person at our Pioneer Mall location
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <Card className="p-8 space-y-6 animate-fade-in">
              <h2 className="text-3xl font-serif font-bold mb-6">Get In Touch</h2>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-muted-foreground">
                    Pioneer Mall, Shop PB13<br />
                    Kampala, Uganda
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a 
                    href="tel:+256787966000" 
                    className="text-muted-foreground hover:text-secondary transition-colors"
                  >
                    +256 787 966000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a 
                    href="mailto:info@oudsandwoods.com" 
                    className="text-muted-foreground hover:text-secondary transition-colors"
                  >
                    info@oudsandwoods.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Opening Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Saturday: 9:00 AM - 8:00 PM<br />
                    Sunday: 10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </Card>

            {/* Map */}
            <Card className="p-0 overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7571157236756!2d32.5761!3d0.3162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb8f2c6d3e8f%3A0x3e8e5b9c4c8e5e8f!2sPioneer%20Mall!5e0!3m2!1sen!2sug!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pioneer Mall Location"
              />
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="p-8 bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-serif font-bold mb-4">
                Why Visit Our Store?
              </h2>
              <p className="text-muted-foreground mb-6">
                Experience our fragrances firsthand with personalized consultations from our expert staff. 
                We'll help you find the perfect scent that matches your personality and preferences.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="px-6 py-3 rounded-full bg-background border border-border">
                  <p className="font-semibold">Expert Guidance</p>
                </div>
                <div className="px-6 py-3 rounded-full bg-background border border-border">
                  <p className="font-semibold">Sample Testing</p>
                </div>
                <div className="px-6 py-3 rounded-full bg-background border border-border">
                  <p className="font-semibold">Exclusive In-Store Offers</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
