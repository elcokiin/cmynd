import type { LucideIcon } from "lucide-react";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { useQuery } from "convex/react";
import {
  BarChart3Icon,
  FileCheckIcon,
  FileTextIcon,
  HourglassIcon,
} from "lucide-react";

import { cn } from "@elcokiin/ui/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  valueClassName?: string;
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  valueClassName,
}: StatCardProps): React.ReactNode {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function DashboardStatsGridSkeleton(): React.ReactNode {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardStatsGrid(): React.ReactNode {
  const stats = useQuery(api.documents.queries.getAdminStats);

  if (stats === undefined) {
    return <DashboardStatsGridSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Documents"
        value={stats.totalDocuments}
        description="All documents in system"
        icon={BarChart3Icon}
      />

      <StatCard
        title="Building"
        value={stats.buildingCount}
        description="Documents in progress"
        icon={FileTextIcon}
      />

      <StatCard
        title="Pending Review"
        value={stats.pendingCount}
        description="Awaiting approval"
        icon={HourglassIcon}
        valueClassName="text-yellow-600"
      />

      <StatCard
        title="Published"
        value={stats.publishedCount}
        description="Live documents"
        icon={FileCheckIcon}
        valueClassName="text-green-600"
      />
    </div>
  );
}
