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
        <div className="flex h-10 items-center border-b bg-sidebar/40 px-5 backdrop-blur-sm sticky top-0 z-10">
          {/* if you want allow the sidebartrigger, delete the open prop in the _auth/route file */}
          {/* <SidebarTrigger /> */}
          <Breadcrumbs />
        </div>
        {children}
      </SidebarInset>
    </>
  );
}
