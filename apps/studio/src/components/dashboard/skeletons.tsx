import { Card, CardContent, CardHeader } from "@elcokiin/ui/card";
import { Skeleton } from "@elcokiin/ui/skeleton";

export function DashboardSkeleton(): React.ReactNode {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <DocumentListSkeleton />
    </div>
  );
}

export function DocumentListSkeleton({ count = 6 }: { count?: number }): React.ReactNode {
  return (
    <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
