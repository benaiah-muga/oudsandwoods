import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  roles: string[];
}

const roleOrder = ["admin", "delivery_guy", "customer"] as const;

type RoleFilter = typeof roleOrder[number] | "all";

export default function AdminUsers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("");

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

      const [{ data: isSuper }, { data: isAdmin }] = await Promise.all([
        supabase.rpc('is_super_admin', { _user_id: user.id }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
      ]);

      if (!isSuper && !isAdmin) {
        navigate("/");
        return;
      }

      await fetchUsers();
    } catch (error: any) {
      toast({ title: "Access denied", description: error.message, variant: "destructive" });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }, { data: permissions, error: permErr }] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name, created_at'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('admin_permissions').select('user_id, permission'),
      ]);

      if (pErr) throw pErr;
      if (rErr) throw rErr;
      if (permErr) throw permErr;

      const map = new Map<string, UserRow>();
      (profiles || []).forEach((p) => map.set(p.id, { id: p.id, email: p.email, full_name: p.full_name, roles: [] }));
      (roles || []).forEach((r) => {
        const row = map.get(r.user_id);
        if (row) row.roles.push(r.role);
      });

      // Check for super admin and add role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { _user_id: user.id });
        if (isSuperAdmin) {
          // Add super admin to users if not already there
          for (const [userId, profile] of map.entries()) {
            const { data: isThisSuperAdmin } = await supabase.rpc('is_super_admin', { _user_id: userId });
            if (isThisSuperAdmin && !profile.roles.includes('admin')) {
              profile.roles.unshift('admin');
            }
          }
        }
      }

      // Add users with admin permissions but no roles
      (permissions || []).forEach((p) => {
        const row = map.get(p.user_id);
        if (row && !row.roles.includes('admin')) {
          row.roles.push('admin');
        }
      });

      setUsers(Array.from(map.values()));
    } catch (error: any) {
      toast({ title: "Error fetching users", description: error.message, variant: "destructive" });
    }
  };

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matches = (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q);
      const byRole = filter === "all" ? true : u.roles.includes(filter);
      return matches && byRole;
    })
    .sort((a, b) => roleOrderScore(a) - roleOrderScore(b));

  function roleOrderScore(u: UserRow) {
    const idx = roleOrder.findIndex((r) => u.roles.includes(r));
    return idx === -1 ? 99 : idx;
  }

  const handleAddRole = async () => {
    if (!editingUser || !newRole) return;
    
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: editingUser.id, role: newRole as any }]);

      if (error) throw error;
      
      toast({ title: "Role added successfully" });
      setShowDialog(false);
      setEditingUser(null);
      setNewRole("");
      await fetchUsers();
    } catch (error: any) {
      toast({ title: "Error adding role", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role from this user?`)) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .match({ user_id: userId, role: role as any });

      if (error) throw error;
      
      toast({ title: "Role removed successfully" });
      await fetchUsers();
    } catch (error: any) {
      toast({ title: "Error removing role", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      // Check if super admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { _user_id: user.id });
      
      if (!isSuperAdmin) {
        toast({ 
          title: "Permission denied", 
          description: "Only super admins can delete users",
          variant: "destructive" 
        });
        return;
      }

      // Delete user data
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      toast({ title: "User deleted successfully" });
      await fetchUsers();
    } catch (error: any) {
      toast({ title: "Error deleting user", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-serif font-bold">User Management</h1>

        <Card className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter==='all' ? 'bg-muted' : ''}`}>All</button>
            <button onClick={() => setFilter('admin')} className={`px-3 py-1 rounded ${filter==='admin' ? 'bg-muted' : ''}`}>Admins</button>
            <button onClick={() => setFilter('delivery_guy')} className={`px-3 py-1 rounded ${filter==='delivery_guy' ? 'bg-muted' : ''}`}>Delivery</button>
            <button onClick={() => setFilter('customer')} className={`px-3 py-1 rounded ${filter==='customer' ? 'bg-muted' : ''}`}>Customers</button>
          </div>
          <Input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </Card>

        <div className="grid gap-4">
          {filtered.map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{u.full_name || u.email}</div>
                  <div className="text-sm text-muted-foreground">{u.email}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex gap-2">
                    {u.roles.map((r) => (
                      <div key={r} className="flex items-center gap-1">
                        <Badge variant="secondary" className="uppercase">{r.replace('_', ' ')}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveRole(u.id, r)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(u);
                      setShowDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Role
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users match your filters.</p>
          )}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Role to {editingUser?.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="delivery_guy">Delivery Guy</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddRole}>Add Role</Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
