import { Card, CardContent, CardHeader } from "@elcokiin/ui/card";
import { Skeleton } from "@elcokiin/ui/skeleton";

export function ReviewSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Document List Skeleton */}
        <div className="w-64 border-r p-4 space-y-3 hidden md:block">
          <Skeleton className="h-5 w-24 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 p-3 rounded-lg border">
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Preview Skeleton */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-24" />
            <div className="space-y-3 mt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-80 border-l p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2 p-3 rounded-lg border">
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewPreviewSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3 mt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function ReviewSidebarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
