import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { FileTextIcon, UsersIcon, FileCheckIcon } from "lucide-react";

import { MobileTabBar } from "@/components/admin/mobile-tab-bar";

import { useIsMobile } from "@/hooks/use-is-mobile";

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

      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
