import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
    brand: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: cart } = await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cart) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          product:products(name, price, image_url, brand)
        `)
        .eq("cart_id", cart.id);

      if (error) throw error;
      setItems(cartItems as any || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please login to add items to cart", variant: "destructive" });
        return;
      }

      let { data: cart } = await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cart) {
        const { data: newCart } = await supabase
          .from("cart")
          .insert({ user_id: user.id })
          .select("id")
          .single();
        cart = newCart;
      }

      if (!cart) return;

      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart.id)
        .eq("product_id", productId)
        .single();

      if (existingItem) {
        await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ cart_id: cart.id, product_id: productId, quantity: 1 });
      }

      await fetchCart();
      toast({ title: "Added to cart successfully" });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({ title: "Failed to add to cart", variant: "destructive" });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await supabase.from("cart_items").delete().eq("id", itemId);
      await fetchCart();
      toast({ title: "Removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({ title: "Failed to remove from cart", variant: "destructive" });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({ title: "Failed to update quantity", variant: "destructive" });
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cart } = await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);
        await fetchCart();
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
