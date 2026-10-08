'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentWrapperProps {
  children: ReactNode;
  className?: string;
}

export const ContentWrapper = function ContentWrapper({ children, className }: ContentWrapperProps) {
  return (
    <div className={cn(
      // Responsive horizontal padding
      'px-4 py-5', // Mobile: 16px
      'sm:px-5 sm:py-6', // Large mobile: 20px
      'md:px-6 md:py-6', // Tablet: 24px
      'lg:px-8 lg:py-7', // Laptop: 32px
      'xl:px-10 xl:py-8', // Desktop: 40px
      '2xl:px-12 2xl:py-8', // Large desktop: 48px
      // Full width on mobile/tablet, max-width on desktop only
      'w-full',
      'lg:max-w-content-2xl', // Max 1600px only on lg+
      'lg:mx-auto', // Center only on lg+
      'overflow-x-hidden',
      className
    )}>
      {children}
    </div>
  );
};
