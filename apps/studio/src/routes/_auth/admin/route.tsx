import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { FileTextIcon, UsersIcon, FileCheckIcon, DownloadIcon } from "lucide-react";

import { MobileTabBar } from "@/components/admin/mobile-tab-bar";

import { useIsMobile } from "@/hooks/use-is-mobile";

type AdminTab = "dashboard" | "authors" | "published" | "review";

type MobileTab = "dashboard" | "authors" | "published" | "review";

export const Route = createFileRoute("/_auth/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentPath = location.pathname;

  const [mobileTab, setMobileTab] = useState<MobileTab>(() => {
    if (currentPath === "/admin/authors") return "authors";
    if (currentPath === "/admin/published") return "published";
    return "dashboard";
  });

  useEffect(() => {
    if (currentPath === "/admin/authors") setMobileTab("authors");
    else if (currentPath === "/admin/published") setMobileTab("published");
    else if (currentPath === "/admin") setMobileTab("dashboard");
  }, [currentPath]);
  let activeTab: AdminTab = "dashboard";

  if (currentPath === "/admin/authors") activeTab = "authors";
  else if (currentPath === "/admin/published") activeTab = "published";
  else if (currentPath === "/admin") activeTab = "dashboard";

    const tabs = [
      {
        id: "dashboard" as const,
        label: "Dashboard",
        icon: FileTextIcon,
      },
      {
        id: "authors" as const,
        label: "Authors",
        icon: UsersIcon,
      },
      {
        id: "published" as const,
        label: "Published",
        icon: FileCheckIcon,
      },
    ];

    const handleTabChange = (tabId: string): void => {
      setMobileTab(tabId as MobileTab);

      switch (tabId) {
        case "dashboard":
          navigate({ to: "/admin" });
          break;
        case "authors":
          navigate({ to: "/admin/authors" });
          break;
        case "published":
          navigate({ to: "/admin/published" });
          break;
      }
    };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Tab Bar */}
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

      {/* Desktop Layout */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <div className="hidden md:flex w-56 border-r bg-muted/30 p-4 flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left
                  ${isActive
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
