import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { IUser } from '../types/models';

export function useUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (error: unknown) {
      const err = error as any;
      const msg = err.response?.data?.message || t('users_load_error');
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, refetch: fetchUsers };
}
