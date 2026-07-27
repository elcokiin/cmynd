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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
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
        "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
        active && "text-primary bg-primary/5",
        !active && "text-muted-foreground hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1.5 ml-6 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

export { MobileTabBar };
export type { MobileTabBarProps, TabConfig };
