import { Home, Package, ShoppingCart, Users, Truck, BarChart3, FolderTree, Megaphone, Star, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const { open } = useSidebar();

const getNavClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "bg-secondary/20 text-secondary font-semibold"
    : "text-white hover:text-secondary transition-colors";

  return (
    <Sidebar collapsible="icon" className="bg-[hsl(220,70%,8%)] border-r-0">
      <SidebarContent className="bg-[hsl(220,70%,8%)]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-secondary">Admin Panel</SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}