'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Lead, LeadStatus, LeadPriority, LeadSource } from '@/types/leads';
import { useLeads, useDeleteLead, useCreateLead, useUpdateLead } from '@/features/leads/hooks/useLeads';
import { toast } from '@/components/ui/toast';
import { MobileLeadCard } from '@/features/leads/components/MobileLeadCard';
import {
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

// Status options derived from Prisma schema enum
const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'DesignPending', 'EstimateSent', 'ProposalSent', 'Negotiation', 'Approved', 'Rejected', 'Converted'];
const PRIORITY_OPTIONS: LeadPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const SOURCE_OPTIONS: LeadSource[] = ['Website', 'Referral', 'ColdCall', 'Email', 'SocialMedia', 'TradeShow', 'Advertisement', 'Other'];

const statusBadge = (value: LeadStatus) => {
  const variants: Record<LeadStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    New: 'default',
    Contacted: 'secondary',
    DesignPending: 'outline',
    EstimateSent: 'outline',
    ProposalSent: 'outline',
    Negotiation: 'secondary',
    Approved: 'default',
    Rejected: 'destructive',
    Converted: 'default',
  };
  return <Badge variant={variants[value] || 'default'} className="text-[11px] font-semibold rounded-full px-[10px] py-1">{value}</Badge>;
};

