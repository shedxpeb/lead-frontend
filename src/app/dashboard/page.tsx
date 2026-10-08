'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { useDashboardFollowUps } from '@/features/leads/hooks/useFollowUps';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import { Plus, Phone, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: leadsData, isLoading } = useLeads({
    page: 1,
    pageSize: 1000,
  });

  const { data: followUpsData, isLoading: followUpsLoading } = useDashboardFollowUps();

  const leads = leadsData?.data?.rows || [];
  const followUps = followUpsData?.data || { overdue: [], today: [], upcoming: [], completed: [] };

  const metrics = {
    total: leads.length,
    new: leads.filter((l: any) => l.status === 'New').length,
    todayFollowUps: followUps.today.length,
    overdue: followUps.overdue.length,
    interested: leads.filter((l: any) => l.status === 'Contacted').length,
    quotationSent: leads.filter((l: any) => l.status === 'DesignPending').length,
    negotiation: leads.filter((l: any) => l.status === 'Negotiation').length,
    won: leads.filter((l: any) => l.status === 'Converted').length,
    lost: leads.filter((l: any) => l.status === 'Rejected').length,
  };

  const recentLeads = leads
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[26px] md:text-[28px] font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-[13px] md:text-[14px] text-muted-foreground mt-0.5">Track your leads and follow-ups</p>
          </div>
          <Link href="/dashboard/leads">
            <Button className="h-[42px] px-4 hidden sm:flex rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </Link>
        </div>

        <div className="sm:hidden pb-4">
          <Link href="/dashboard/leads" className="block w-full">
            <Button className="w-full h-[42px] rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <KPICard
              data={{
                title: 'Total Leads',
                value: metrics.total,
                change: 12,
                icon: <TrendingUp className="w-5 h-5" />,
                color: 'blue',
              }}
            />
            <KPICard
              data={{
                title: 'New Leads',
                value: metrics.new,
                change: 5,
                icon: <Plus className="w-5 h-5" />,
                color: 'green',
              }}
            />
            <KPICard
              data={{
                title: "Today's Follow-ups",
                value: metrics.todayFollowUps,
                change: 0,
                icon: <Phone className="w-5 h-5" />,
                color: 'orange',
              }}
            />
            <KPICard
              data={{
                title: 'Overdue',
                value: metrics.overdue,
                change: 0,
                icon: <AlertCircle className="w-5 h-5" />,
                color: 'red',
              }}
            />
            <KPICard
              data={{
                title: 'Interested',
                value: metrics.interested,
                change: 0,
                icon: <CheckCircle className="w-5 h-5" />,
                color: 'purple',
              }}
            />
            <KPICard
              data={{
                title: 'Quotation Sent',
                value: metrics.quotationSent,
                change: 0,
                icon: <Clock className="w-5 h-5" />,
                color: 'yellow',
              }}
            />
            <KPICard
              data={{
                title: 'Negotiation',
                value: metrics.negotiation,
                change: 0,
                icon: <TrendingUp className="w-5 h-5" />,
                color: 'indigo',
              }}
            />
            <KPICard
              data={{
                title: 'Won',
                value: metrics.won,
                change: 0,
                icon: <CheckCircle className="w-5 h-5" />,
                color: 'green',
              }}
            />
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Today's Follow-ups</h2>
              <Link href="/dashboard/leads" className="text-sm text-primary hover:text-primary/80">
                View All Leads
              </Link>
            </div>
            {followUpsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : followUps.today.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✓</div>
                <p className="text-sm text-muted-foreground">No follow-ups for today</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followUps.today.map((followUp: any) => (
                  <div key={followUp.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {new Date(followUp.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {followUp.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{followUp.lead?.clientName}</p>
                      <p className="text-xs text-muted-foreground">{followUp.lead?.companyName || 'No company'}</p>
                      {followUp.lead?.phone && (
                        <p className="text-xs text-muted-foreground">{followUp.lead.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/leads/${followUp.leadId}`}>
                        <Button size="sm" variant="outline" className="rounded-lg">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {followUps.overdue.length > 0 && (
            <div className="bg-card border border-destructive/50 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Overdue Follow-ups
                </h2>
                <Link href="/dashboard/leads" className="text-sm text-primary hover:text-primary/80">
                  View All Leads
                </Link>
              </div>
              <div className="space-y-3">
                {followUps.overdue.map((followUp: any) => (
                  <div key={followUp.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-destructive/10 rounded-lg gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {new Date(followUp.scheduledAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                          {followUp.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{followUp.lead?.clientName}</p>
                      <p className="text-xs text-muted-foreground">{followUp.lead?.companyName || 'No company'}</p>
                      {followUp.lead?.phone && (
                        <p className="text-xs text-muted-foreground">{followUp.lead.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/leads/${followUp.leadId}`}>
                        <Button size="sm" variant="destructive" className="rounded-lg">
                          Follow Up Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Recently Added Leads</h2>
              <Link href="/dashboard/leads" className="text-sm text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors gap-3 sm:gap-0">
                  <div>
                    <p className="font-medium text-foreground">{lead.clientName}</p>
                    <p className="text-sm text-muted-foreground">{lead.companyName || 'No company'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lead.priority === 'URGENT' ? 'bg-destructive/10 text-destructive' :
                      lead.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                      lead.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {lead.priority}
                    </span>
                    <Link href={`/dashboard/leads/${lead.id}`}>
                      <Button size="sm" variant="outline" className="rounded-lg">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </MainLayout>
  );
}
