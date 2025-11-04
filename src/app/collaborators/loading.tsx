import Spinner from "@/components/ui/Spinner";
import { translations } from "@/lib/translations";

export default function CollaboratorsLoading() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-[200px]" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border bg-card p-6 shadow-sm"
          >
            {/* Photo Skeleton */}
            <div className="mb-4 flex justify-center">
              <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
            </div>
            {/* Name Skeleton */}
            <div className="mb-3 mx-auto h-6 w-3/4 animate-pulse rounded-md bg-muted" />
            {/* Lots Skeleton */}
            <div className="mb-4 space-y-2">
              <div className="mx-auto h-4 w-32 animate-pulse rounded-md bg-muted" />
              <div className="flex flex-wrap justify-center gap-2">
                <div className="h-6 w-12 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
            {/* Buttons Skeleton */}
            <div className="mt-6 flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
              <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-8">
        <Spinner className="mr-2" />
        <span className="text-muted-foreground">
          {translations.status.loading}
        </span>
      </div>
    </div>
  );
}
