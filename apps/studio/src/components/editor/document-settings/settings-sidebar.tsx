import {
  DialogHeader,
  DialogTitle,
} from "@elcokiin/ui/dialog";
import { cn } from "@elcokiin/ui/lib/utils";
import {
  BookOpenIcon,
  ImageIcon,
  LinkIcon,
} from "lucide-react";

export type NavigationSection = "cover" | "reprint" | "inspirations";

type SettingsSidebarProps = {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
  disabledSections?: NavigationSection[];
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
  disabledSections = [],
}: SettingsSidebarProps) {
  return (
    <div className="w-56 border-r bg-muted/30 p-4 flex flex-col gap-1">
      <DialogHeader className="pb-4">
        <DialogTitle className="text-sm font-medium">
          Settings
        </DialogTitle>
      </DialogHeader>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isDisabled = disabledSections.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSectionChange(item.id)}
            title={isDisabled ? "Not available for reprints" : item.label}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
              isDisabled && "opacity-40 cursor-not-allowed",
              !isDisabled && activeSection === item.id
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
