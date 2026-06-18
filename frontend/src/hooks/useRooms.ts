import { useState, useCallback } from "react";
import { roomService } from "../services";
import { useTranslation } from "react-i18next";

export function useRooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const res = await roomService.getAll();
      setRooms(res.data || []);
    } catch (error) {
      /* apiClient.ts will handle toast errors */
    } finally {
      setIsLoadingRooms(false);
    }
  }, [t]);

  return { rooms, isLoadingRooms, fetchRooms };
}
