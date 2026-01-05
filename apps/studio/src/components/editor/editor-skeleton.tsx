import { Skeleton } from "@elcokiin/ui/skeleton";

function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Back button skeleton */}
          <Skeleton className="size-8 rounded" />
          
          {/* Title and metadata skeleton */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        {/* Settings button skeleton */}
        <Skeleton className="size-8 rounded" />
      </div>

      {/* Editor content skeleton */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Title line */}
          <Skeleton className="h-8 w-3/4" />
          
          {/* Content lines */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          
          {/* Image placeholder */}
          <Skeleton className="h-32 w-full" />
          
          {/* More content lines */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export { EditorSkeleton };
