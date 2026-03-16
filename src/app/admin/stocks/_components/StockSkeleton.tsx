"use client";

export default function StockSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Overview Skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex justify-between mb-4">
          <div>
            <div className="h-5 w-40 bg-white/5 rounded mb-2" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
          <div className="text-right">
            <div className="h-7 w-32 bg-white/5 rounded mb-1" />
            <div className="h-4 w-20 bg-white/5 rounded ml-auto" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/3" />
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="h-4 w-16 bg-white/5 rounded mb-3" />
        <div className="h-[400px] rounded-lg bg-white/3" />
      </div>

      {/* Metrics + Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="h-4 w-24 bg-white/5 rounded mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-white/3" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="h-4 w-24 bg-white/5 rounded mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/3" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}