import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  HomeIcon,
  LayoutDashboardIcon,
  UserIcon,
  WrenchIcon,
  BriefcaseIcon,
  LayersIcon,
} from "lucide-react";

import { MobileTabBar } from "@/components/admin/mobile-tab-bar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@elcokiin/ui/sheet";

import { useIsMobile } from "@/hooks/use-is-mobile";

type MobileTab = "home" | "admin" | "portfolio";

type PortfolioTab = "profile" | "skills" | "projects" | "experience";

const portfolioSections: { tab: PortfolioTab; label: string; icon: typeof UserIcon; path: string }[] = [
  { tab: "profile", label: "Profile", icon: UserIcon, path: "/admin/portfolio" },
  { tab: "skills", label: "Skills", icon: WrenchIcon, path: "/admin/portfolio/skills" },
  { tab: "projects", label: "Projects", icon: BriefcaseIcon, path: "/admin/portfolio/projects" },
  { tab: "experience", label: "Experience", icon: LayersIcon, path: "/admin/portfolio/experience" },
];

export const Route = createFileRoute("/_auth/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [mobileTab, setMobileTab] = useState<MobileTab>(() => {
    if (location.pathname.startsWith("/admin/portfolio")) return "portfolio";
    if (location.pathname === "/admin") return "admin";
    return "home";
  });

  const [portfolioSheetOpen, setPortfolioSheetOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/admin/portfolio")) setMobileTab("portfolio");
    else if (location.pathname === "/admin") setMobileTab("admin");
    else setMobileTab("home");
  }, [location.pathname]);

  const tabs = [
    {
      id: "home" as const,
      label: "Home",
      icon: HomeIcon,
    },
    {
      id: "admin" as const,
      label: "Admin",
      icon: LayoutDashboardIcon,
    },
    {
      id: "portfolio" as const,
      label: "Portfolio",
      icon: UserIcon,
    },
  ];

  const handleTabChange = (tabId: string): void => {
    setMobileTab(tabId as MobileTab);

    if (tabId === "portfolio") {
      setPortfolioSheetOpen(true);
      return;
    }

    switch (tabId) {
      case "home":
        navigate({ to: "/" });
        break;
      case "admin":
        navigate({ to: "/admin" });
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 pb-20 md:pb-6">
        <Outlet />
      </div>

      {isMobile ? (
        <MobileTabBar
          tabs={tabs.map((tab) => ({
            ...tab,
            id: tab.id as MobileTab,
          }))}
          activeTab={mobileTab}
          onTabChange={handleTabChange}
        />
      ) : null}

      <Sheet open={portfolioSheetOpen} onOpenChange={setPortfolioSheetOpen}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Portfolio Sections</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 p-4 pt-0">
            {portfolioSections.map((section) => (
              <Link
                key={section.tab}
                to={section.path}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === section.path
                    ? "bg-accent text-accent-foreground font-medium"
                    : ""
                }`}
                onClick={() => setPortfolioSheetOpen(false)}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
