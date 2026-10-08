import { LeadStatus, LeadPriority } from '@/types/leads';

export function getLeadStatusVariant(status: LeadStatus) {
  if (status === 'New') return 'info' as const;
  if (status === 'Contacted') return 'warning' as const;
  if (status === 'Converted' || status === 'Approved') return 'success' as const;
  if (status === 'Rejected') return 'destructive' as const;
  return 'secondary' as const;
}

export function getLeadPriorityVariant(priority: LeadPriority) {
  if (priority === 'Urgent') return 'destructive' as const;
  if (priority === 'High') return 'warning' as const;
  if (priority === 'Medium') return 'info' as const;
  return 'secondary' as const;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  New: 'bg-blue-500',
  Contacted: 'bg-yellow-500',
  DesignPending: 'bg-indigo-500',
  BOQPending: 'bg-indigo-500',
  EstimateSent: 'bg-purple-500',
  ProposalSent: 'bg-purple-500',
  Negotiation: 'bg-orange-500',
  Approved: 'bg-green-500',
  Converted: 'bg-green-500',
  Rejected: 'bg-red-500',
};

export function getLeadStatusColor(status: string): string {
  return STATUS_COLOR_MAP[status] || 'bg-gray-500';
}

const STATUS_HEX_MAP: Record<string, string> = {
  New: '#3b82f6',
  Contacted: '#eab308',
  DesignPending: '#6366f1',
  BOQPending: '#6366f1',
  EstimateSent: '#a855f7',
  ProposalSent: '#a855f7',
  Negotiation: '#f97316',
  Approved: '#22c55e',
  Converted: '#22c55e',
  Rejected: '#ef4444',
};

export function getLeadStatusHex(status: string): string {
  return STATUS_HEX_MAP[status] || '#6b7280';
}

export function isLeadConverted(lead: { status?: string | null; customerId?: string | null; isConverted?: boolean | null }): boolean {
  return lead.status === 'Converted' || lead.isConverted === true || !!lead.customerId;
}

export const LEAD_TERMINAL_STATUSES: string[] = ['Converted', 'Rejected'];
