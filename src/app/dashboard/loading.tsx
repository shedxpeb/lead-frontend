import { Card, CardContent } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-5 lg:space-y-6 w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-card-hover rounded animate-pulse" />
          <div className="h-4 w-64 bg-card-hover/60 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-card-hover rounded animate-pulse" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 lg:p-6">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-card-hover rounded animate-pulse" />
                <div className="h-8 w-16 bg-card-hover rounded animate-pulse" />
                <div className="h-3 w-20 bg-card-hover/60 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <Card>
        <CardContent className="p-5 lg:p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-card-hover rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
