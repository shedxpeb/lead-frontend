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

  export: async (params?: PaginationParams & LeadsFilters) => {
    try {
      const response = await apiClient.get('/leads/export', {
        params,
        responseType: 'blob',
      });
      
      if (!response.data || response.data.size === 0) {
        throw new Error('Empty response from server');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) throw new Error('Unauthorized: Session expired');
        if (status === 403) throw new Error('Forbidden: No permission');
        if (status === 404) throw new Error('Not Found: Export endpoint');
        if (status === 500) throw new Error('Server Error: 500');
        throw new Error(error.response.data?.message || `Server error: ${status}`);
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  },

  downloadTemplate: async () => {
    try {
      const response = await apiClient.get('/leads/import/template', {
        responseType: 'blob',
      });
      
      if (!response.data || response.data.size === 0) {
        throw new Error('Empty response from server');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) throw new Error('Unauthorized: Session expired');
        if (status === 403) throw new Error('Forbidden: No permission');
        if (status === 404) throw new Error('Not Found: Template endpoint');
        if (status === 500) throw new Error('Server Error: 500');
        throw new Error(error.response.data?.message || `Server error: ${status}`);
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  },

  validateImport: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<BackendResponse<ImportValidationResult>>(
        '/leads/import/validate',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        },
      );
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 401) throw new Error('Unauthorized: Session expired');
        if (status === 403) throw new Error('Forbidden: No permission');
        if (status === 413) throw new Error('File too large: Maximum 5MB');
        if (status === 500) throw new Error('Server Error: 500');
        throw new Error(data?.message || data?.error || `Server error: ${status}`);
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  },

  importLeads: async (file: File, duplicateHandling: 'skip' | 'review' | 'update') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('duplicateHandling', duplicateHandling);
      const response = await apiClient.post<BackendResponse<ImportResult>>(
        '/leads/import',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        },
      );
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 401) throw new Error('Unauthorized: Session expired');
        if (status === 403) throw new Error('Forbidden: No permission');
        if (status === 500) throw new Error('Server Error: 500');
        throw new Error(data?.message || data?.error || `Server error: ${status}`);
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  },

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
};

export interface ImportRowError {
  rowNumber: number;
  status: 'imported' | 'skipped' | 'duplicate' | 'invalid';
  errors: string[];
  data?: Record<string, any>;
}

export interface ImportValidationResult {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  validRows: Record<string, any>[];
  errors: ImportRowError[];
  duplicatesList: Array<{
    rowNumber: number;
    existingLead: any;
    newData: Record<string, any>;
  }>;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  duplicates: number;
  failed: number;
  rows: ImportRowError[];
}
