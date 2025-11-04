import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import Footer from "@/components/Footer";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-4 sticky top-0 bg-background z-10">
            <SidebarTrigger />
            <h1 className="ml-4 font-serif text-xl font-bold">Admin Panel</h1>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}