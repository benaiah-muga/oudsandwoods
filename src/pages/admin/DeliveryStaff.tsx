import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DeliveryStaff = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchStaff();
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
        _permission: 'manage_orders'
      });

      if (!hasPermission) {
        navigate("/");
      }
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq("role", "delivery_guy");

      if (error) throw error;
      setStaff(data || []);
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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "Error",
          description: "User not found. They must sign up first.",
          variant: "destructive",
        });
        return;
      }

      // Add delivery_guy role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: profiles.id,
          role: "delivery_guy",
        });

      if (roleError) throw roleError;

      toast({ title: "Delivery staff added successfully" });
      setEmail("");
      setDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "delivery_guy");

      if (error) throw error;

      toast({ title: "Staff member removed" });
      fetchStaff();
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold">Delivery Staff</h1>
            <p className="text-muted-foreground">{staff.length} delivery personnel</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90 text-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Delivery Staff</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    User must have an account first
                  </p>
                </div>
                <Button type="submit" className="w-full">Add Staff</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {staff.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{member.profiles?.full_name || "No Name"}</p>
                  <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStaff(member.user_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DeliveryStaff;