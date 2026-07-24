import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { UserIcon, WrenchIcon, FolderKanbanIcon, BriefcaseIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { MobileTabBar } from "@/components/admin/mobile-tab-bar";
import { cn } from "@elcokiin/ui/lib/utils";

type PortfolioTab = "profile" | "skills" | "projects" | "experience";

export const Route = createFileRoute("/_auth/admin/portfolio")({
  component: PortfolioLayout,
});

const tabs = [
  { id: "profile" as const, label: "Profile", icon: UserIcon },
  { id: "skills" as const, label: "Skills", icon: WrenchIcon },
  { id: "projects" as const, label: "Projects", icon: FolderKanbanIcon },
  { id: "experience" as const, label: "Experience", icon: BriefcaseIcon },
];

function PortfolioLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const currentPath = location.pathname;

  const activeTab: PortfolioTab = currentPath === "/admin/portfolio/skills"
    ? "skills"
    : currentPath === "/admin/portfolio/projects"
      ? "projects"
      : currentPath === "/admin/portfolio/experience"
        ? "experience"
        : "profile";

  const handleTabChange = (tabId: string) => {
    const tab = tabId as PortfolioTab;
    const paths: Record<PortfolioTab, string> = {
      profile: "/admin/portfolio",
      skills: "/admin/portfolio/skills",
      projects: "/admin/portfolio/projects",
      experience: "/admin/portfolio/experience",
    };
    navigate({ to: paths[tab] });
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <MobileTabBar
          tabs={tabs.map((t) => ({ ...t, id: t.id as PortfolioTab }))}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <div className="flex gap-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
