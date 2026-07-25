import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/admin/portfolio")({
  component: PortfolioLayout,
});

function PortfolioLayout() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