const priorityBadge = (value: LeadPriority | undefined) => {
  if (!value) return <span className="text-[11px] text-muted-foreground">-</span>;
  const variants: Record<LeadPriority, 'default' | 'secondary' | 'destructive'> = {
    Low: 'secondary',
    Medium: 'default',
    High: 'default',
    Urgent: 'destructive',
  };
  return <Badge variant={variants[value]} className="text-[11px] font-semibold rounded-full px-[10px] py-1">{value}</Badge>;
};

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeadsPage() {
  const router = useRouter();
  const deleteLeadMutation = useDeleteLead();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [sortBy] = useState('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  // Simple form state
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: '',
    source: undefined as LeadSource | undefined,
    requirementType: '',
    requirement: '',
    estimatedValue: '',
    priority: undefined as LeadPriority | undefined,
    status: 'New' as LeadStatus,
    initialNotes: '',
  });

  // Responsive breakpoint
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Fetch leads
  const { data: leadsResponse, isLoading, error, refetch } = useLeads({
    page: currentPage,
    pageSize,
    search: searchQuery.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    source: sourceFilter === 'all' ? undefined : sourceFilter,
    sortBy,
    sortOrder,
  });

  const leads = leadsResponse?.data?.rows || [];
  const pagination = leadsResponse?.data?.pagination;
  const summary = leadsResponse?.data?.summary;

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
      };
      await createLeadMutation.mutateAsync(dataToSubmit);
      toast.success('Lead created successfully');
      setIsCreateDialogOpen(false);
      setFormData({
        clientName: '',
        companyName: '',
        phone: '',
        whatsapp: '',
        email: '',
        city: '',
        source: undefined,
        requirementType: '',
        requirement: '',
        estimatedValue: '',
        priority: undefined,
        status: 'New',
        initialNotes: '',
      });
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create lead';
      toast.error(errorMessage);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const dataToSubmit = {
        ...formData,
        estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
      };
      await updateLeadMutation.mutateAsync({ id: selectedLead.id, data: dataToSubmit });
      toast.success('Lead updated successfully');
      setIsEditDialogOpen(false);
      setSelectedLead(null);
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lead';
      toast.error(errorMessage);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLeadMutation.mutateAsync(id);
      toast.success('Lead deleted successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete lead';
      toast.error(errorMessage);
    }
  };

  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      clientName: lead.clientName,
      companyName: lead.companyName || '',
      phone: lead.phone,
      whatsapp: lead.whatsapp || '',
      email: lead.email || '',
      city: lead.city || '',
      source: lead.source || undefined,
      requirementType: lead.requirementType || '',
      requirement: lead.requirement,
      estimatedValue: lead.estimatedValue?.toString() || '',
      priority: lead.priority || undefined,
      status: lead.status,
      initialNotes: lead.initialNotes || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[26px] md:text-[28px] font-bold text-foreground tracking-tight">Leads</h1>
            <p className="text-[13px] md:text-[14px] text-muted-foreground mt-0.5">Manage and track your business opportunities</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-[42px] px-4 hidden sm:flex rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Mobile Add Lead Button */}
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full h-[42px] sm:hidden mb-5 rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
          <div className="bg-card border border-border rounded-[14px] p-4 md:p-[18px]">
            <div className="text-[12px] font-medium text-muted-foreground mb-1">Total</div>
            <div className="text-[24px] font-bold text-foreground">{summary?.total || 0}</div>
          </div>
          <div className="bg-card border border-border rounded-[14px] p-4 md:p-[18px]">
            <div className="text-[12px] font-medium text-muted-foreground mb-1">New</div>
            <div className="text-[24px] font-bold text-foreground">{summary?.new || 0}</div>
          </div>
          <div className="bg-card border border-border rounded-[14px] p-4 md:p-[18px]">
            <div className="text-[12px] font-medium text-muted-foreground mb-1">Contacted</div>
            <div className="text-[24px] font-bold text-foreground">{summary?.contacted || 0}</div>
          </div>
          <div className="bg-card border border-border rounded-[14px] p-4 md:p-[18px]">
            <div className="text-[12px] font-medium text-muted-foreground mb-1">Converted</div>
            <div className="text-[24px] font-bold text-foreground">{summary?.converted || 0}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-[44px] border-input rounded-xl"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[140px] md:w-[160px] border-input rounded-lg">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-10 w-[140px] md:w-[160px] border-input rounded-lg">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-10 w-[140px] md:w-[160px] border-input rounded-lg">
              <SelectValue placeholder="All Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Source</SelectItem>
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => refetch()} variant="outline" size="default" className="h-10 border-input rounded-lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Leads Display */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground">Loading leads...</div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-destructive mb-4">Failed to load leads</div>
            <Button onClick={() => refetch()} variant="outline">Try Again</Button>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No leads found</h3>
              <p className="text-sm text-muted-foreground mb-6">Try changing your filters or search query, or create a new lead.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: Card Layout */}
            {isMobile ? (
              <div className="grid grid-cols-1 gap-3">
                {leads.map((lead) => (
                  <MobileLeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteLead}
                  />
                ))}
              </div>
            ) : (
              /* Desktop/Tablet: Table Layout */
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">ID</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Date</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Client</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Company</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Phone</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Requirement</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Source</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Status</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Priority</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Next Follow-up</th>
                        <th className="text-left px-4 py-[12px] text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-t border-border hover:bg-muted/50 transition-colors min-h-[72px]">
                          <td className="px-4 py-[16px] font-mono text-xs text-muted-foreground">#{lead.leadNumber}</td>
                          <td className="px-4 py-[16px] text-[13px] text-foreground">{formatDate(lead.createdAt)}</td>
                          <td className="px-4 py-[16px]">
                            <div className="text-[13px] md:text-[14px] font-semibold text-foreground">{lead.clientName}</div>
                            {lead.companyName && (
                              <div className="text-[11px] md:text-[12px] text-muted-foreground">{lead.companyName}</div>
                            )}
                          </td>
                          <td className="px-4 py-[16px] text-[13px] text-foreground">{lead.companyName || '-'}</td>
                          <td className="px-4 py-[16px] text-[13px] text-foreground">{lead.phone || '-'}</td>
                          <td className="px-4 py-[16px] text-[13px] text-foreground max-w-[200px] truncate" title={lead.requirement}>{lead.requirement || '-'}</td>
                          <td className="px-4 py-[16px] text-[13px] text-muted-foreground">{lead.source || '-'}</td>
                          <td className="px-4 py-[16px]">{statusBadge(lead.status)}</td>
                          <td className="px-4 py-[16px]">{priorityBadge(lead.priority)}</td>
                          <td className="px-4 py-[16px] text-[13px] text-foreground">{formatDate(lead.nextFollowUpAt)}</td>
                          <td className="px-4 py-[16px]">
                            <div className="flex items-center gap-1.5">
                              <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/leads/${lead.id}`)} className="h-9 w-9 p-0 rounded-lg">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(lead)} className="h-9 w-9 p-0 rounded-lg">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteLead(lead.id)} className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!pagination.hasPrevious}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="h-9 px-4 rounded-lg"
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!pagination.hasNext}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="h-9 px-4 rounded-lg"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Pagination */}
            {isMobile && pagination && (
              <div className="flex items-center justify-between gap-3 mt-4 p-4 bg-white border border-neutral-200 rounded-2xl">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagination.hasPrevious}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="h-9 px-4 rounded-lg"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagination.hasNext}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="h-9 px-4 rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Lead Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4 pb-20 md:pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Client Name</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">WhatsApp</label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Source</label>
                <Select value={formData.source || ''} onValueChange={(v) => setFormData({ ...formData, source: v === '' ? undefined : v as LeadSource })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {SOURCE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={formData.priority || ''} onValueChange={(v) => setFormData({ ...formData, priority: v === '' ? undefined : v as LeadPriority })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as LeadStatus })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Requirement Type</label>
              <Input
                value={formData.requirementType}
                onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Requirement</label>
              <textarea
                className="w-full min-h-[120px] border border-border rounded-md p-3 text-sm"
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estimated Value</label>
              <Input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Initial Notes</label>
              <textarea
                className="w-full min-h-[100px] border border-border rounded-md p-3 text-sm"
                value={formData.initialNotes}
                onChange={(e) => setFormData({ ...formData, initialNotes: e.target.value })}
              />
            </div>
            <DialogFooter className="fixed bottom-0 left-0 right-0 bg-background p-4 border-t border-border md:static md:border-0 md:p-0">
              <div className="flex gap-3 w-full md:w-auto">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 md:flex-none h-12">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 md:flex-none h-12">
                  Create Lead
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateLead} className="space-y-4 pb-20 md:pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Client Name</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">WhatsApp</label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Source</label>
                <Select value={formData.source || ''} onValueChange={(v) => setFormData({ ...formData, source: v === '' ? undefined : v as LeadSource })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {SOURCE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={formData.priority || ''} onValueChange={(v) => setFormData({ ...formData, priority: v === '' ? undefined : v as LeadPriority })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as LeadStatus })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Requirement Type</label>
              <Input
                value={formData.requirementType}
                onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Requirement</label>
              <textarea
                className="w-full min-h-[120px] border border-border rounded-md p-3 text-sm"
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estimated Value</label>
              <Input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Initial Notes</label>
              <textarea
                className="w-full min-h-[100px] border border-border rounded-md p-3 text-sm"
                value={formData.initialNotes}
                onChange={(e) => setFormData({ ...formData, initialNotes: e.target.value })}
              />
            </div>
            <DialogFooter className="fixed bottom-0 left-0 right-0 bg-background p-4 border-t border-border md:static md:border-0 md:p-0">
              <div className="flex gap-3 w-full md:w-auto">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 md:flex-none h-12">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 md:flex-none h-12">
                  Update Lead
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
