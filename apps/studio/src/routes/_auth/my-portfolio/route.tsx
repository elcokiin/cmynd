import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/my-portfolio")({
  component: MyPortfolioLayout,
});

function MyPortfolioLayout() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
