import type { ReactNode } from "react";

import { buttonVariants } from "@elcokiin/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@elcokiin/ui/breadcrumb";
import { cn } from "@elcokiin/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type PageHeaderProps = {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string;
  showThemeToggle?: boolean;
  children?: ReactNode;
};

function PageHeader({
  title,
  breadcrumbs,
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
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb className="mb-1">
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                      <div key={index} className="contents">
                        <BreadcrumbItem>
                          {isLast || !item.to ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              render={(props) => (
                                <Link to={item.to} {...props}>
                                  {item.label}
                                </Link>
                              )}
                            />
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                      </div>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}

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
