import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';
import toast from 'react-hot-toast';

/**
 * useSettings(section)
 * ---------------------
 * section: 'store' | 'localisation' | 'email' | 'payment' |
 *          'shipping' | 'notifications' | 'security' | 'media' | 'api-keys'
 *
 * Returns { data, isLoading, update, isUpdating }
 *
 * Example:
 *   const { data, update, isUpdating } = useSettings('store');
 */

const FETCH_MAP = {
  store:         settingsService.getStore,
  localisation:  settingsService.getLocalisation,
  email:         settingsService.getEmail,
  payment:       settingsService.getPayment,
  shipping:      settingsService.getShipping,
  notifications: settingsService.getNotifications,
  security:      settingsService.getSecurity,
  media:         settingsService.getMedia,
  'api-keys':    settingsService.getApiKeys,
};

const UPDATE_MAP = {
  store:         settingsService.updateStore,
  localisation:  settingsService.updateLocalisation,
  email:         settingsService.updateEmail,
  payment:       settingsService.updatePayment,
  shipping:      settingsService.updateShipping,
  notifications: settingsService.updateNotifications,
  security:      settingsService.updateSecurity,
  media:         settingsService.updateMedia,
};

export function useSettings(section) {
  const qc = useQueryClient();
  const key = ['settings', section];

  const query = useQuery({
    queryKey: key,
    queryFn: FETCH_MAP[section],
    staleTime: 1000 * 60 * 5, // 5 min — settings rarely change
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: UPDATE_MAP[section],
    onSuccess: (updated) => {
      qc.setQueryData(key, updated);
      toast.success('Settings saved successfully');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    },
  });

  return {
    data:       query.data,
    isLoading:  query.isLoading,
    isError:    query.isError,
    update:     mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

// ── Specialised hooks for one-off operations ────────────────────────────────

export function useTestEmail() {
  return useMutation({
    mutationFn: settingsService.testEmail,
    onSuccess: () => toast.success('Test email sent! Check your inbox.'),
    onError:   () => toast.error('Failed to send test email'),
  });
}

export function useApiKeys() {
  const qc = useQueryClient();
  const key = ['settings', 'api-keys'];

  const query = useQuery({
    queryKey: key,
    queryFn:  settingsService.getApiKeys,
    staleTime: 0,
  });

  const create = useMutation({
    mutationFn: settingsService.createApiKey,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('API key created');
    },
    onError: () => toast.error('Failed to create API key'),
  });

  const revoke = useMutation({
    mutationFn: settingsService.revokeApiKey,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('API key revoked');
    },
    onError: () => toast.error('Failed to revoke API key'),
  });

  return {
    keys:       query.data ?? [],
    isLoading:  query.isLoading,
    createKey:  create.mutate,
    revokeKey:  revoke.mutate,
    isCreating: create.isPending,
    isRevoking: revoke.isPending,
  };
}
