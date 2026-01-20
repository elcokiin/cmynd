import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@elcokiin/ui/lib/utils";
import { Button } from "@elcokiin/ui/button";
import { ThemeToggle } from "@elcokiin/ui/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import {
  FileTextIcon,
  HomeIcon,
  MenuIcon,
  SettingsIcon,
  ShieldIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = useQuery(api.auth.isCurrentUserAdmin);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: HomeIcon,
      active: location.pathname === "/",
    },
  ];

  if (isAdmin) {
    navItems.push({
      label: "Admin",
      to: "/admin/dashboard",
      icon: ShieldIcon,
      active: location.pathname.startsWith("/admin"),
    });
  }

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-bold">Studio</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-4 px-2">
          <nav className="grid gap-1">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between pt-2">
            <UserMenu />
          </div>
        </div>
      </aside>
    </>
  );
}
