import * as React from "react"
import { useLocation, Link } from "@tanstack/react-router"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator,
  BreadcrumbEllipsis 
} from "@elcokiin/ui/breadcrumb"

// Map of route paths to readable names
// This can be expanded or moved to a configuration file if it grows too large
const ROUTE_NAME_MAP: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  review: "Review",
  editor: "Editor",
  new: "New Document"
}

export function Breadcrumbs() {
  const location = useLocation()
  
  // Parse path segments, filtering out empty strings and common prefixes
  const pathSegments = location.pathname
    .split("/")
    .filter(segment => segment !== "" && segment !== "_auth")

  // Generate breadcrumb items
  const breadcrumbs = React.useMemo(() => {
    // Start with Home
    const items = [{ label: "Home", to: "/", current: pathSegments.length === 0 }]
    
    let currentPath = ""
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Determine label (use map or capitalize)
      // Check if it's a dynamic segment (like a slug/ID) by context or if it's not in our static map
      // For a more robust solution, we might want to use route matches metadata
      let label = ROUTE_NAME_MAP[segment] || segment
      
      // If it looks like an ID or slug (long mixed string), maybe truncate or label generically?
      // For now, let's just capitalize if not mapped
      if (!ROUTE_NAME_MAP[segment]) {
        // Simple capitalization for unmapped segments
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
      }

      items.push({
        label,
        to: currentPath,
        current: isLast
      })
    })
    
    return items
  }, [pathSegments, location.pathname])

  if (breadcrumbs.length <= 1) return null

  return (
    <Breadcrumb className="hidden md:flex mb-2">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <React.Fragment key={item.to}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                   <BreadcrumbLink asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
