'use client';

import { ReactNode } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';
import { MainLayout } from '@/layouts/MainLayout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <MainLayout>{children}</MainLayout>
    </AuthGate>
  );
}
