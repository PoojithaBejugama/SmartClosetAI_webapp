import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layouts/AppSidebar";
import { AppNavbar } from "@/layouts/AppNavbar";
import { BottomNav } from "@/components/BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppNavbar />
          <main className="flex-1 p-4 md:p-8 lg:p-10 pb-20 md:pb-10 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </SidebarProvider>
  );
}
