'use client';

import { MainLayout } from '@/layouts/MainLayout';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-[26px] md:text-[28px] font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-[13px] md:text-[14px] text-muted-foreground mt-0.5">Manage your account settings</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <p className="text-muted-foreground">Settings functionality coming soon.</p>
        </div>
      </div>
    </MainLayout>
  );
}
