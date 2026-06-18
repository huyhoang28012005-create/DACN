import { useState, useEffect, useCallback } from "react";
import { userService } from "../services";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function useUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || t("users_load_error");
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
