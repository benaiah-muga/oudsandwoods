import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppWidget = () => {
  const phoneNumber = "256742887499";
  const message = "Hello! I'm interested in your luxury fragrances.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 animate-fade-in"
    >
      <Button
        size="lg"
        className="rounded-full px-6 py-3 shadow-2xl bg-secondary hover:bg-secondary/90 text-primary transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">WhatsApp</span>
      </Button>
    </a>
  );
};

export default WhatsAppWidget;
