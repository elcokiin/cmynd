import type { ReactNode } from "react";

import { buttonVariants } from "@elcokiin/ui/button";
import { Breadcrumbs } from "./breadcrumbs";

type PageHeaderProps = {
  title: string;
  // Deprecated: breadcrumbs are now handled automatically by the Breadcrumbs component
  // but keeping for backward compat if needed, though we will ignore it in the new design
  breadcrumbs?: { label: string; to?: string }[];
  backTo?: string;
  showThemeToggle?: boolean;
  children?: ReactNode;
};

function PageHeader({
  title,
  backTo,
  showThemeToggle = true,
  children,
}: PageHeaderProps): ReactNode {
  return (
    <header className="border-b px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {backTo && (
            <Link
              to={backTo}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          )}

          <div className="min-w-0 flex-1">
            <Breadcrumbs />
            <h1 className="text-xl font-bold truncate">{title}</h1>
          </div>
        </div>

        {(showThemeToggle || children) && (
          <div className="flex items-center gap-2 shrink-0">
            {showThemeToggle && <ThemeToggle />}
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

export { PageHeader };
export type { PageHeaderProps, BreadcrumbItem };
