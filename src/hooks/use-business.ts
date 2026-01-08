import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notifications';
import { TokenStorage } from '@/lib/token-storage';
import { businessService } from '@/services/business.service';
import { Business, UpdateBusinessRequest } from '@/types/business.types';

export const BUSINESS_QUERY_KEYS = {
  detail: (id: number | string) => ['business', 'detail', id] as const,
  list: (search?: string) => ['business', 'list', search ?? ''] as const,
  active: ['business', 'active'] as const,
} as const;

export function useActiveBusinessId(): number | null {
  return useMemo(() => {
    const storedId = TokenStorage.getUser()?.active_business_id;
    const parsedId = typeof storedId === 'number' ? storedId : Number(storedId);

    return Number.isFinite(parsedId) ? parsedId : null;
  }, []);
}

export function useBusiness(businessId?: number | null) {
  return useQuery<Business>({
    queryKey: BUSINESS_QUERY_KEYS.detail(businessId ?? 'unknown'),
    queryFn: () => businessService.getBusiness(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useActiveBusiness() {
  return useQuery<Business>({
    queryKey: BUSINESS_QUERY_KEYS.active,
    queryFn: async () => {
      const business = await businessService.getBusiness('active');
      // Update active business ID in local storage
      console.log('Active business fetched:', business);
      if (business?.id) {
        console.log('Updating active business ID in TokenStorage:', business.id);
        TokenStorage.updateUser({ active_business_id: business.id });
      }
      return business;
    },
  });
}

export function useBusinesses(search?: string) {
  return useQuery<Business[]>({
    queryKey: BUSINESS_QUERY_KEYS.list(search),
    queryFn: () => businessService.listBusinesses(search ? { search } : undefined),
    keepPreviousData: true,
  });
}

export function useUpdateBusiness(businessId?: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBusinessRequest) => {
      const targetId = businessId ?? TokenStorage.getUser()?.active_business_id;

      if (!targetId) {
        throw new Error('No active business found in storage');
      }

      return businessService.updateBusiness(targetId, payload);
    },
    onSuccess: (data, _variables) => {
      const targetId = businessId ?? data.id;

      if (targetId) {
        queryClient.setQueryData(BUSINESS_QUERY_KEYS.detail(targetId), data);
      }
      queryClient.setQueryData(BUSINESS_QUERY_KEYS.active, data);
      queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.list });
      notify.updateSuccess('Business settings');
    },
    onError: (error: any) => {
      const message = error?.message || 'Unable to update business settings';
      notify.error(message);
    },
  });
}

export function useSwitchBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessId: number) => {
      await businessService.switchBusiness({ business_id: businessId });
      TokenStorage.updateUser({ active_business_id: businessId });
      return businessId;
    },
    onSuccess: async (businessId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.list }),
        queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.detail(businessId) }),
      ]);
      notify.success('Business switched');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Unable to switch business';
      notify.error(message);
    },
  });
}
