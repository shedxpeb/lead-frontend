/**
 * Card Skeleton Component
 * Loading placeholder for KPI cards and other card components
 */
import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton = memo(function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/70 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="mt-3 sm:mt-4">
              <Skeleton className="h-3 w-24 mb-2" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32 mt-1.5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
});
