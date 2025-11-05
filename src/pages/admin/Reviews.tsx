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

const AdminReviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({
    reviewer_name: "",
    comment: "",
    rating: 5,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchReviews();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/auth");
      return;
    }

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

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const reviewData = {
        reviewer_name: formData.reviewer_name,
        comment: formData.comment,
        rating: formData.rating,
        user_id: user.id,
        product_id: null,
      };

      if (editingReview) {
        const { error } = await supabase
          .from("reviews")
          .update(reviewData)
          .eq("id", editingReview.id);

        if (error) throw error;
        toast({ title: "Review updated successfully" });
      } else {
        const { error } = await supabase.from("reviews").insert([reviewData]);
        if (error) throw error;
        toast({ title: "Review added successfully" });
      }

      setShowForm(false);
      setEditingReview(null);
      setFormData({ reviewer_name: "", comment: "", rating: 5 });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Review deleted successfully" });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setFormData({
      reviewer_name: review.reviewer_name || "",
      comment: review.comment || "",
      rating: review.rating,
    });
    setShowForm(true);
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
            <h1 className="text-4xl font-serif font-bold mb-2">Manage Reviews</h1>
            <p className="text-muted-foreground">{reviews.length} total reviews</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingReview(null);
              setFormData({ reviewer_name: "", comment: "", rating: 5 });
            }}
            className="bg-secondary hover:bg-secondary/90 text-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">
              {editingReview ? "Edit Review" : "Add New Review"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Reviewer Name</Label>
                <Input
                  value={formData.reviewer_name}
                  onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Rating (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Comment</Label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary/90 text-primary"
                >
                  {editingReview ? "Update" : "Add"} Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingReview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-serif font-bold">{review.reviewer_name || "Anonymous"}</h3>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2">{review.comment}</p>
                  {review.products && (
                    <p className="text-sm">
                      <span className="font-semibold">Product:</span> {review.products.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(review)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
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

export default AdminReviews;
