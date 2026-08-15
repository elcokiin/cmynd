import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "@elcokiin/ui/theme-toggle";
import { Logo } from "@elcokiin/ui/logo";
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
  { tab: "profile", label: "Profile", icon: UserIcon, path: "/my-portfolio" },
  { tab: "skills", label: "Skills", icon: WrenchIcon, path: "/my-portfolio/skills" },
  { tab: "projects", label: "Projects", icon: BriefcaseIcon, path: "/my-portfolio/projects" },
  { tab: "experience", label: "Experience", icon: LayersIcon, path: "/my-portfolio/experience" },
];

export function AppSidebar() {
  const location = useLocation();
  const isAdmin = useQuery(api.auth.isCurrentUserAdmin);

  const isPortfolioActive = location.pathname.startsWith("/my-portfolio");

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
          <Logo src={LogoStudio} alt="Studio logo" className="w-8 h-8" flame={false} width={32} height={32} />
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
                    My Portfolio
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