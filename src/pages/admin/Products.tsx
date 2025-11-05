import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star } from "lucide-react";

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
    availability: true,
    size: "",
    category_id: "",
    image_url: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchProducts();
    fetchCategories();
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
        .select("*, categories(name)")
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        price: parseFloat(formData.price),
        availability: formData.availability,
        size: formData.size,
        category_id: formData.category_id || null,
        image_url: imageUrl,
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
      setImageFile(null);
      setFormData({ 
        name: "", 
        description: "", 
        brand: "", 
        price: "", 
        availability: true, 
        size: "", 
        category_id: "", 
        image_url: "" 
      });
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
      availability: product.availability ?? true,
      size: product.size || "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !currentStatus })
        .eq("id", productId);

      if (error) throw error;
      toast({ 
        title: `Product ${!currentStatus ? "featured" : "unfeatured"} successfully` 
      });
      fetchProducts();
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
      <AdminLayout>
        <p className="text-muted-foreground">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">Manage Products</h1>
              <p className="text-muted-foreground">{products.length} total products</p>
            </div>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingProduct(null);
                setImageFile(null);
                setFormData({ 
                  name: "", 
                  description: "", 
                  brand: "", 
                  price: "", 
                  availability: true, 
                  size: "", 
                  category_id: "", 
                  image_url: "" 
                });
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
                    <Label>Category</Label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">No Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Availability</Label>
                    <select
                      value={formData.availability ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value === "true" })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="true">Available</option>
                      <option value="false">Out of Stock</option>
                    </select>
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
                <div>
                  <Label>Image Upload</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                </div>
                <div>
                  <Label>Or Image URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    disabled={uploading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-secondary hover:bg-secondary/90 text-primary"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : editingProduct ? "Update" : "Add"} Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setImageFile(null);
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
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-serif font-bold">{product.name}</h3>
                      {product.is_featured && (
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{product.description}</p>
                    <div className="flex gap-4 text-sm flex-wrap">
                      <p>
                        <span className="font-semibold">Brand:</span> {product.brand || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Price:</span> UGX {product.price.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-semibold">Availability:</span>{" "}
                        <span className={product.availability ? "text-green-600" : "text-red-600"}>
                          {product.availability ? "Available" : "Out of Stock"}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Size:</span> {product.size || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Category:</span> {product.categories?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                      title={product.is_featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className={`h-4 w-4 ${product.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </Button>
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
    </AdminLayout>
  );
};

export default AdminProducts;
