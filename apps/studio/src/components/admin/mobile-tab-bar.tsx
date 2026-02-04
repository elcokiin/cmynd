import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@elcokiin/ui/lib/utils";

type TabConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  disabled?: boolean;
};

type MobileTabBarProps = {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

function MobileTabBar({
  tabs,
  activeTab,
  onTabChange,
}: MobileTabBarProps): ReactNode {
  return (
    <div className="md:hidden border-b flex">
      {tabs.map((tab) => (
        <MobileTabButton
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          icon={tab.icon}
          label={tab.label}
          badge={tab.badge}
          disabled={tab.disabled}
        />
      ))}
    </div>
  );
}

type MobileTabButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  badge?: number;
  disabled?: boolean;
};

function MobileTabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
  disabled,
}: MobileTabButtonProps): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors",
        active && "border-b-2 border-primary text-primary",
        !active && "text-muted-foreground hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

export { MobileTabBar };
export type { MobileTabBarProps, TabConfig };
