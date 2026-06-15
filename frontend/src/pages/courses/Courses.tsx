import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Edit2, Plus, Trash2, BookOpen, X } from "lucide-react";
import { courseService, userService } from "../../services";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export function Courses() {
  const { t } = useTranslation();

  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({ id: 0, code: "", name: "", instructor_id: "" });
  const [isEditing, setIsEditing] = useState(false);

  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isAdminOrTechnician = currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let coursesData = [];
      let usersData = [];

      if (isAdminOrTechnician) {
        const [coursesRes, usersRes] = await Promise.all([
          courseService.getAll(),
          userService.getAll()
        ]);
        coursesData = coursesRes.data || [];
        usersData = usersRes.data || [];
      } else {
        const coursesRes = await courseService.getAll();
        coursesData = coursesRes.data || [];
      }
      
      setCourses(coursesData);
      
      if (isAdminOrTechnician) {
        const instrs = usersData.filter((u: any) => u.role === 'INSTRUCTOR' || u.role === 'ADMIN');
        setInstructors(instrs);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || t("load_courses_error");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (course?: any) => {
    if (course) {
      setFormData({
        id: course.id,
        code: course.code,
        name: course.name,
        instructor_id: course.instructor_id.toString()
      });
      setIsEditing(true);
    } else {
      setFormData({ id: 0, code: "", name: "", instructor_id: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        instructor_id: parseInt(formData.instructor_id)
      };

      if (isEditing) {
        await courseService.update(formData.id.toString(), payload);
        toast.success(t("update_course_success"));
      } else {
        await courseService.create(payload);
        toast.success(t("add_course_success"));
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || (isEditing ? t("update_failed") : t("add_failed"));
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      try {
        await courseService.delete(deleteConfirmId.toString());
        toast.success(t("delete_course_success"));
        setDeleteConfirmId(null);
        fetchData();
      } catch (error: any) {
        const msg = error.response?.data?.message || t("delete_course_error");
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-bold text-[#212121] dark:text-slate-100 mb-2">{t("manage_courses")}</h1>
          <p className="text-[#757575] dark:text-slate-400 text-[14px]">{t("manage_courses_desc")}</p>
        </div>
        {isAdminOrTechnician && (
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-[#1E5FA5] dark:bg-blue-600 hover:bg-[#154a85] dark:hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium transition-colors text-[14px] shadow-sm dark:shadow-slate-900/50">
            <Plus className="w-4 h-4" /> {t("add_new_course")}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-[#E0E0E0] dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-800/30 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] dark:text-slate-400" />
            <input 
              type="text" 
              placeholder={t("search_course_placeholder")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-[#E0E0E0] dark:border-slate-800 rounded text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E0E0] dark:border-slate-800 bg-[#F5F5F5] dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[15%]">{t("course_code")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[35%]">{t("course_name")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[25%]">{t("course_instructor")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[15%]">{t("created_date")}</th>
                {isAdminOrTechnician && <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-right">{t("action")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="py-12"><LoadingSpinner text={t("loading_data")} /></td></tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#757575] dark:text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                    <p>{t("no_courses_found")}</p>
                  </td>
                </tr>
              ) : filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-[14px] font-bold text-[#1E5FA5] dark:text-blue-400">{c.code}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#212121] dark:text-slate-100">{c.name}</td>
                  <td className="px-6 py-4 text-[14px] text-[#212121] dark:text-slate-100">{c.instructor?.name || t("unassigned")}</td>
                  <td className="px-6 py-4 text-[14px] text-[#757575] dark:text-slate-400">{format(new Date(c.created_at), "dd/MM/yyyy")}</td>
                  {isAdminOrTechnician && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenModal(c)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#1E5FA5] dark:text-blue-400 hover:bg-[#D6E4F7] dark:bg-blue-900/30 rounded transition-colors" title={t("edit")}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(c.id)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#C62828] hover:bg-[#FDEDED] dark:bg-red-900/30 rounded transition-colors" title={t("delete")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl dark:shadow-slate-900/50 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#E0E0E0] dark:border-slate-800 flex justify-between items-center bg-[#FAFAFA] dark:bg-slate-800/30">
              <h3 className="font-bold text-[#212121] dark:text-slate-100 text-[16px]">{isEditing ? t("edit_course") : '{t("add_new_course")}'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:bg-[#E0E0E0] dark:hover:bg-slate-700 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">Mã học phần <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500" placeholder={t("ex_course_code")} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">Tên môn học <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500" placeholder={t("ex_course_name")} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">Giảng viên phụ trách <span className="text-red-500">*</span></label>
                <select required value={formData.instructor_id} onChange={e => setFormData({...formData, instructor_id: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500">
                  <option value="">{t("select_instructor")}</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E0E0E0] dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 rounded-md transition-colors">{t("cancel")}</button>
                <button type="submit" className="px-4 py-2 text-[14px] font-bold text-white bg-[#1E5FA5] dark:bg-blue-600 hover:bg-[#154a85] dark:hover:bg-blue-700 rounded-md transition-colors">{isEditing ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={t("delete_course")}
        message={t("delete_course_confirm")}
        confirmText={t("delete_course")}
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
