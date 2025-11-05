import { Home, Package, ShoppingCart, Users, Truck, BarChart3, FolderTree, Megaphone } from "lucide-react";
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
  { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone },
  { title: "Delivery Staff", url: "/admin/delivery-staff", icon: Truck },
  { title: "Manage Admins", url: "/admin/manage-admins", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const { open } = useSidebar();

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-white/10 text-white font-medium" : "hover:bg-white/5 text-white/80";

  return (
    <Sidebar collapsible="icon" className="bg-[hsl(220,70%,8%)] border-r-0">
      <SidebarContent className="bg-[hsl(220,70%,8%)]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">Admin Panel</SidebarGroupLabel>
          
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