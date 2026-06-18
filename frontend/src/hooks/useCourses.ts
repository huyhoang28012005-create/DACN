import { useState, useEffect, useCallback } from "react";
import { courseService, userService } from "../services";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function useCourses() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isAdminOrTechnician = currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN';
  const isInstructor = currentUser?.role === 'INSTRUCTOR';
  const canManage = isAdminOrTechnician || isInstructor;

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      let coursesData = [];
      let usersData = [];

      if (canManage) {
        const [coursesRes, usersRes] = await Promise.all([
          courseService.getAll(),
          isAdminOrTechnician ? userService.getAll() : Promise.resolve({ data: [currentUser] })
        ]);
        coursesData = coursesRes.data || [];
        usersData = usersRes.data || [currentUser];
      } else {
        const coursesRes = await courseService.getAll();
        coursesData = coursesRes.data || [];
      }
      
      if (isInstructor) {
        coursesData = coursesData.filter((c: any) => c.instructor_id === currentUser.id);
      }
      setCourses(coursesData);
      
      if (canManage) {
        const instrs = usersData.filter((u: any) => u.role === 'INSTRUCTOR' || u.role === 'ADMIN');
        setInstructors(instrs);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || t("load_courses_error");
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
