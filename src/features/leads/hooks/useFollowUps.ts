import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../services/leadsApi';

export const useLeadFollowUps = (leadId: string) => {
  return useQuery({
    queryKey: ['followups', 'lead', leadId],
    queryFn: () => leadsApi.getFollowUps(leadId),
    enabled: !!leadId,
  });
};

export const useDashboardFollowUps = () => {
  return useQuery({
    queryKey: ['dashboard', 'followups'],
    queryFn: () => leadsApi.getDashboardFollowUps(),
  });
};

export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: any }) =>
      leadsApi.createFollowUp(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['followups', 'lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'followups'] });
    },
  });
};
