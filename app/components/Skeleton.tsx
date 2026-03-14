export function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <SkeletonBox className="h-4 w-1/3 mb-4" />
      <SkeletonBox className="h-8 w-1/2 mb-3" />
      <SkeletonBox className="h-2 w-full mb-2" />
      <SkeletonBox className="h-3 w-2/3" />
    </div>
  );
}

/** Dashboard skeleton matching the 4-column cards + usage + actions layout */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <SkeletonBox className="h-10 w-48 mb-2" />
          <SkeletonBox className="h-5 w-64" />
        </div>

        {/* Plan / Credits / Emails / CTA cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Usage This Month */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <SkeletonBox className="h-7 w-48 mb-2" />
          <SkeletonBox className="h-4 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <SkeletonBox className="h-4 w-24 mb-3" />
                <SkeletonBox className="h-8 w-16 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <SkeletonBox className="h-7 w-36 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <SkeletonBox className="h-8 w-8 mb-3" />
                <SkeletonBox className="h-5 w-32 mb-2" />
                <SkeletonBox className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Resumes page skeleton matching table layout */
export function ResumesSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <SkeletonBox className="h-10 w-48 mb-2" />
              <SkeletonBox className="h-5 w-72" />
            </div>
            <SkeletonBox className="h-12 w-40 rounded-lg" />
          </div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <SkeletonBox className="h-10 w-64 rounded-lg" />
            <SkeletonBox className="h-10 w-36 rounded-lg" />
            <div className="ml-auto">
              <SkeletonBox className="h-10 w-40 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Table skeleton rows */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex gap-6">
            {["w-1/4", "w-1/6", "w-1/6", "w-1/6", "w-1/6", "w-1/12"].map((w, i) => (
              <SkeletonBox key={i} className={`h-4 ${w}`} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex gap-6 border-b border-gray-100">
              {["w-1/4", "w-1/6", "w-1/6", "w-1/6", "w-1/6", "w-1/12"].map((w, j) => (
                <SkeletonBox key={j} className={`h-4 ${w}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/** Analytics page skeleton matching metrics + sections layout */
export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <SkeletonBox className="h-10 w-64 mb-2" />
          <SkeletonBox className="h-5 w-80" />
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <SkeletonBox className="h-4 w-28 mb-3" />
                  <SkeletonBox className="h-9 w-20" />
                </div>
                <SkeletonBox className="h-10 w-10 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200 mb-8">
          <SkeletonBox className="h-7 w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg p-4 bg-slate-100">
                <SkeletonBox className="h-4 w-24 mx-auto mb-2" />
                <SkeletonBox className="h-7 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <SkeletonBox className="h-7 w-48 mb-6" />
            <SkeletonText lines={5} />
          </div>
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <SkeletonBox className="h-7 w-36 mb-6" />
              <SkeletonText lines={4} />
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <SkeletonBox className="h-7 w-40 mb-6" />
              <SkeletonText lines={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
