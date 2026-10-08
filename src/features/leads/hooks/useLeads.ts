/**
 * useLeads Hook
 * React Query hooks for leads - clean Lead CRM version
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, LeadsFilters, PaginationParams } from '@/features/leads/services/leadsApi';
import { Lead } from '@/types/leads';

/**
 * Fetch all leads with pagination and filters
 */
export function useLeads(params?: PaginationParams & LeadsFilters) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => {
      const safeParams = params
        ? { ...params, page: Math.max(1, Number(params.page) || 1) }
        : params;
      return leadsApi.getAll(safeParams);
    },
    enabled: params !== undefined,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Fetch single lead by ID
 */
export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Create new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Lead>) => leadsApi.create(data),
    onSuccess: (response) => {
      // Invalidate leads queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

/**
 * Update existing lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => 
      leadsApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate leads queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
}

/**
 * Delete lead (soft delete)
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const result = await leadsApi.delete(id);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
}
