import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  permissions: string[];
}

const ManageAdmins = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const permissions = [
    { id: "manage_products", label: "Manage Products" },
    { id: "manage_orders", label: "Manage Orders" },
    { id: "manage_admins", label: "Manage Admins" },
    { id: "view_analytics", label: "View Analytics" },
  ];

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/auth");
        return;
      }

      // Check if super admin
      const { data: superAdminCheck, error: superAdminError } = await supabase
        .rpc('is_super_admin', { _user_id: user.id });

      if (superAdminError) throw superAdminError;

      if (superAdminCheck) {
        setIsSuperAdmin(true);
        await fetchAdmins();
      } else {
        // Check if has manage_admins permission
        const { data: hasPermission, error: permError } = await supabase
          .rpc('has_permission', { _user_id: user.id, _permission: 'manage_admins' });

        if (permError) throw permError;

        if (!hasPermission) {
          navigate("/");
          return;
        }
        await fetchAdmins();
      }
    } catch (error: any) {
      toast({
        title: "Access denied",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data: permissionsData, error: permError } = await supabase
        .from('admin_permissions')
        .select('user_id, permission');

      if (permError) throw permError;

      const userIds = [...new Set(permissionsData?.map(p => p.user_id) || [])];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const adminsMap = new Map<string, AdminUser>();
      profilesData?.forEach(profile => {
        adminsMap.set(profile.id, {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          permissions: []
        });
      });

      permissionsData?.forEach(perm => {
        const admin = adminsMap.get(perm.user_id);
        if (admin) {
          admin.permissions.push(perm.permission);
        }
      });

      setAdmins(Array.from(adminsMap.values()));
    } catch (error: any) {
      toast({
        title: "Error fetching admins",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newAdminEmail)
        .single();

      if (profileError) {
        toast({
          title: "User not found",
          description: "No user exists with this email. They must create an account first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Grant permissions
      const { data: { user } } = await supabase.auth.getUser();
      
      for (const permission of selectedPermissions) {
        const { error: permError } = await supabase
          .from('admin_permissions')
          .insert({
            user_id: profile.id,
            permission: permission as any,
            granted_by: user?.id
          });

        if (permError && !permError.message.includes('duplicate')) {
          throw permError;
        }
      }

      toast({
        title: "Admin added successfully",
        description: `Permissions granted to ${newAdminEmail}`,
      });

      setNewAdminEmail("");
      setSelectedPermissions([]);
      await fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error adding admin",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (userId: string, permission: string) => {
    try {
      const { error } = await supabase
        .from('admin_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission', permission as any);

      if (error) throw error;

      toast({
        title: "Permission removed",
        description: "Permission has been revoked successfully",
      });

      await fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error removing permission",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold mb-8">Manage Admins</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">User Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <p className="text-sm text-muted-foreground">
                User must already have an account
              </p>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              {permissions.map((perm) => (
                <div key={perm.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={perm.id}
                    checked={selectedPermissions.includes(perm.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPermissions([...selectedPermissions, perm.id]);
                      } else {
                        setSelectedPermissions(
                          selectedPermissions.filter((p) => p !== perm.id)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={perm.id} className="cursor-pointer">
                    {perm.label}
                  </Label>
                </div>
              ))}
            </div>

            <Button 
              type="submit" 
              disabled={loading || selectedPermissions.length === 0}
              className="bg-secondary hover:bg-secondary/90 text-primary"
            >
              Add Admin
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Current Admins</h2>
          <div className="space-y-4">
            {admins.map((admin) => (
              <Card key={admin.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{admin.full_name || admin.email}</h3>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {admin.permissions.map((perm) => (
                        <div
                          key={perm}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-sm"
                        >
                          <span>
                            {permissions.find(p => p.id === perm)?.label || perm}
                          </span>
                          <button
                            onClick={() => handleRemovePermission(admin.id, perm)}
                            className="hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {admins.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No admins found
              </p>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ManageAdmins;
