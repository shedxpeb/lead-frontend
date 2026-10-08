/**
 * Leads API Service
 * All API calls for leads module
 */
import { api, apiClient } from '@/core/api';
import { Lead } from '@/types/leads';

export interface LeadsFilters {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BackendResponse<T> {
  success: boolean;
  requestId: string;
  timestamp: string;
  message: string;
  data: T;
}

export interface LeadsData {
  rows: Lead[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  summary: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
    inProgress?: number;
  };
  filters: Record<string, any>;
}

export const leadsApi = {
  getAll: async (params?: PaginationParams & LeadsFilters) => {
    return api.get<BackendResponse<LeadsData>>('/leads', { params });
  },

  getById: (id: string) =>
    api.get<BackendResponse<Lead>>(`/leads/${id}`),

  create: (data: Partial<Lead>) =>
    api.post<BackendResponse<Lead>>('/leads', data),

  update: (id: string, data: Partial<Lead>) =>
    api.patch<BackendResponse<Lead>>(`/leads/${id}`, data),

  delete: (id: string) => {
    return api.delete<BackendResponse<void>>(`/leads/${id}`);
  },

  getFollowUps: (leadId: string) =>
    api.get<BackendResponse<any[]>>(`/leads/${leadId}/follow-ups`),

  getDashboardFollowUps: () =>
    api.get<BackendResponse<{
      overdue: any[];
      today: any[];
      upcoming: any[];
      completed: any[];
    }>>('/leads/dashboard/follow-ups'),

  createFollowUp: (leadId: string, data: any) =>
    api.post<BackendResponse<any>>(`/leads/${leadId}/follow-ups`, data),

  // Note: These endpoints may not exist in clean backend - remove if not needed
  getKanban: async (params?: Partial<LeadsFilters>) => {
    return api.get<BackendResponse<{ columns: Array<{ status: string; count: number; cards: Lead[] }> }>>('/leads/kanban', { params });
  },

  getCalendar: async (params?: Partial<LeadsFilters>) => {
    return api.get<BackendResponse<{ events: Lead[] }>>('/leads/calendar', { params });
  },

  bulkStatusUpdate: (ids: string[], status: string) =>
    api.patch<BackendResponse<{ count: number }>>('/leads/bulk/status', { ids, status }),

  bulkDelete: (ids: string[]) =>
    api.delete<BackendResponse<{ count: number }>>('/leads/bulk', { data: { ids } }),

  getLogs: (id: string) =>
    api.get<BackendResponse<Array<{ id: string; action: string; description: string; timestamp: Date; userId: string | null }>>>(`/leads/${id}/logs`),

  export: (params?: PaginationParams & LeadsFilters) =>
    api.get<BackendResponse<LeadsData>>('/leads/export', { params }),

  checkDuplicate: (mobile?: string, email?: string) =>
    api.get<BackendResponse<{ isDuplicate: boolean; matches?: Lead[] }>>('/leads/check-duplicate', {
      params: { mobile, email },
    }),

  getProjectData: (id: string) =>
    api.get<BackendResponse<{
      id: string;
      leadNumber: number;
      customerName: string;
      companyName: string;
      customerId: string | null;
      status: string;
      isConverted: boolean;
      projectTitle: string;
      projectType: string;
      structureType: string;
      width: number | null;
      length: number | null;
      height: number | null;
      baySpacing: number | null;
      roofType: string | null;
      craneRequired: boolean | null;
      craneCapacity: number | null;
      mezzanine: boolean | null;
      mezzanineArea: number | null;
      wallType: string | null;
      insulationRequired: boolean | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      state: string | null;
      pincode: string | null;
      siteAddress: string | null;
      siteLocation: string | null;
      specialRequirement: string | null;
      customerNotes: string | null;
    }>>(`/leads/${id}/project-data`),

  updateWorkflow: (id: string, stage: string, notes?: string) =>
    api.post<BackendResponse<Lead>>(`/leads/${id}/workflow`, { stage, notes }),

  importLeads: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<BackendResponse<ImportResult>>('/leads/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }).then(res => res.data);
  },
};

export interface ImportRowError {
  rowNumber: number;
  status: 'imported' | 'skipped' | 'duplicate' | 'invalid';
  errors: string[];
  data?: Record<string, any>;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  duplicates: number;
  invalid: number;
  rows: ImportRowError[];
}
