import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  const [formData, setFormData] = useState({
    contactEmail: "",
    contactPhone: "",
    deliveryAddress: "",
    deliveryPhone: "",
    deliveryCity: "",
    deliveryPostalCode: "",
    notes: "",
  });

  const deliveryFee = totalPrice > 550000 ? 0 : 35000;
  const finalTotal = totalPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentConfirmed) {
      toast({
        title: "Payment Required",
        description: "Please confirm that you have sent payment via Airtel Money",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete your order",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          delivery_address: formData.deliveryAddress,
          delivery_phone: formData.deliveryPhone,
          shipping_city: formData.deliveryCity,
          shipping_postal_code: formData.deliveryPostalCode,
          notes: formData.notes,
          payment_confirmed: true,
          payment_confirmation_time: new Date().toISOString(),
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: "Order Placed Successfully",
        description: "Your order has been received and will be processed soon",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card className="p-6">
                <h2 className="text-2xl font-serif font-bold mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      required
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </Card>

              {/* Delivery Information */}
              <Card className="p-6">
                <h2 className="text-2xl font-serif font-bold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Input
                      id="deliveryAddress"
                      required
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryPhone">Delivery Contact Number *</Label>
                    <Input
                      id="deliveryPhone"
                      type="tel"
                      required
                      value={formData.deliveryPhone}
                      onChange={(e) => setFormData({ ...formData, deliveryPhone: e.target.value })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryCity">City *</Label>
                      <Input
                        id="deliveryCity"
                        required
                        value={formData.deliveryCity}
                        onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryPostalCode">Postal Code</Label>
                      <Input
                        id="deliveryPostalCode"
                        value={formData.deliveryPostalCode}
                        onChange={(e) => setFormData({ ...formData, deliveryPostalCode: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h2 className="text-2xl font-serif font-bold mb-4">Payment via Airtel Money</h2>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-2">Send payment to:</p>
                    <p className="text-2xl font-bold">0752455717</p>
                    <p className="text-muted-foreground">Kobusingye Barbra</p>
                    <p className="text-xl font-bold mt-4">Amount: UGX {finalTotal.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="paymentConfirmed"
                      checked={paymentConfirmed}
                      onCheckedChange={(checked) => setPaymentConfirmed(checked as boolean)}
                    />
                    <label
                      htmlFor="paymentConfirmed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm that I have sent the payment via Airtel Money
                    </label>
                  </div>
                </div>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/90 text-primary font-semibold"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 space-y-4 sticky top-24">
              <h2 className="text-2xl font-serif font-bold">Order Summary</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>UGX {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>UGX {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "Free" : `UGX ${deliveryFee.toLocaleString()}`}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-4">
                <span>Total</span>
                <span>UGX {finalTotal.toLocaleString()}</span>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;