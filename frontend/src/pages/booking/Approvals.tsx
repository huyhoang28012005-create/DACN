import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Check, X, CheckSquare, RefreshCw, CalendarX, Download, CheckCircle, XCircle, Clock, FileCheck } from "lucide-react";
import { bookingService } from "../../services";
import { format } from "date-fns";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { StatMini } from "../../components/ui/StatMini";

export function Approvals() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, type: 'APPROVE_ALL' | 'REJECT', id?: number}>({isOpen: false, type: 'APPROVE_ALL'});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getAll();
      setRequests(res.data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || t("load_approvals_error");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await bookingService.update(id.toString(), { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(t("status_update_success"));
    } catch (error: any) {
      const msg = error.response?.data?.message || t("status_update_error");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleApproveAll = () => {
    const pendingReqs = requests.filter(r => r.status === "PENDING");
    if (pendingReqs.length === 0) {
      toast.error(t("no_pending_requests"));
      return;
    }
    setConfirmState({ isOpen: true, type: 'APPROVE_ALL' });
  };

  const executeConfirmAction = async () => {
    if (confirmState.type === 'APPROVE_ALL') {
      const pendingReqs = requests.filter(r => r.status === "PENDING");
      try {
        await Promise.all(pendingReqs.map(r => bookingService.update(r.id.toString(), { status: "APPROVED" })));
        toast.success(`${t("approved_n_requests")} ${pendingReqs.length}`);
        fetchData();
      } catch (error: any) {
        const msg = error.response?.data?.message || t("approve_all_error");
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    } else if (confirmState.type === 'REJECT' && confirmState.id) {
      handleUpdateStatus(confirmState.id, "REJECTED");
    }
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  }), [requests]);

  const filteredRequests = requests.filter(r => {
    const matchStatus = r.status === statusFilter;
    const matchSearch = r.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.room?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleExportCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error(t("no_data_export"));
      return;
    }

    const headers = ["ID", "Tên Sinh Viên", "Email", "Phòng/Thiết bị", "Mục đích", "Ngày", "Giờ bắt đầu", "Giờ kết thúc", "Trạng thái"];
    
    const rows = filteredRequests.map(req => {
      return [
        req.id,
        `"${req.user?.name || ''}"`,
        `"${req.user?.email || ''}"`,
        `"${req.room?.name || ''}"`,
        `"${req.purpose || ''}"`,
        format(new Date(req.start_time), "dd/MM/yyyy"),
        format(new Date(req.start_time), "HH:mm"),
        format(new Date(req.end_time), "HH:mm"),
        req.status
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `baocao_datphong_${format(new Date(), "ddMMyyyy")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất báo cáo CSV");
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto animate-in fade-in duration-300 h-full flex flex-col space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-[24px] font-bold text-[#212121] dark:text-slate-100">{t("approve_requests")}</h1>
          <button 
            onClick={handleApproveAll}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-[14px] hover:-translate-y-0.5"
          >
            <CheckSquare className="w-4 h-4" /> {t("approve_all")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatMini label={t("total_requests", "Tổng đơn")} value={stats.total} icon={<FileCheck className="w-5 h-5" />} color="text-blue-600" bgColor="bg-blue-600" />
          <StatMini label={t("status_filter_pending", "Chờ duyệt")} value={stats.pending} icon={<Clock className="w-5 h-5" />} color="text-orange-500" bgColor="bg-orange-500" />
          <StatMini label={t("status_filter_approved", "Đã duyệt")} value={stats.approved} icon={<CheckCircle className="w-5 h-5" />} color="text-emerald-600" bgColor="bg-emerald-600" />
          <StatMini label={t("status_filter_rejected", "Từ chối")} value={stats.rejected} icon={<XCircle className="w-5 h-5" />} color="text-red-600" bgColor="bg-red-600" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between items-center flex-wrap gap-4">
          <div className="relative w-[320px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] dark:text-slate-400" />
            <input 
              type="text" 
              placeholder={t("search_request_placeholder")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={fetchData} className="p-2 text-[#757575] dark:text-slate-400 hover:text-[#1E5FA5] dark:text-blue-400 hover:bg-white dark:bg-slate-900 rounded border border-transparent hover:border-[#E0E0E0] dark:border-slate-800 transition-colors bg-white dark:bg-slate-900">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] text-[#212121] dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="PENDING">{t("status_filter_pending")}</option>
              <option value="APPROVED">{t("status_filter_approved")}</option>
              <option value="REJECTED">{t("status_filter_rejected")}</option>
            </select>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold text-[14px] transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 ml-2"
            >
              <Download className="w-4 h-4" /> {t("export_csv")}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm sticky top-0 z-10">
                <th className="px-4 py-4 w-12 text-center"><input type="checkbox" className="rounded text-[#1E5FA5] dark:text-blue-400 border-[#E0E0E0] dark:border-slate-800" /></th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("requester")}</th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("room_device")}</th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("purpose")}</th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("request_time")}</th>
                {statusFilter === "PENDING" && <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-center w-32">{t("action")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <LoadingSpinner text={t("loading_requests")} />
                  </td>
                </tr>
              ) : filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 bg-white dark:bg-slate-900 transition-colors">
                  <td className="px-4 py-4 text-center"><input type="checkbox" className="rounded text-[#1E5FA5] dark:text-blue-400 border-[#E0E0E0] dark:border-slate-800" /></td>
                  <td className="px-4 py-4">
                    <div className="text-[14px] font-bold text-[#212121] dark:text-slate-100">{req.user?.name}</div>
                    <div className="text-[12px] text-[#757575] dark:text-slate-400">{req.user?.email}</div>
                  </td>
                  <td className="px-4 py-4 text-[14px] text-[#212121] dark:text-slate-100 font-medium">{req.room?.name || t('no_room')}</td>
                  <td className="px-4 py-4 text-[14px] text-[#212121] dark:text-slate-100">{req.purpose}</td>
                  <td className="px-4 py-4">
                    <div className="text-[14px] text-[#212121] dark:text-slate-100 font-medium">{format(new Date(req.start_time), "dd/MM/yyyy")}</div>
                    <div className="text-[12px] text-[#757575] dark:text-slate-400">{format(new Date(req.start_time), "HH:mm")} - {format(new Date(req.end_time), "HH:mm")}</div>
                  </td>
                  {statusFilter === "PENDING" && (
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleUpdateStatus(req.id, "APPROVED")} className="p-1.5 bg-[#E8F5E9] dark:bg-green-900/30 text-[#2E7D32] hover:bg-[#C8E6C9] rounded transition-colors" title={t("approve")}>
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmState({ isOpen: true, type: 'REJECT', id: req.id })} className="p-1.5 bg-[#FDEDED] dark:bg-red-900/30 text-[#C62828] hover:bg-[#FFCDD2] rounded transition-colors" title={t("reject")}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!isLoading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#757575] dark:text-slate-400">
                    <CalendarX className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                    <p>{t("no_booking_requests")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'APPROVE_ALL' ? t("approve_all") : t("reject_request")}
        message={confirmState.type === 'APPROVE_ALL' 
          ? t("approve_all_confirm") 
          : t("reject_request_confirm")}
        confirmText={confirmState.type === 'APPROVE_ALL' ? t("approve_all") : t("reject")}
        isDestructive={confirmState.type === 'REJECT'}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
      />
    </div>
  );
}
