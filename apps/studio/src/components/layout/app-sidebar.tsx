import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "@elcokiin/ui/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { useTheme } from "next-themes";
import {
  HomeIcon,
  ShieldIcon,
  FolderKanbanIcon,
  UserIcon,
  WrenchIcon,
  BriefcaseIcon,
  LayersIcon,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLinkItem,
} from "@elcokiin/ui/dropdown-menu";

import LogoStudio from "@/assets/images/logo.png";

function ThemeToggleWrapper() {
  const { setTheme } = useTheme();
  return <ThemeToggle onSetTheme={setTheme} />;
}

type PortfolioTab = "profile" | "skills" | "projects" | "experience";

const portfolioSections: { tab: PortfolioTab; label: string; icon: typeof UserIcon; path: string }[] = [
  { tab: "profile", label: "Profile", icon: UserIcon, path: "/admin/portfolio" },
  { tab: "skills", label: "Skills", icon: WrenchIcon, path: "/admin/portfolio/skills" },
  { tab: "projects", label: "Projects", icon: BriefcaseIcon, path: "/admin/portfolio/projects" },
  { tab: "experience", label: "Experience", icon: LayersIcon, path: "/admin/portfolio/experience" },
];

export function AppSidebar() {
  const location = useLocation();
  const isAdmin = useQuery(api.auth.isCurrentUserAdmin);

  const isPortfolioActive = location.pathname.startsWith("/admin/portfolio");

  const navItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: HomeIcon,
      active: location.pathname === "/",
    },
    ...(isAdmin
      ? [
          {
            label: "Admin",
            to: "/admin",
            icon: ShieldIcon,
            active: location.pathname.startsWith("/admin") && !isPortfolioActive,
          } as const,
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img
            src={LogoStudio}
            alt="Studio logo"
            width={32}
            height={32}
            className="rounded-full object-cover"
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

              {isAdmin && (
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      openOnHover
                      delay={100}
                      closeDelay={150}
                      render={
                        <SidebarMenuButton isActive={isPortfolioActive} />
                      }
                    >
                      <FolderKanbanIcon />
                      Portfolio
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" sideOffset={8}>
                      {portfolioSections.map((section) => (
                        <DropdownMenuLinkItem
                          key={section.tab}
                          render={<Link to={section.path} />}
                          data-active={location.pathname === section.path || undefined}
                        >
                          <section.icon />
                          {section.label}
                        </DropdownMenuLinkItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggleWrapper />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}