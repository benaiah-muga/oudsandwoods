import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    stock_quantity: "",
    size: "",
  });

  useEffect(() => {
    checkAdminAccess();
    fetchProducts();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/auth");
        return;
      }

    // Check if super admin or has manage_products permission
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
      _user_id: user.id
    });

    if (!isSuperAdmin) {
      const { data: hasPermission } = await supabase.rpc('has_permission', {
        _user_id: user.id,
        _permission: 'manage_products'
      });

      if (!hasPermission) {
        navigate("/");
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Product updated successfully" });
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
        toast({ title: "Product added successfully" });
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: "", description: "", brand: "", price: "", stock_quantity: "", size: "" });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Product deleted successfully" });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      brand: product.brand || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      size: product.size || "",
    });
    setShowForm(true);
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">Manage Products</h1>
              <p className="text-muted-foreground">{products.length} total products</p>
            </div>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingProduct(null);
                setFormData({ name: "", description: "", brand: "", price: "", stock_quantity: "", size: "" });
              }}
              className="bg-secondary hover:bg-secondary/90 text-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {showForm && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-serif font-bold mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Price (UGX)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-primary">
                    {editingProduct ? "Update" : "Add"} Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold mb-2">{product.name}</h3>
                    <p className="text-muted-foreground mb-2">{product.description}</p>
                    <div className="flex gap-4 text-sm">
                      <p>
                        <span className="font-semibold">Brand:</span> {product.brand || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Price:</span> UGX {product.price.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-semibold">Stock:</span> {product.stock_quantity}
                      </p>
                      <p>
                        <span className="font-semibold">Size:</span> {product.size || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default AdminProducts;
