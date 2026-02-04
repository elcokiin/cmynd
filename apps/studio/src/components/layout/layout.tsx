import { AppSidebar } from "@/components/layout/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarInset } from "@elcokiin/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="overflow-auto">
        <div className="flex h-8 items-center border-b px-4">
          {/* if you want allow the sidebartrigger, delete the open prop in the _auth/route file */}
          {/* <SidebarTrigger /> */}
          <Breadcrumbs />
        </div>
        {children}
      </SidebarInset>
    </>
  );
}
