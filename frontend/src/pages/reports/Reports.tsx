import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileText, Settings, AlertTriangle, CheckCircle, Plus, Search, RefreshCw, X, FileX, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { reportService, equipmentService, roomService } from "../../services";
import { format } from "date-fns";
import { timeAgo } from "../../utils/timeAgo";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { toast } from "react-hot-toast";

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  switch (status) {
    case 'OPEN': return <span className="px-2 py-1 bg-[#FDEDED] dark:bg-red-900/30 text-[#C62828] rounded text-[12px] font-medium border border-[#FFCDD2]">{t('status_open')}</span>;
    case 'IN_PROGRESS': return <span className="px-2 py-1 bg-[#FFF8E1] text-[#F59E0B] rounded text-[12px] font-medium border border-[#FFECB3]">{t('status_in_progress')}</span>;
    case 'RESOLVED': return <span className="px-2 py-1 bg-[#E8F5E9] dark:bg-green-900/30 text-[#2E7D32] rounded text-[12px] font-medium border border-[#C8E6C9]">{t('status_resolved')}</span>;
    default: return <span className="px-2 py-1 bg-[#F5F5F5] dark:bg-slate-800/50 text-[#757575] dark:text-slate-400 rounded text-[12px] font-medium">{status}</span>;
  }
}

