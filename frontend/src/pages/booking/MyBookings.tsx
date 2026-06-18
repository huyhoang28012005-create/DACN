import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, XCircle, FileText, Calendar, CalendarX } from "lucide-react";
import { bookingService } from "../../services";
import { format } from "date-fns";

import { toast } from "react-hot-toast";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { useNavigate } from "react-router";

export function MyBookings() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || t("load_bookings_error");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCancel = async () => {
    if (cancelConfirmId) {
      try {
        await bookingService.cancel(cancelConfirmId.toString());
        toast.success(t("cancel_success"));
        fetchData();
      } catch (error: any) {
        const msg = error.response?.data?.message || t("cancel_failed");
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
      setCancelConfirmId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = { PENDING: t("status_pending"), APPROVED: t("status_approved"), REJECTED: t("status_rejected"), CANCELED: t("status_canceled") };

    switch(status) {
      case "PENDING": return <span className="px-2.5 py-1 bg-[#FFF8E1] text-[#F59E0B] rounded text-[12px] font-medium border border-[#FFECB3]">{map["PENDING"]}</span>;
      case "APPROVED": return <span className="px-2.5 py-1 bg-[#E8F5E9] dark:bg-green-900/30 text-[#2E7D32] rounded text-[12px] font-medium border border-[#C8E6C9]">{map["APPROVED"]}</span>;
      case "REJECTED": return <span className="px-2.5 py-1 bg-[#FDEDED] dark:bg-red-900/30 text-[#EF4444] rounded text-[12px] font-medium border border-[#FFCDD2]">{map["REJECTED"]}</span>;
      case "CANCELED": return <span className="px-2.5 py-1 bg-[#F5F5F5] dark:bg-slate-800/50 text-[#757575] dark:text-slate-400 rounded text-[12px] font-medium border border-[#E0E0E0] dark:border-slate-800">{map["CANCELED"]}</span>;
      default: return <span className="px-2.5 py-1 bg-[#F5F5F5] dark:bg-slate-800/50 text-[#757575] dark:text-slate-400 rounded text-[12px] font-medium border border-[#E0E0E0] dark:border-slate-800">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.id.toString().includes(searchTerm) || 
    (b.room?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-bold text-[#0F172A] dark:text-slate-100 tracking-tight">{t("my_bookings")}</h1>
      </div>

      <div className="bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E0E0E0]/50 dark:border-slate-800/50 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between items-center">
          <div className="relative w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] dark:text-slate-400" />
            <input 
              type="text" 
              placeholder={t("search_booking_placeholder")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm">
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("booking_code")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("lab_room")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("purpose")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("time_date_hour")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">{t("status")}</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-right">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-800">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredBookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 bg-white dark:bg-slate-900 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-[#1E5FA5] dark:text-blue-400">
                      <FileText className="w-4 h-4" /> #{bk.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#212121] dark:text-slate-100 font-medium">{bk.room?.name}</td>
                  <td className="px-6 py-4 text-[14px] text-[#757575] dark:text-slate-400">{bk.purpose}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[14px] text-[#212121] dark:text-slate-100">
                      <Calendar className="w-4 h-4 text-[#757575] dark:text-slate-400" /> 
                      {format(new Date(bk.start_time), "dd/MM/yyyy HH:mm")} - {format(new Date(bk.end_time), "HH:mm")}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(bk.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {bk.status === "PENDING" && (
                      <button onClick={() => setCancelConfirmId(bk.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-[#C62828] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-[13px] font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm">
                        <XCircle className="w-4 h-4" /> {t("cancel_booking")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
                        <CalendarX className="w-10 h-10 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">{t("no_bookings_yet")}</h3>
                      <p className="text-sm text-slate-500 text-center leading-relaxed">
                        Bạn chưa thực hiện bất kỳ phiên đặt phòng nào. Hãy tạo mới một đơn đặt lịch để sử dụng tài nguyên của phòng Lab.
                      </p>
                      <button 
                        onClick={() => navigate('/calendar')} 
                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[14px] font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Đặt lịch ngay
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelConfirmId !== null}
        title={t("confirm_cancel_booking")}
        message={t("confirm_cancel_booking_msg")}
        confirmText={t("cancel_booking_btn")}
        isDestructive={true}
        onConfirm={executeCancel}
        onCancel={() => setCancelConfirmId(null)}
      />
    </div>
  );
}

// ── Skeleton shimmer component ──
function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-40"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-20"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-20"></div>
        </div>
      </td>
    </tr>
  );
}

