import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "@elcokiin/ui/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { HomeIcon, ShieldIcon } from "lucide-react";
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

import LogoStudio from "@/assets/images/s_letter.svg";

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
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img
            src={LogoStudio}
            alt="Studio logo"
            width={32}
            height={32}
            className="rounded-md"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    render={<Link to={item.to} />}
                    isActive={item.active}
                  >
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
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
