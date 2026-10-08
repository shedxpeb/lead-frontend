'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPICard as KPICardType } from '@/types';

interface KPICardProps {
  data: KPICardType;
  onClick?: () => void;
  showComparison?: boolean;
}

export const KPICard = memo(function KPICard({ data, onClick, showComparison = false }: KPICardProps) {
  const isPositive = data.change >= 0;
  const color = data.color || (isPositive ? 'text-green-600' : 'text-red-600');

  return (
    <Card
      className={cn(
        'cursor-pointer',
        onClick && 'hover:border-blue-300'
      )}
      onClick={onClick}
    >
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{data.title}</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{data.value}</p>

              {/* Change Percentage */}
              {data.change !== 0 && (
                <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                  {isPositive ? (
                    <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />
                  )}
                  <span className={cn('text-xs sm:text-sm font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
                    {Math.abs(data.change)}%
                  </span>
                  {showComparison && data.comparisonLabel && (
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {data.comparisonLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className={cn('text-xl sm:text-2xl flex-shrink-0', color)}>
              {data.icon}
            </div>
          </div>
        </CardContent>
    </Card>
  );
});
