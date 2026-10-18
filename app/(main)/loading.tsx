import { Skeleton } from "@/components/ui/skeleton";

export default function MainLoading() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {/* Server sidebar skeleton */}
      <div className="flex w-[72px] flex-col items-center gap-2 bg-slate-900 py-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="my-2 h-px w-8 bg-slate-700" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-12 rounded-3xl" />
        ))}
      </div>

      {/* Channel sidebar skeleton */}
      <div className="flex w-60 flex-col bg-slate-800/50">
        <Skeleton className="m-3 h-6 w-36" />
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col bg-slate-900/50">
        <Skeleton className="m-3 h-8 w-48" />
        <div className="flex-1 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4 flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-1 h-4 w-24" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
