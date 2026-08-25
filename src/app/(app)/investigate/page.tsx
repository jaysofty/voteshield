import { Suspense } from "react";

import InvestigateClient from "./investigate-client";
import { Skeleton } from "@/components/ui/skeleton";

function InvestigationLoading() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Search skeleton */}
      <div className="mt-8">
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      {/* Content skeleton */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function InvestigatePage() {
  return (
    <Suspense fallback={<InvestigationLoading />}>
      <InvestigateClient />
    </Suspense>
  );
}