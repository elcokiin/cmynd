//
// ADMIN DASHBOARD
//
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button, buttonVariants } from "@elcokiin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Skeleton } from "@elcokiin/ui/skeleton";
import { cn } from "@elcokiin/ui/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import {
  ArrowLeftIcon,
  BarChart3Icon,
  FileCheckIcon,
  FileTextIcon,
  HourglassIcon,
} from "lucide-react";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center h-full">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </Unauthenticated>
      <AuthLoading>
        <DashboardSkeleton />
      </AuthLoading>
    </>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const stats = useQuery(api.documents.getAdminStats, {});
  const pendingDocuments = useQuery(api.documents.listPendingForAdmin, {});

  if (stats === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">
          You don't have permission to access the admin panel.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Go to Home</Button>
      </div>
    );
  }

  if (stats === undefined || pendingDocuments === undefined) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

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
                <div className="text-2xl font-bold">{stats.building}</div>
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
                  {stats.pending}
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
                  {stats.published}
                </div>
                <p className="text-xs text-muted-foreground">Live documents</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Pending Documents */}
          {pendingDocuments && pendingDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Pending Documents</CardTitle>
                  <Link
                    to="/"
                    search={{ tab: "review" }}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2",
                    )}
                  >
                    View All
                    <FileCheckIcon className="h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingDocuments.slice(0, 5).map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pendingDocuments && pendingDocuments.length === 0 && (
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

function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-4 py-3">
        <Skeleton className="h-8 w-48" />
      </header>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
