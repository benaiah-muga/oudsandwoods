import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, CheckCircle } from "lucide-react";

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    checkDeliveryAccess();
    fetchAssignedOrders();
  }, []);

  const checkDeliveryAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: hasRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'delivery_guy'
    });

    if (!hasRole) {
      navigate("/");
    }
  };

  const fetchAssignedOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (name)
          ),
          delivery_codes (*)
        `)
        .eq("assigned_delivery_guy", user?.id)
        .in("status", ["processing", "shipped"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const generateDeliveryCode = async (orderId: string) => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error } = await supabase
        .from("delivery_codes")
        .insert({
          order_id: orderId,
          code,
        });

      if (error) throw error;

      toast({
        title: "Delivery Code Generated",
        description: `Code sent to customer: ${code}`,
      });

      fetchAssignedOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const verifyDelivery = async (orderId: string) => {
    try {
      const { data: codeData, error: codeError } = await supabase
        .from("delivery_codes")
        .select("*")
        .eq("order_id", orderId)
        .eq("verified", false)
        .single();

      if (codeError || !codeData) {
        toast({
          title: "Error",
          description: "No active delivery code found",
          variant: "destructive",
        });
        return;
      }

      if (codeData.code !== verificationCode) {
        toast({
          title: "Invalid Code",
          description: "The code entered does not match",
          variant: "destructive",
        });
        return;
      }

      // Update code as verified
      const { error: updateCodeError } = await supabase
        .from("delivery_codes")
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", codeData.id);

      if (updateCodeError) throw updateCodeError;

      // Update order status
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId);

      if (updateOrderError) throw updateOrderError;

      toast({
        title: "Delivery Confirmed",
        description: "Order marked as delivered successfully",
      });

      setVerificationCode("");
      setSelectedOrder(null);
      fetchAssignedOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">Delivery Dashboard</h1>
            <p className="text-muted-foreground">{orders.length} assigned deliveries</p>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                      <p className="font-semibold mt-1">{order.status}</p>
                    </div>
                    <Package className="h-6 w-6 text-secondary" />
                  </div>

                  <div className="space-y-2">
                    <p><span className="font-semibold">Delivery Address:</span> {order.delivery_address}</p>
                    <p><span className="font-semibold">Contact:</span> {order.delivery_phone}</p>
                    <p><span className="font-semibold">City:</span> {order.shipping_city}</p>
                    {order.notes && (
                      <p><span className="font-semibold">Notes:</span> {order.notes}</p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">Items:</p>
                    <ul className="space-y-1">
                      {order.order_items?.map((item: any) => (
                        <li key={item.id} className="text-sm">
                          {item.product_name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {!order.delivery_codes || order.delivery_codes.length === 0 ? (
                      <Button
                        onClick={() => generateDeliveryCode(order.id)}
                        className="w-full"
                      >
                        Generate Delivery Code
                      </Button>
                    ) : order.delivery_codes.some((dc: any) => !dc.verified) ? (
                      <div className="space-y-2">
                        {selectedOrder === order.id ? (
                          <>
                            <Label htmlFor={`code-${order.id}`}>Enter Customer Code</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`code-${order.id}`}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                              />
                              <Button onClick={() => verifyDelivery(order.id)}>
                                Verify
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedOrder(null)}
                              className="w-full"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => setSelectedOrder(order.id)}
                            className="w-full"
                          >
                            Confirm Delivery
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Delivery Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeliveryDashboard;