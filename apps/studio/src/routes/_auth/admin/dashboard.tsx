import { createFileRoute } from "@tanstack/react-router";

import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import { DashboardStatsGrid } from "@/components/admin/dashboard-stats-grid";
import { DashboardPendingList } from "@/components/admin/dashboard-pending-list";
import { PageHeader } from "@/components/page-header";

type DashboardSearch = {
  page?: number;
};

export const Route = createFileRoute("/_auth/admin/dashboard")({
  component: AdminDashboard,
  pendingComponent: AdminDashboardSkeleton,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      page: Number(search.page) || 1,
    };
  },
});

function AdminDashboard() {
  const { page: urlPage = 1 } = Route.useSearch();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Admin Dashboard"
        backTo="/"
      />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Page Title */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of all documents in the system
            </p>
          </div>

          {/* Stats Grid Component */}
          <DashboardStatsGrid />

          {/* Pending Documents List Component */}
          <DashboardPendingList urlPage={urlPage} />
        </div>
      </main>
    </div>
  );
}
