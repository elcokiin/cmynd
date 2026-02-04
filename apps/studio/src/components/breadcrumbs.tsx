import { useMemo, Fragment } from "react";
import { useLocation, Link, useRouter } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@elcokiin/ui/breadcrumb";

const ROUTE_NAME_MAP: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  review: "Review",
  editor: "Editor",
  new: "New Document",
};

export function Breadcrumbs() {
  const location = useLocation();
  const router = useRouter();

  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "" && segment !== "_auth");

  const breadcrumbs = useMemo(() => {
    const items = [
      {
        label: "Home",
        to: "/",
        current: pathSegments.length === 0,
        exists: true,
      },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      let label = ROUTE_NAME_MAP[segment] || segment;
      if (!ROUTE_NAME_MAP[segment]) {
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      const routeExists = router.matchRoute(currentPath, {
        fuzzy: false,
        caseSensitive: false,
      });

      if (isLast || routeExists) {
        items.push({
          label,
          to: currentPath,
          current: isLast,
          exists: !!routeExists,
        });
      }
    });

    return items;
  }, [pathSegments, location.pathname, router]);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={item.to}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.exists ? (
                  <BreadcrumbLink render={<Link to={item.to} />}>
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="opacity-60">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
