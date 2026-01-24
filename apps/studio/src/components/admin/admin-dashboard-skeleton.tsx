import { Card, CardContent, CardHeader } from "@elcokiin/ui/card";
import { Skeleton } from "@elcokiin/ui/skeleton";

export function AdminDashboardSkeleton(): React.ReactNode {
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
