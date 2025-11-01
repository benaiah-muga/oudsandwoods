import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppWidget = () => {
  const phoneNumber = "256787966000";
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
        className="rounded-full w-16 h-16 shadow-2xl hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] bg-[#25D366] hover:bg-[#20BD5A] transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>
    </a>
  );
};

export default WhatsAppWidget;
