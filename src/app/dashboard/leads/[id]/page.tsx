'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLead, useUpdateLead } from '@/features/leads/hooks/useLeads';
import { useLeadFollowUps, useCreateFollowUp } from '@/features/leads/hooks/useFollowUps';
import { toast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Edit,
} from 'lucide-react';
import { LeadStatus, LeadPriority, LeadSource, FollowUpType, FollowUpResult } from '@/types/leads';

// Options derived from Prisma schema enums
const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'DesignPending', 'EstimateSent', 'ProposalSent', 'Negotiation', 'Approved', 'Rejected', 'Converted'];
const PRIORITY_OPTIONS: LeadPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const SOURCE_OPTIONS: LeadSource[] = ['Website', 'Referral', 'ColdCall', 'Email', 'SocialMedia', 'TradeShow', 'Advertisement', 'Other'];
const FOLLOWUP_TYPES: FollowUpType[] = ['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'SITE_VISIT', 'OTHER'];
const FOLLOWUP_RESULTS: FollowUpResult[] = ['INTERESTED', 'NEED_MORE_INFORMATION', 'QUOTATION_REQUIRED', 'QUOTATION_SENT', 'WAITING', 'NOT_INTERESTED', 'CALL_BACK_LATER', 'OTHER'];

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { data: leadData, isLoading, refetch } = useLead(leadId);
  const updateLeadMutation = useUpdateLead();
  const createFollowUpMutation = useCreateFollowUp();
  const lead = leadData?.data || null;
  const { data: followUpsData, refetch: refetchFollowUps } = useLeadFollowUps(leadId);
  const followUps = followUpsData?.data || [];

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
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

  const [followUpForm, setFollowUpForm] = useState({
    type: 'CALL' as FollowUpType,
    scheduledAt: new Date().toISOString().slice(0, 16),
    notes: '',
    result: '' as FollowUpResult | '',
  });

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    try {
      const dataToSubmit = {
        ...editFormData,
        estimatedValue: editFormData.estimatedValue ? Number(editFormData.estimatedValue) : undefined,
      };
      await updateLeadMutation.mutateAsync({ id: leadId, data: dataToSubmit });
      toast.success('Lead updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lead';
      toast.error(errorMessage);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    try {
      const followUpData = {
        type: followUpForm.type,
        scheduledAt: followUpForm.scheduledAt ? new Date(followUpForm.scheduledAt).toISOString() : undefined,
        notes: followUpForm.notes,
        result: followUpForm.result || undefined,
      };
      await createFollowUpMutation.mutateAsync({ leadId, data: followUpData });
      toast.success('Follow-up added successfully');
      setIsAddFollowUpOpen(false);
      setFollowUpForm({
        type: 'CALL',
        scheduledAt: new Date().toISOString().slice(0, 16),
        notes: '',
        result: '',
      });
      refetch();
      refetchFollowUps();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add follow-up';
      toast.error(errorMessage);
    }
  };

  const openEditDialog = () => {
    if (!lead) return;
    setEditFormData({
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

  if (!lead) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {isLoading ? 'Loading lead...' : 'Lead not found'}
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Lead #${lead.leadNumber}`} subtitle={lead.clientName}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/leads')} className="h-10 w-10 flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Lead #{lead.leadNumber}</h1>
            <p className="text-sm text-muted-foreground">{lead.clientName}</p>
          </div>
        </div>
        <Button onClick={openEditDialog} className="w-full sm:w-auto">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Status</div>
            <div className="text-base md:text-lg font-semibold text-foreground">{lead.status}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Priority</div>
            <div className="text-base md:text-lg font-semibold text-foreground">{lead.priority || '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Source</div>
            <div className="text-base md:text-lg font-semibold text-foreground">{lead.source || '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Follow-ups</div>
            <div className="text-base md:text-lg font-semibold text-foreground">{followUps.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Client Information */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Client Name</label>
              <div className="font-medium text-foreground">{lead.clientName}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Company</label>
              <div className="font-medium text-foreground">{lead.companyName || '-'}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Phone</label>
              <div className="font-medium text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {lead.phone}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">WhatsApp</label>
              <div className="font-medium text-foreground">{lead.whatsapp || '-'}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Email</label>
              <div className="font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {lead.email || '-'}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">City</label>
              <div className="font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {lead.city || '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Information */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Lead Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Source</label>
              <div className="font-medium text-foreground">{lead.source || '-'}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Requirement Type</label>
              <div className="font-medium text-foreground">{lead.requirementType || '-'}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Estimated Value</label>
              <div className="font-medium text-foreground">{lead.estimatedValue ? `₹${lead.estimatedValue.toLocaleString()}` : '-'}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Priority</label>
              <div className="font-medium text-foreground">{lead.priority || '-'}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Status</label>
              <div className="font-medium text-foreground">{lead.status}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Created</label>
              <div className="font-medium text-foreground">{formatDate(lead.createdAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirement */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Requirement</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{lead.requirement}</p>
        </CardContent>
      </Card>

      {/* Initial Notes */}
      {lead.initialNotes && (
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Initial Notes</h2>
            <p className="text-sm text-foreground whitespace-pre-wrap">{lead.initialNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Information */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Follow-up Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Last Contact</label>
              <div className="font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {formatDate(lead.lastContactAt)}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Next Follow-up</label>
              <div className="font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(lead.nextFollowUpAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Timeline */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Follow-up Timeline</h2>
            <Button size="sm" onClick={() => setIsAddFollowUpOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Follow-up
            </Button>
          </div>
          {followUps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No follow-ups recorded yet</p>
          ) : (
            <div className="space-y-4">
              {followUps.map((followUp) => (
                <div key={followUp.id} className="border-l-2 border-primary pl-4 pb-4 relative">
                  <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">{followUp.type}</Badge>
                    <Badge variant={followUp.status === 'PENDING' ? 'default' : followUp.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                      {followUp.status}
                    </Badge>
                    {followUp.scheduledAt && (
                      <span className="text-xs text-muted-foreground">
                        Scheduled: {formatDateTime(followUp.scheduledAt)}
                      </span>
                    )}
                    {followUp.occurredAt && (
                      <span className="text-xs text-muted-foreground">
                        Occurred: {formatDateTime(followUp.occurredAt)}
                      </span>
                    )}
                    {followUp.result && (
                      <Badge variant="secondary">{followUp.result}</Badge>
                    )}
                  </div>
                  {followUp.notes && (
                    <p className="text-sm text-foreground">{followUp.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditLead} className="space-y-4 pb-20 md:pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Client Name *</label>
                <Input
                  required
                  value={editFormData.clientName}
                  onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input
                  value={editFormData.companyName}
                  onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone *</label>
                <Input
                  required
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">WhatsApp</label>
                <Input
                  value={editFormData.whatsapp}
                  onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Input
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Source</label>
                <Select value={editFormData.source || ''} onValueChange={(v) => setEditFormData({ ...editFormData, source: v === '' ? undefined : v as LeadSource })}>
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
                <Select value={editFormData.priority || ''} onValueChange={(v) => setEditFormData({ ...editFormData, priority: v === '' ? undefined : v as LeadPriority })}>
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
                <Select value={editFormData.status} onValueChange={(v) => setEditFormData({ ...editFormData, status: v as LeadStatus })}>
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
                value={editFormData.requirementType}
                onChange={(e) => setEditFormData({ ...editFormData, requirementType: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Requirement *</label>
              <textarea
                required
                className="w-full min-h-[120px] border border-border rounded-md p-3 text-sm"
                value={editFormData.requirement}
                onChange={(e) => setEditFormData({ ...editFormData, requirement: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estimated Value</label>
              <Input
                type="number"
                value={editFormData.estimatedValue}
                onChange={(e) => setEditFormData({ ...editFormData, estimatedValue: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Initial Notes</label>
              <textarea
                className="w-full min-h-[100px] border border-border rounded-md p-3 text-sm"
                value={editFormData.initialNotes}
                onChange={(e) => setEditFormData({ ...editFormData, initialNotes: e.target.value })}
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

      {/* Add Follow-up Dialog */}
      <Dialog open={isAddFollowUpOpen} onOpenChange={setIsAddFollowUpOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Follow-up</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFollowUp} className="space-y-4 pb-20 md:pb-0">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={followUpForm.type} onValueChange={(v) => setFollowUpForm({ ...followUpForm, type: v as FollowUpType })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWUP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Scheduled Date & Time</label>
              <Input
                type="datetime-local"
                value={followUpForm.scheduledAt}
                onChange={(e) => setFollowUpForm({ ...followUpForm, scheduledAt: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <textarea
                required
                className="w-full min-h-[120px] border border-border rounded-md p-3 text-sm"
                value={followUpForm.notes}
                onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Result (optional)</label>
              <Select value={followUpForm.result || ''} onValueChange={(v) => setFollowUpForm({ ...followUpForm, result: v as FollowUpResult })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {FOLLOWUP_RESULTS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="fixed bottom-0 left-0 right-0 bg-background p-4 border-t border-border md:static md:border-0 md:p-0">
              <div className="flex gap-3 w-full md:w-auto">
                <Button type="button" variant="outline" onClick={() => setIsAddFollowUpOpen(false)} className="flex-1 md:flex-none h-12">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 md:flex-none h-12">
                  Add Follow-up
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
