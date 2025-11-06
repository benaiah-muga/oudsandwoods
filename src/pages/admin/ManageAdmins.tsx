import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, UserPlus } from "lucide-react";

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
  // removed password field - users must sign up first
  const [newAdminFullName, setNewAdminFullName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

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
      
      // Add super admin to the list
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isSuperAdmin && !userIds.includes(user.id)) {
        userIds.push(user.id);
      }
      
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

      // Add super admin tag if current user is super admin
      if (user && isSuperAdmin && adminsMap.has(user.id)) {
        const admin = adminsMap.get(user.id);
        if (admin && !admin.permissions.includes('super_admin' as any)) {
          admin.permissions.push('super_admin' as any);
        }
      }

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
  setCreatingAdmin(true);

  try {
    // Find existing user by email in profiles (user must have signed up already)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', newAdminEmail)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      throw new Error('User not found. Ask them to create an account first, then try again.');
    }

    const userId = profile.id;

    // Current admin (granted_by)
    const { data: { user } } = await supabase.auth.getUser();

    for (const permission of selectedPermissions) {
      const { error: permError } = await supabase
        .from('admin_permissions')
        .insert({
          user_id: userId,
          permission: permission as any,
          granted_by: user?.id,
        });

      if (permError && !permError.message.includes('duplicate')) {
        throw permError;
      }
    }

    toast({
      title: 'Permissions granted',
      description: `Granted ${selectedPermissions.length} permission(s) to ${newAdminEmail}`,
    });

    setNewAdminEmail("");
    setNewAdminFullName("");
    setSelectedPermissions([]);
    await fetchAdmins();
  } catch (error: any) {
    toast({
      title: 'Error granting permissions',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setCreatingAdmin(false);
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
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-serif font-bold">Manage Admins</h1>

        <Card className="p-6">
          <h2 className="text-2xl font-serif font-bold mb-4">
            <UserPlus className="inline h-6 w-6 mr-2" />
            Grant Admin Permissions to Existing User
          </h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                type="text"
                value={newAdminFullName}
                onChange={(e) => setNewAdminFullName(e.target.value)}
                placeholder="John Doe (optional)"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

{/* Password removed - users must sign up first */}

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
              disabled={creatingAdmin || selectedPermissions.length === 0}
              className="bg-secondary hover:bg-secondary/90 text-primary"
            >
              {creatingAdmin ? "Creating..." : "Create Admin Account"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-serif font-bold mb-4">Current Admins</h2>
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
      </div>
    </AdminLayout>
  );
};

export default ManageAdmins;
