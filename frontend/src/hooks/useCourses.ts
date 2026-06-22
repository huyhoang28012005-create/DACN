import { useState, useEffect, useCallback } from 'react';
import { courseService, userService } from '../services';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ICourse, IUser } from '../types/models';
import { UserRole } from '../constants/roles';

export function useCourses() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [instructors, setInstructors] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isAdminOrTechnician = currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN';
  const isInstructor = currentUser?.role === UserRole.LECTURER;
  const canManage = isAdminOrTechnician || isInstructor;

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      let coursesData = [];
      let usersData = [];

      if (canManage) {
        const [coursesRes, usersRes] = await Promise.all([
          courseService.getAll(),
          isAdminOrTechnician ? userService.getAll() : Promise.resolve({ data: [currentUser] }),
        ]);
        coursesData = coursesRes.data || [];
        usersData = usersRes.data || [currentUser];
      } else {
        const coursesRes = await courseService.getAll();
        coursesData = coursesRes.data || [];
      }

      setCourses(coursesData);

      if (canManage) {
        const instrs = usersData.filter(
          (u: IUser) => u.role === UserRole.LECTURER || u.role === UserRole.ADMIN
        );
        setInstructors(instrs);
      }
    } catch (error: unknown) {
      const err = error as any;
      const msg = err.response?.data?.message || t('load_courses_error');
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  }, [canManage, isAdminOrTechnician, isInstructor, currentUser?.id, t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, instructors, isLoading, refetch: fetchCourses, canManage, isAdminOrTechnician };
}
