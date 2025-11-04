import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/auth");
        return;
      }

    // Check if super admin or has any admin permission
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
      _user_id: user.id
    });

    if (!isSuperAdmin) {
      // Check if has any permission
      const { data: permissions } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('user_id', user.id);

      if (!permissions || permissions.length === 0) {
        navigate("/");
      }
    }
  };

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, pendingRes, revenueRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total_amount"),
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        pendingOrders: pendingRes.count || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
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
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your store</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Package className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <ShoppingCart className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/products">
              <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <Package className="h-12 w-12 text-secondary mb-4" />
                <h2 className="text-2xl font-serif font-bold mb-2">Manage Products</h2>
                <p className="text-muted-foreground mb-4">
                  Add, edit, or remove products from your inventory
                </p>
                <Button className="bg-secondary hover:bg-secondary/90 text-primary">
                  View Products
                </Button>
              </Card>
            </Link>

            <Link to="/admin/orders">
              <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <ShoppingCart className="h-12 w-12 text-secondary mb-4" />
                <h2 className="text-2xl font-serif font-bold mb-2">Manage Orders</h2>
                <p className="text-muted-foreground mb-4">
                  View and update order statuses
                </p>
                <Button className="bg-secondary hover:bg-secondary/90 text-primary">
                  View Orders
                </Button>
              </Card>
            </Link>

            <Link to="/admin/manage-admins">
              <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <Users className="h-12 w-12 text-secondary mb-4" />
                <h2 className="text-2xl font-serif font-bold mb-2">Manage Admins</h2>
                <p className="text-muted-foreground mb-4">
                  Add admins and assign permissions
                </p>
                <Button className="bg-secondary hover:bg-secondary/90 text-primary">
                  Manage Access
                </Button>
              </Card>
            </Link>
          </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
