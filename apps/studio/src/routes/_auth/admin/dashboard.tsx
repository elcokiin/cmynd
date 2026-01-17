import { useEffect } from "react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { buttonVariants } from "@elcokiin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Pagination } from "@elcokiin/ui/pagination";
import { cn } from "@elcokiin/ui/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
  BarChart3Icon,
  FileCheckIcon,
  FileTextIcon,
  HourglassIcon,
} from "lucide-react";

import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import { PageHeader } from "@/components/page-header";
import { useManualPagination } from "@/hooks/use-manual-pagination";

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
  const navigate = useNavigate({ from: Route.fullPath });
  const { page: urlPage = 1 } = Route.useSearch();
  const stats = useQuery(api.documents.queries.getAdminStats);
  const ITEMS_PER_PAGE = 5;

  const pagination = useManualPagination(
    api.documents.queries.listPendingForAdmin,
    {},
    ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (pagination.currentPage !== urlPage) {
      pagination.goToPage(urlPage);
    }
  }, [urlPage, pagination]);

  useEffect(() => {
    if (pagination.currentPage !== urlPage && !pagination.isLoading) {
      navigate({
        search: { page: pagination.currentPage },
      });
    }
  }, [pagination.currentPage, urlPage, pagination.isLoading, navigate]);

  const isLoading = stats === undefined || pagination.isLoading;
  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  const pendingDocuments = pagination.items;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Admin Dashboard"
        backTo="/"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Admin" }]}
      />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of all documents in the system
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  All documents in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Building</CardTitle>
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.buildingCount}</div>
                <p className="text-xs text-muted-foreground">
                  Documents in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Review
                </CardTitle>
                <HourglassIcon className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pendingCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <FileCheckIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.publishedCount}
                </div>
                <p className="text-xs text-muted-foreground">Live documents</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Documents with Pagination */}
          {pendingDocuments && pendingDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Documents</CardTitle>
                  <Link
                    to="/admin/review"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2",
                    )}
                  >
                    Review All
                    <FileCheckIcon className="h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {pendingDocuments.map((doc) => (
                    <Link
                      key={doc._id}
                      to="/admin/review"
                      search={{ doc: doc._id }}
                      className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-muted/50 rounded px-2 -mx-2 py-1 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{doc.title || "Untitled"}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doc.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(doc.submittedAt ?? doc.updatedAt))}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.goToPage}
                    showFirstLast={false}
                    className="pt-2 border-t"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {pendingDocuments &&
            pendingDocuments.length === 0 &&
            pagination.currentPage === 1 && (
              <Card>
                <CardContent className="py-10 text-center">
                  <HourglassIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No documents pending review
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </main>
    </div>
  );
}
