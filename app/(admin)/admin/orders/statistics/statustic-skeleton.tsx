export default function OrderStatisticSkeleton() {
  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart Skeleton */}
        <div className="p-6 rounded-lg border bg-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            {/* Bar Chart Placeholder */}
            <div className="h-[300px] w-full flex items-end gap-1">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="w-full bg-gray-200 animate-pulse rounded-t"
                  style={{
                    height: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
            {/* X-axis dates */}
            <div className="flex justify-between pt-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart Skeleton */}
        <div className="p-6 rounded-lg border bg-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Line Chart Placeholder */}
            <div className="h-[300px] relative">
              <div className="absolute inset-0 bg-gray-200 rounded animate-pulse opacity-20" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-200 animate-pulse" />
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-200 animate-pulse" />
            </div>
            {/* Chart Footer */}
            <div className="space-y-2">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
