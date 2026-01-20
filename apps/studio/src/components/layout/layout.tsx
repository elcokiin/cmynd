import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@elcokiin/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="overflow-auto">
        <div className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </>
  );
}
