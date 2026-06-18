import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Edit2, Plus, Users as UsersIcon, Trash2, ShieldCheck, UserCheck, GraduationCap, UserX } from "lucide-react";
import { userService } from "../../services";
import { useUsers } from "../../hooks/useUsers";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { toast } from "react-hot-toast";
import { StatMini } from "../../components/ui/StatMini";

export function Users() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const { users, isLoading, refetch } = useUsers();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [editingUser, setEditingUser] = useState({ id: 0, name: "", email: "", role: "STUDENT" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, BLACKLIST
  const [blacklistingUserId, setBlacklistingUserId] = useState<number | null>(null);
  const [blacklistReason, setBlacklistReason] = useState("");



  const handleToggleActiveClick = (userId: number, currentStatus: boolean) => {
    if (currentStatus) {
      // Khóa -> Mở Modal nhập lý do
      setBlacklistingUserId(userId);
      setBlacklistReason("");
    } else {
      // Mở khóa -> {t("remove_blacklist")}
      executeToggleActive(userId, true, "");
    }
  };

  const executeToggleActive = async (userId: number, newStatus: boolean, reason: string) => {
    try {
      await userService.update(userId.toString(), { is_active: newStatus, blacklist_reason: reason });
      toast.success(newStatus ? t("blacklist_removed_success") : t("blacklist_added_success"));
      setBlacklistingUserId(null);
      refetch();
    } catch (error: any) {
      const msg = error.response?.data?.message || t("status_update_failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    setIsEditingUser(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.update(editingUser.id.toString(), { 
        name: editingUser.name, 
        email: editingUser.email, 
        role: editingUser.role 
      });
      toast.success(t("update_info_success"));
      setIsEditingUser(false);
      refetch();
    } catch (error: any) {
      const msg = error.response?.data?.message || t("update_failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      try {
        await userService.delete(deleteConfirmId.toString());
        toast.success(t("user_deleted_success"));
        setDeleteConfirmId(null);
        refetch();
      } catch (error: any) {
        const msg = error.response?.data?.message || t("delete_failed");
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.create({ email: newUser.email, password: newUser.password, fullName: newUser.name, role: newUser.role });
      toast.success(t("add_user_success"));
      setIsAddingUser(false);
      setNewUser({ name: "", email: "", password: "", role: "STUDENT" });
      refetch();
    } catch (error: any) {
      const msg = error.response?.data?.message || t("add_user_failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return t("role_admin");
      case 'TECHNICIAN': return t("role_technician");
      case 'LECTURER': return t("role_instructor");
      case 'STUDENT': return t("role_student");
      default: return role;
    }
  };

  const filteredUsers = users.filter(u => 
    ((u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "ALL" || (filterStatus === "BLACKLIST" && u.is_active === false))
  );

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN' || u.role === 'TECHNICIAN').length,
    instructors: users.filter(u => u.role === 'LECTURER').length,
    students: users.filter(u => u.role === 'STUDENT').length,
    blacklisted: users.filter(u => u.is_active === false).length
  }), [users]);

  return (
    <div className="max-w-[1200px] w-full mx-auto animate-in fade-in duration-300 h-full flex flex-col space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-[24px] font-bold text-[#212121] dark:text-slate-100">{t("manage_users")}</h1>
          <button 
            onClick={() => setIsAddingUser(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 text-[14px]">
            <Plus className="w-4 h-4" /> {t("add_new_account")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatMini label={t("total_users", "Tổng tài khoản")} value={stats.total} icon={<UsersIcon className="w-5 h-5" />} color="text-blue-600" bgColor="bg-blue-600" />
          <StatMini label={t("role_admin", "Admin & Kỹ thuật")} value={stats.admins} icon={<ShieldCheck className="w-5 h-5" />} color="text-purple-600" bgColor="bg-purple-600" />
          <StatMini label={t("role_instructor", "Giảng viên")} value={stats.instructors} icon={<UserCheck className="w-5 h-5" />} color="text-emerald-600" bgColor="bg-emerald-600" />
          <StatMini label={t("role_student", "Sinh viên")} value={stats.students} icon={<GraduationCap className="w-5 h-5" />} color="text-orange-500" bgColor="bg-orange-500" />
          <StatMini label={t("blacklist_list", "Bị chặn")} value={stats.blacklisted} icon={<UserX className="w-5 h-5" />} color="text-red-600" bgColor="bg-red-600" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between items-center">
          <div className="relative w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] dark:text-slate-400" />
            <input 
              type="text" 
              placeholder={t("search_by_name_email")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] text-[#212121] dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="ALL">{t("all_accounts")}</option>
              <option value="BLACKLIST">{t("blacklist_list")}</option>
            </select>
            <select className="px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] text-[#212121] dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
              <option>{t("role_all")}</option>
              <option>{t("role_student")}</option>
              <option>{t("role_instructor")}</option>
              <option>{t("role_admin")}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm sticky top-0 z-10">
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("full_name")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("system_id")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("email")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("role")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-center">{t("status")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-right">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <LoadingSpinner text={t("loading_users")} />
                  </td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 bg-white dark:bg-slate-900 transition-colors">
                  <td className="px-6 py-4 text-[14px] font-bold text-[#212121] dark:text-slate-100">
                    {u.name}
                    {u.is_active === false && (
                      <p className="text-[12px] font-normal text-[#C62828] mt-1 bg-[#FDEDED] dark:bg-red-900/30 px-2 py-1 rounded inline-block">
                        Blacklist: {u.blacklist_reason || t("no_reason")}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#757575] dark:text-slate-400 font-mono">{u.id}</td>
                  <td className="px-6 py-4 text-[14px] text-[#212121] dark:text-slate-100">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[#F5F5F5] dark:bg-slate-800/50 rounded text-[12px] font-medium text-[#757575] dark:text-slate-400">{getRoleLabel(u.role)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.is_active === false ? (
                      <button 
                        onClick={() => handleToggleActiveClick(u.id, false)}
                        className="px-3 py-1 bg-[#F5F5F5] dark:bg-slate-800/50 border border-[#E0E0E0] dark:border-slate-800 hover:bg-white dark:bg-slate-900 text-[#212121] dark:text-slate-100 rounded text-[12px] font-medium transition-colors"
                      >
                        {t("remove_blacklist")}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleToggleActiveClick(u.id, true)}
                        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-[#1E5FA5] dark:bg-blue-600"
                        title={t("add_to_blacklist")}
                      >
                        <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-slate-900 transition-transform translate-x-4" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEditClick(u)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#1E5FA5] dark:text-blue-400 hover:bg-[#D6E4F7] dark:bg-blue-900/30 rounded transition-colors" title={t("edit")}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(u.id)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#C62828] hover:bg-[#FDEDED] dark:bg-red-900/30 rounded transition-colors" title={t("delete")}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#757575] dark:text-slate-400">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                    <p className="mb-4">{t("no_users")}</p>
                    <button onClick={() => setIsAddingUser(true)} className="px-4 py-2 bg-[#1E5FA5] dark:bg-blue-600 text-white rounded-md text-[14px]">{t("add_account_now")}</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-md p-6 border border-white/20 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
            <h2 className="text-[20px] font-bold text-[#212121] dark:text-slate-100 mb-4">{t("add_new_account")}</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">Họ và tên</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("email")}</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("password")}</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("role")}</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]">
                  <option value="STUDENT">{t("role_student")}</option>
                  <option value="INSTRUCTOR">{t("role_instructor")}</option>
                  <option value="TECHNICIAN">{t("role_technician")}</option>
                  <option value="ADMIN">{t("role_admin")}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E0E0]/50 dark:border-slate-800/50">
                <button type="button" onClick={() => setIsAddingUser(false)} className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded-lg transition-colors">{t("cancel")}</button>
                <button type="submit" className="px-4 py-2 text-[14px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">{t("save_account")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-md p-6 border border-white/20 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
            <h2 className="text-[20px] font-bold text-[#212121] dark:text-slate-100 mb-4">{t("edit_account_info")}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">Họ và tên</label>
                <input required type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("email")}</label>
                <input required type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("role")}</label>
                <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]">
                  <option value="STUDENT">{t("role_student")}</option>
                  <option value="INSTRUCTOR">{t("role_instructor")}</option>
                  <option value="TECHNICIAN">{t("role_technician")}</option>
                  <option value="ADMIN">{t("role_admin")}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E0E0]/50 dark:border-slate-800/50">
                <button type="button" onClick={() => setIsEditingUser(false)} className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded-lg transition-colors">{t("cancel")}</button>
                <button type="submit" className="px-4 py-2 text-[14px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">{t("update")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {blacklistingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-md p-6 border border-white/20 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
            <h2 className="text-[20px] font-bold text-[#C62828] mb-2">{t("put_in_blacklist")}</h2>
            <p className="text-[14px] text-[#757575] dark:text-slate-400 mb-4">{t("blacklist_warning")}</p>
            <form onSubmit={(e) => { e.preventDefault(); executeToggleActive(blacklistingUserId, false, blacklistReason); }} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("blacklist_reason_label")}</label>
                <textarea 
                  required 
                  rows={3}
                  value={blacklistReason} 
                  onChange={e => setBlacklistReason(e.target.value)} 
                  placeholder={t("blacklist_reason_example")}
                  className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-all" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E0E0]/50 dark:border-slate-800/50">
                <button type="button" onClick={() => setBlacklistingUserId(null)} className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded-lg transition-colors">{t("cancel")}</button>
                <button type="submit" className="px-4 py-2 text-[14px] font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5">{t("confirm_lock")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={t("delete_account")}
        message={t("delete_account_confirm")}
        confirmText={t("delete_account")}
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
