import { useState, useCallback } from 'react';
import { roomService } from '../services';
import { useTranslation } from 'react-i18next';
import { IRoom } from '../types/models';

export function useRooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const res = await roomService.getAll();
      setRooms(res.data || []);
    } catch (error) {
      // Error is handled by apiClient interceptor with toast
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [t]);

  return { rooms, isLoadingRooms, fetchRooms };
}
