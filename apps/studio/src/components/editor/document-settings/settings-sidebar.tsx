import {
  DialogHeader,
  DialogTitle,
} from "@elcokiin/ui/dialog";
import { cn } from "@elcokiin/ui/lib/utils";
import {
  BookOpenIcon,
  DownloadIcon,
  ImageIcon,
  LinkIcon,
} from "lucide-react";

export type NavigationSection = "cover" | "reprint" | "inspirations" | "export";

type SettingsSidebarProps = {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
  showExport: boolean;
};

const navItems: {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "cover", label: "Cover", icon: ImageIcon },
  { id: "reprint", label: "Reprint", icon: BookOpenIcon },
  { id: "inspirations", label: "Inspirations", icon: LinkIcon },
];

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  showExport,
}: SettingsSidebarProps) {
  const items = showExport
    ? [...navItems, { id: "export" as const, label: "Export", icon: DownloadIcon }]
    : navItems;

  return (
    <div className="w-56 border-r bg-muted/30 p-4 flex flex-col gap-1">
      <DialogHeader className="pb-4">
        <DialogTitle className="text-sm font-medium">
          Settings
        </DialogTitle>
      </DialogHeader>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
              activeSection === item.id
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
