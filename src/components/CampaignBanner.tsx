import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  messages: string[];
  end_date: string;
}

export default function CampaignBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchActiveCampaign();
  }, []);

  const fetchActiveCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setCampaign(data);
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
    }
  };

  useEffect(() => {
    if (!campaign) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(campaign.end_date).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [campaign]);

  useEffect(() => {
    if (!campaign || campaign.messages.length <= 1) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % campaign.messages.length);
    }, 5000);

    return () => clearInterval(messageInterval);
  }, [campaign]);

  if (!campaign || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-secondary via-secondary/90 to-secondary text-primary py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="font-semibold text-sm md:text-base">
            {campaign.messages[currentMessageIndex]}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs md:text-sm font-mono whitespace-nowrap">
            ⏰ {timeLeft}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="hover:opacity-70 transition-opacity"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
