'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Lead, LeadStatus, LeadPriority } from '@/types/leads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Edit, MoreVertical, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileLeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

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
  return <Badge variant={variants[value] || 'default'} className="text-xs font-semibold rounded-full px-3 py-1">{value}</Badge>;
};

const priorityBadge = (value: LeadPriority | undefined) => {
  if (!value) return <span className="text-xs text-muted-foreground">-</span>;
  const variants: Record<LeadPriority, 'default' | 'secondary' | 'destructive'> = {
    Low: 'secondary',
    Medium: 'default',
    High: 'default',
    Urgent: 'destructive',
  };
  return <Badge variant={variants[value]} className="text-xs font-semibold rounded-full px-3 py-1">{value}</Badge>;
};

function formatDate(value?: Date | string | null) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  const now = new Date();
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  if (isTomorrow) {
    return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const MobileLeadCard = memo(function MobileLeadCard({ lead, onEdit, onDelete }: MobileLeadCardProps) {
  const router = useRouter();

  return (
    <div className="bg-card border border-border rounded-2xl p-3 space-y-2.5 hover:border-primary/30 transition-colors shadow-sm">
      {/* Header: ID + Name + Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-mono text-muted-foreground">#{lead.leadNumber}</span>
            {lead.companyName && (
              <span className="text-[11px] text-muted-foreground truncate">{lead.companyName}</span>
            )}
          </div>
          <h3 className="text-[15px] font-semibold text-foreground truncate leading-tight">{lead.clientName}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 rounded-full hover:bg-neutral-100"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(lead)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Phone + Email - Same Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[12px] text-foreground truncate">{lead.phone}</span>
        </div>
        {lead.email && (
          <div className="flex items-center gap-1.5 min-w-0">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-[12px] text-foreground truncate">{lead.email}</span>
          </div>
        )}
      </div>

      {/* Requirement */}
      {lead.requirement && (
        <p className="text-[12px] text-muted-foreground line-clamp-2">{lead.requirement}</p>
      )}

      {/* Source */}
      {lead.source && (
        <div className="text-[11px] text-muted-foreground">
          Source: {lead.source}
        </div>
      )}

      {/* Status + Priority */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {statusBadge(lead.status)}
        {priorityBadge(lead.priority)}
      </div>

      {/* Next Follow-up */}
      <div className="pt-2 mt-0.5 border-t border-border">
        <div className="text-[11px] font-medium text-muted-foreground mb-0.5">Next Follow-up</div>
        <div className="text-[12px] font-medium text-foreground">
          {(() => {
            const pendingFollowUps = (lead as any).followUps?.filter((f: any) => f.status === 'PENDING' && f.scheduledAt) || [];
            if (pendingFollowUps.length === 0) return 'Not scheduled';
            const nextFollowUp = pendingFollowUps[0];
            return formatDate(nextFollowUp.scheduledAt);
          })()}
        </div>
      </div>

      {/* Quick Actions - Single Row 4 Columns */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <Button
          variant="outline"
          className="h-9 rounded-full text-[11px] font-medium hover:bg-muted hover:border-input active:scale-[0.98] transition-all px-2"
          onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
          aria-label="View lead"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          <span className="whitespace-nowrap">View</span>
        </Button>
        <Button
          variant="outline"
          className="h-9 rounded-full text-[11px] font-medium hover:bg-muted hover:border-input active:scale-[0.98] transition-all px-2"
          onClick={() => onEdit(lead)}
          aria-label="Edit lead"
        >
          <Edit className="h-3.5 w-3.5 mr-1" />
          <span className="whitespace-nowrap">Edit</span>
        </Button>
        <Button
          variant="outline"
          className="h-9 rounded-full text-[11px] font-medium hover:bg-muted hover:border-input active:scale-[0.98] transition-all px-2"
          onClick={() => window.open(`tel:${lead.phone}`, '_self')}
          aria-label="Call lead"
        >
          <Phone className="h-3.5 w-3.5 mr-1" />
          <span className="whitespace-nowrap">Call</span>
        </Button>
        {lead.whatsapp ? (
          <Button
            variant="outline"
            className="h-9 rounded-full text-[11px] font-medium hover:bg-muted hover:border-input active:scale-[0.98] transition-all px-2"
            onClick={() => {
              const cleanNumber = (lead.whatsapp || '').replace(/\D/g, '');
              if (cleanNumber) {
                window.open(`https://wa.me/${cleanNumber}`, '_blank');
              }
            }}
            aria-label="Contact lead on WhatsApp"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            <span className="whitespace-nowrap">WhatsApp</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            className="h-9 rounded-full text-[11px] font-medium opacity-50 cursor-not-allowed px-2"
            aria-label="WhatsApp not available"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            <span className="whitespace-nowrap">WhatsApp</span>
          </Button>
        )}
      </div>
    </div>
  );
});
