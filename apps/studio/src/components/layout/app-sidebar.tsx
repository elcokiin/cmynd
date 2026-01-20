import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "@elcokiin/ui/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import {
  HomeIcon,
  ShieldIcon,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@elcokiin/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const isAdmin = useQuery(api.auth.isCurrentUserAdmin);

  const navItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: HomeIcon,
      active: location.pathname === "/",
    },
  ];

  if (isAdmin) {
    navItems.push({
      label: "Admin",
      to: "/admin/dashboard",
      icon: ShieldIcon,
      active: location.pathname.startsWith("/admin"),
    });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 font-semibold px-2">
          <span className="text-xl font-bold">Studio</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton render={<Link to={item.to} />} isActive={item.active}>
                    <item.icon />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
            <div className="px-2">
              <UserMenu />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
