export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'DesignPending'
  | 'EstimateSent'
  | 'ProposalSent'
  | 'Negotiation'
  | 'Approved'
  | 'Rejected'
  | 'Converted';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'ColdCall'
  | 'Email'
  | 'SocialMedia'
  | 'TradeShow'
  | 'Advertisement'
  | 'Other';

export type LeadPriority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Urgent';

export type FollowUpType =
  | 'CALL'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'MEETING'
  | 'SITE_VISIT'
  | 'OTHER';

export type FollowUpResult =
  | 'INTERESTED'
  | 'NEED_MORE_INFORMATION'
  | 'QUOTATION_REQUIRED'
  | 'QUOTATION_SENT'
  | 'WAITING'
  | 'NOT_INTERESTED'
  | 'CALL_BACK_LATER'
  | 'OTHER';

export interface Lead {
  id: string;
  leadNumber: number;

  // Client Details
  clientName: string;
  companyName?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city?: string;

  // Lead Details
  source?: LeadSource;
  requirementType?: string;
  requirement: string;
  estimatedValue?: number;
  priority?: LeadPriority;
  status: LeadStatus;
  initialNotes?: string;

  // Assignment & Tracking
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  nextFollowUpAt?: Date;
  lastContactAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;

  // Relations
  followUps?: FollowUp[];
}

export interface FollowUp {
  id: string;
  leadId: string;
  type: FollowUpType;
  occurredAt: Date;
  notes: string;
  result?: FollowUpResult;
  nextFollowUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDto {
  clientName: string;
  companyName?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  source?: LeadSource;
  requirementType?: string;
  requirement: string;
  estimatedValue?: number;
  priority?: LeadPriority;
  status?: LeadStatus;
  initialNotes?: string;
  nextFollowUpAt?: Date;
  assignedToId?: string;
}

export interface UpdateLeadDto {
  clientName?: string;
  companyName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  source?: LeadSource;
  requirementType?: string;
  requirement?: string;
  estimatedValue?: number;
  priority?: LeadPriority;
  status?: LeadStatus;
  initialNotes?: string;
  nextFollowUpAt?: Date;
  assignedToId?: string;
}

export interface CreateFollowUpDto {
  type: FollowUpType;
  occurredAt: Date;
  notes: string;
  result?: FollowUpResult;
  nextFollowUpAt?: Date;
}

export interface UpdateFollowUpDto {
  type?: FollowUpType;
  occurredAt?: Date;
  notes?: string;
  result?: FollowUpResult;
  nextFollowUpAt?: Date;
}

export interface LeadFilter {
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  city?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface LeadSearchParams {
  query?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: LeadFilter;
}
