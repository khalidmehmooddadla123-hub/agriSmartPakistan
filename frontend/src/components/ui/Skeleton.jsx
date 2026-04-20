/**
 * Reusable skeleton loading components
 */

export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />;
}

export function SkeletonCircle({ size = 'w-10 h-10' }) {
  return <div className={`${size} bg-gray-200 rounded-full animate-pulse`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-1/3" height="h-5" />
        <SkeletonLine width="w-16" height="h-4" />
      </div>
      <SkeletonLine width="w-full" height="h-20" />
      <div className="flex gap-2">
        <SkeletonLine width="w-1/4" />
        <SkeletonLine width="w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width="w-24" height="h-3" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex gap-4 border-t border-gray-50">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} width={j === 0 ? 'w-32' : 'w-20'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome header */}
      <div className="bg-green-600/20 rounded-2xl p-6 h-24" />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <div className="md:col-span-2">
          <SkeletonCard />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 h-72" />
        <div className="bg-white rounded-2xl border border-gray-100 p-5 h-72" />
      </div>

      {/* News */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <SkeletonLine width="w-40" height="h-5" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3">
            <div className="flex-1 space-y-2">
              <SkeletonLine width="w-16" height="h-3" />
              <SkeletonLine width="w-full" height="h-4" />
              <SkeletonLine width="w-1/3" height="h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonNotifications() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <SkeletonCircle size="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <SkeletonLine width="w-1/3" height="h-4" />
              <SkeletonLine width="w-full" height="h-3" />
              <SkeletonLine width="w-24" height="h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
