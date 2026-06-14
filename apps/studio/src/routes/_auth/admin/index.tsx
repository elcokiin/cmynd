import { createFileRoute } from "@tanstack/react-router";

import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import { DashboardStatsGrid } from "@/components/admin/dashboard-stats-grid";
import { DashboardDocumentList } from "@/components/admin/dashboard-document-list";

type DashboardSearch = {
  page?: number;
  status?: "pending" | "published" | "all";
  search?: string;
};

export const Route = createFileRoute("/_auth/admin/")({
  component: AdminDashboard,
  pendingComponent: AdminDashboardSkeleton,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      page: Number(search.page) || 1,
      status: (search.status as "pending" | "published" | "all") || "pending",
      search: (search.search as string) || "",
    };
  },
});

function AdminDashboard() {
  const { page: urlPage = 1, status = "pending", search = "" } = Route.useSearch();

  return (
    <div className="flex flex-col h-full">
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

        {/* Documents List Component */}
        <DashboardDocumentList urlPage={urlPage} status={status} search={search} />
      </div>
    </div>
  );
}