export function Reports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("incidents"); // 'Thống kê' hoặc 'Sự cố'
  const [chartMonth, setChartMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  // States cho Sự cố
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", equipment_id: "", room_id: "" });
  const [equipments, setEquipments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [deleteConfirmReportId, setDeleteConfirmReportId] = useState<number | null>(null);

  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [repRes, eqRes, roomRes] = await Promise.all([
        isAdmin ? reportService.getAll() : reportService.getMyReports(),
        equipmentService.getAll(),
        roomService.getAll()
      ]);
      setReports(repRes.data || []);
      setEquipments(eqRes.data || []);
      setRooms(roomRes.data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || t("load_reports_error");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === "incidents") fetchData();
  }, [activeTab, fetchData]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportService.create({
        title: formData.title,
        description: formData.description,
        equipment_id: formData.equipment_id ? parseInt(formData.equipment_id) : undefined,
        room_id: formData.room_id ? parseInt(formData.room_id) : undefined,
      } as any);
      toast.success(t("report_submitted_success"));
      setIsModalOpen(false);
      setFormData({ title: "", description: "", equipment_id: "", room_id: "" });
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || t("submit_report_failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await reportService.update(id.toString(), { status });
      toast.success(t("status_updated_success"));
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || t("status_update_failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const executeDeleteReport = async () => {
    if (deleteConfirmReportId) {
      try {
        await reportService.delete(deleteConfirmReportId.toString());
        toast.success(t("delete_report_success"));
        setDeleteConfirmReportId(null);
        fetchData();
      } catch (error: any) {
        const msg = error.response?.data?.message || t("delete_report_failed");
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    }
  };

  const handleExportCSV = () => {
    if (reports.length === 0) {
      toast.error(t("no_data_export"));
      return;
    }
    const headers = ["ID", t("incident_name"), t("description"), "Trạng thái", t("created_date")];
    const csvRows = reports.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.status,
      format(new Date(r.created_at), "dd/MM/yyyy")
    ].join(","));
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao-cao-su-co-${format(new Date(), "dd-MM-yyyy")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("export_report_success"));
  };

  const getChartData = () => {
    const [year, month] = chartMonth.split('-');
    if (!year || !month) return [];
    
    // Lọc báo cáo trong tháng được chọn
    const filteredReports = reports.filter(r => {
      const date = new Date(r.created_at);
      return date.getFullYear() === parseInt(year) && date.getMonth() + 1 === parseInt(month);
    });

    // Gom nhóm theo ngày
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const count = filteredReports.filter(r => new Date(r.created_at).getDate() === i).length;
      data.push({ name: `${i}/${month}`, value: count });
    }
    return data;
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300 pb-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-bold text-[#212121] dark:text-slate-100 mb-4">{isAdmin ? t("reports_and_statistics") : t("incident_reports")}</h1>
          {isAdmin && (
            <div className="flex border-b border-[#E0E0E0] dark:border-slate-800">
              {['statistics', 'incidents'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-[14px] font-medium border-b-2 transition-colors ${
                    activeTab === tab ? 'border-[#1E5FA5] text-[#1E5FA5] dark:text-blue-400' : 'border-transparent text-[#757575] dark:text-slate-400 hover:text-[#212121] dark:text-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
        {activeTab === "statistics" && (
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-[#E0E0E0] dark:border-slate-800 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 text-[#212121] dark:text-slate-100 px-4 py-2.5 rounded-md font-medium transition-colors text-[14px] shadow-sm dark:shadow-slate-900/50 mb-2">
            <Download className="w-4 h-4" /> {t("export_report_btn")}
          </button>
        )}
        {activeTab === "incidents" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1E5FA5] dark:bg-blue-600 hover:bg-[#154a85] dark:hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium transition-colors text-[14px] shadow-sm dark:shadow-slate-900/50 mb-2"
          >
            <Plus className="w-4 h-4" /> {t("report_incident_btn")}
          </button>
        )}
      </div>

      {activeTab === "statistics" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title={t("total_incidents")} value={reports.length} sub={t("all_time")} icon={<FileText className="w-5 h-5 text-[#1E5FA5] dark:text-blue-400" />} bg="bg-[#D6E4F7] dark:bg-blue-900/30/50" />
            <KPICard title={t("status_open")} value={reports.filter(r => r.status === 'OPEN').length} sub={t("needs_review")} icon={<AlertTriangle className="w-5 h-5 text-[#EF4444]" />} bg="bg-[#FDEDED] dark:bg-red-900/30" />
            <KPICard title={t("status_in_progress")} value={reports.filter(r => r.status === 'IN_PROGRESS').length} sub={t("technician_working")} icon={<Settings className="w-5 h-5 text-[#F59E0B]" />} bg="bg-[#FFF8E1]" />
            <KPICard title={t("status_resolved")} value={reports.filter(r => r.status === 'RESOLVED').length} sub={t("functioning_normally")} icon={<CheckCircle className="w-5 h-5 text-[#2E7D32]" />} bg="bg-[#E8F5E9] dark:bg-green-900/30" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[16px] font-bold text-[#212121] dark:text-slate-100">{t("incident_chart")}</h2>
                <input 
                  type="month" 
                  value={chartMonth}
                  onChange={(e) => setChartMonth(e.target.value)}
                  className="px-3 py-1.5 border border-[#E0E0E0] dark:border-slate-800 rounded text-[13px] text-[#757575] dark:text-slate-400 focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500 outline-none"
                />
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#757575', fontSize: 10}} dy={10} interval="preserveStartEnd" minTickGap={20} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#757575', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F5F5F5'}} contentStyle={{ borderRadius: '8px', border: '1px solid #E0E0E0' }} />
                    <Bar dataKey="value" fill="#1E5FA5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 p-6">
              <h2 className="text-[16px] font-bold text-[#212121] dark:text-slate-100 mb-6">{t("status_ratio")}</h2>
              <div className="h-[280px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[
                        { name: t('status_resolved'), value: reports.filter(r => r.status === 'RESOLVED').length || 1, color: '#2E7D32' },
                        { name: t('status_in_progress'), value: reports.filter(r => r.status === 'IN_PROGRESS').length || 1, color: '#F59E0B' },
                        { name: t('status_open'), value: reports.filter(r => r.status === 'OPEN').length || 1, color: '#EF4444' }
                      ]} 
                      innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value"
                    >
                      {[
                        { color: '#2E7D32' }, { color: '#F59E0B' }, { color: '#EF4444' }
                      ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[140px] flex flex-col gap-4">
                  {[
                    { name: t('status_resolved'), value: reports.filter(r => r.status === 'RESOLVED').length, color: '#2E7D32' },
                    { name: t('status_in_progress'), value: reports.filter(r => r.status === 'IN_PROGRESS').length, color: '#F59E0B' },
                    { name: t('status_open'), value: reports.filter(r => r.status === 'OPEN').length, color: '#EF4444' }
                  ].map(item => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                      <div>
                        <div className="text-[12px] text-[#757575] dark:text-slate-400">{item.name}</div>
                        <div className="text-[14px] font-bold text-[#212121] dark:text-slate-100">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "incidents" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-[#E0E0E0] dark:border-slate-800 bg-[#F5F5F5] dark:bg-slate-800/50 flex justify-between items-center">
            <div className="relative w-[300px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] dark:text-slate-400" />
              <input type="text" placeholder={t("search_reports")} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-[#E0E0E0] dark:border-slate-800 rounded text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500" />
            </div>
            <button onClick={fetchData} className="p-2 text-[#757575] dark:text-slate-400 hover:text-[#1E5FA5] dark:text-blue-400 hover:bg-white dark:bg-slate-900 rounded border border-transparent hover:border-[#E0E0E0] dark:border-slate-800 transition-colors bg-white dark:bg-slate-900">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#E0E0E0] dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("report_date")}</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("reporter")}</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("title")}</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("equipment_room")}</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("status")}</th>
                  {isAdmin && <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-center">{t("action")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <LoadingSpinner text={t("loading_reports")} />
                    </td>
                  </tr>
                ) : reports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 bg-white dark:bg-slate-900 transition-colors">
                    <td className="px-6 py-4 text-[14px] text-[#212121] dark:text-slate-100" title={format(new Date(r.created_at), "dd/MM/yyyy HH:mm")}>{timeAgo(r.created_at)}</td>
                    <td className="px-6 py-4 text-[14px] text-[#212121] dark:text-slate-100">{r.user?.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-bold text-[#212121] dark:text-slate-100">{r.title}</div>
                      <div className="text-[12px] text-[#757575] dark:text-slate-400 mt-1 line-clamp-1">{r.description}</div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#212121] dark:text-slate-100">
                      {r.equipment ? `${t("eq_prefix")}${r.equipment.name}` : r.room ? `${t("room_prefix")}${r.room.name}` : '-'}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {r.status === 'OPEN' && (
                            <button onClick={() => handleUpdateStatus(r.id, "IN_PROGRESS")} className="text-[12px] px-3 py-1 bg-[#FFF8E1] text-[#F59E0B] border border-[#FFECB3] hover:bg-[#FFECB3] rounded transition-colors">
                              Bắt đầu sửa
                            </button>
                          )}
                          {r.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleUpdateStatus(r.id, "RESOLVED")} className="text-[12px] px-3 py-1 bg-[#E8F5E9] dark:bg-green-900/30 text-[#2E7D32] border border-[#C8E6C9] hover:bg-[#C8E6C9] rounded transition-colors">
                              Hoàn tất
                            </button>
                          )}
                          <button onClick={() => setDeleteConfirmReportId(r.id)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#C62828] hover:bg-[#FDEDED] dark:bg-red-900/30 rounded transition-colors" title={t("delete_report")}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!isLoading && reports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#757575] dark:text-slate-400">
                      <FileX className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                      <p>{t("no_reports")}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl dark:shadow-slate-900/50 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#E0E0E0] dark:border-slate-800 flex justify-between items-center bg-[#FAFAFA] dark:bg-slate-800/30">
              <h3 className="font-bold text-[#212121] dark:text-slate-100 text-[16px]">{t("report_incident_modal_title")}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:bg-[#E0E0E0] dark:hover:bg-slate-700 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateReport} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("incident_title")} <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500" placeholder={t("example_title")} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("broken_equipment_optional")}</label>
                <select value={formData.equipment_id} onChange={e => setFormData({...formData, equipment_id: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500">
                  <option value="">{t("no_equipment_specified")}</option>
                  {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.serial_number})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("broken_room_optional")}</label>
                <select value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500">
                  <option value="">{t("no_room_specified")}</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("detailed_description")} <span className="text-red-500">*</span></label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500" placeholder={t("describe_issue")}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E0E0E0] dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 rounded-md transition-colors">{t("cancel")}</button>
                <button type="submit" className="px-4 py-2 text-[14px] font-bold text-white bg-[#1E5FA5] dark:bg-blue-600 hover:bg-[#154a85] dark:hover:bg-blue-700 rounded-md transition-colors">{t("submit_report")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmReportId !== null}
        title={t("delete_report_modal_title")}
        message={t("delete_report_confirm_msg")}
        confirmText={t("delete_report")}
        isDestructive={true}
        onConfirm={executeDeleteReport}
        onCancel={() => setDeleteConfirmReportId(null)}
      />
    </div>
  );
}

function KPICard({title, value, sub, icon, bg}: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <div className="text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{title}</div>
        <div className="text-[24px] font-bold text-[#212121] dark:text-slate-100 leading-none mb-2">{value}</div>
        <div className="text-[12px] text-[#757575] dark:text-slate-400">{sub}</div>
      </div>
    </div>
  );
}
