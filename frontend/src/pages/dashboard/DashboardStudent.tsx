import { useState, useEffect } from "react";
import { Calendar, Clock, ArrowRight, LayoutGrid, CheckCircle2, CalendarPlus, Bell } from "lucide-react";
import { Link } from "react-router";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { bookingService, roomService, notificationService, authService } from "../../services";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { vi } from "date-fns/locale";
import { socketService } from "../../services/socket";

interface Booking {
  id: number;
  status: string;
  start_time: string;
  end_time: string;
  room?: { id: number; name: string };
}

interface Room {
  id: number;
  name: string;
  location?: string;
  capacity?: number;
  status: string;
}

export function DashboardStudent() {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Lấy thông tin user thật từ localStorage
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userName = currentUser?.name || t("user_role");
  const userInitial = userName.charAt(0).toUpperCase();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [bookingsRes, roomsRes] = await Promise.all([
          bookingService.getAll(),
          roomService.getAll(),
        ]);

        const bookings: Booking[] = bookingsRes.data || [];
        const rooms: Room[] = roomsRes.data || [];

        // Đếm thống kê
        const pending = bookings.filter((b) => b.status === "PENDING");
        const approved = bookings.filter((b) => b.status === "APPROVED");

        setPendingCount(pending.length);
        setApprovedCount(approved.length);

        // Lịch sắp tới: PENDING + APPROVED, sắp xếp theo start_time
        const upcoming = bookings
          .filter((b) => b.status === "PENDING" || b.status === "APPROVED")
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
          .slice(0, 5);
        setUpcomingBookings(upcoming);

        // Tính toán trạng thái Khả dụng thời gian thực (Dynamic Status)
        const now = new Date().getTime();
        
        const smartRooms = rooms.map(room => {
          // Nếu trạng thái tĩnh của phòng không phải AVAILABLE (vd MAINTENANCE, BROKEN) thì giữ nguyên
          if (room.status !== "AVAILABLE") return room;

          // Kiểm tra xem phòng có đang bị đặt không
          const isCurrentlyInUse = approved.some(booking => {
            if (booking.room?.id !== room.id && (booking as any).room_id !== room.id) return false;
            const start = new Date(booking.start_time).getTime();
            const end = new Date(booking.end_time).getTime();
            return now >= start && now <= end;
          });

          if (isCurrentlyInUse) {
            return { ...room, status: "IN_USE" };
          }
          return room;
        });

        // Sắp xếp: AVAILABLE lên đầu, sau đó IN_USE, cuối cùng là MAINTENANCE/BROKEN
        const sortOrder: Record<string, number> = { "AVAILABLE": 1, "IN_USE": 2, "MAINTENANCE": 3, "BROKEN": 4 };
        smartRooms.sort((a, b) => (sortOrder[a.status] || 5) - (sortOrder[b.status] || 5));

        // Lấy 6 phòng đứng đầu danh sách
        setAvailableRooms(smartRooms.slice(0, 6));
      } catch (error: any) {
        const msg = error.response?.data?.message || t("load_dashboard_error");
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Nạp thông báo cũ từ Database
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getUnread();
        setNotifications(res.data);
      } catch (err) {
        console.error("Lỗi tải thông báo:", err);
      }
    };
    fetchNotifications();

    // Khởi tạo Socket.io
    const socket = socketService.getSocket();
    if (socket) {
      const handleNotif = (data: any) => {
        setNotifications((prev) => [data, ...prev].slice(0, 20));
      };
      const handleRefresh = () => {
        fetchData(); // Lắng nghe sự kiện để tải lại data ngầm
      };
      
      socket.on("notification", handleNotif);
      socket.on("calendar_updated", handleRefresh);
      socket.on("room_updated", handleRefresh);

      return () => {
        socket.off("notification", handleNotif);
        socket.off("calendar_updated", handleRefresh);
        socket.off("room_updated", handleRefresh);
      };
    }
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      toast.success(t("marked_all_read") || "Đã đánh dấu tất cả là đã đọc");
    } catch (err) {
      console.error(err);
    }
  };

  // Format ngày cho Lịch đặt sắp tới
  const formatBookingDate = (startTime: string) => {
    const date = new Date(startTime);
    if (isToday(date)) return t("today");
    if (isTomorrow(date)) return t("tomorrow");
    return format(date, "dd/MM/yyyy");
  };

  const formatBookingTime = (startTime: string, endTime: string) => {
    return `${format(new Date(startTime), "HH:mm")} - ${format(new Date(endTime), "HH:mm")}`;
  };

  const generateICS = (booking: Booking) => {
    const startDate = new Date(booking.start_time);
    const endDate = new Date(booking.end_time);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LabBook//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${booking.id}-${Date.now()}@labbook.vn
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${t("practice_at")}${booking.room?.name || t("lab_room")}
DESCRIPTION:Lịch thực hành được đặt qua hệ thống LabBook.
LOCATION:${booking.room?.name || t("lab_room")}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lich_thuc_hanh_${booking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("download_ics_success"));
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 flex justify-between items-center shadow-lg shadow-blue-500/20 transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-[28px] font-bold text-white">{t("greeting", { name: userName })} 👋</h1>
          <p className="text-[14px] text-blue-100 mt-1">{today}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-xl font-bold shadow-lg border-4 border-white/30 relative z-10">
          {userInitial}
        </div>
      </div>

      {/* Stats Row - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Clock className="w-8 h-8 text-[#E65100]" />}
          value={isLoading ? "..." : pendingCount}
          label={t("pending_bookings")}
          trend={t("processing")}
          trendColor="text-[#757575] dark:text-slate-400"
          color="border-l-[#E65100]"
        />
        <StatCard
          icon={<CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />}
          value={isLoading ? "..." : approvedCount}
          label={t("approved_bookings")}
          trend={t("total")}
          trendColor="text-[#2E7D32]"
          color="border-l-[#2E7D32]"
        />
        <StatCard
          icon={<LayoutGrid className="w-8 h-8 text-[#673AB7]" />}
          value={isLoading ? "..." : availableRooms.filter((r) => r.status === "AVAILABLE").length}
          label={t("available_rooms")}
          trend={t("current")}
          trendColor="text-[#757575] dark:text-slate-400"
          color="border-l-[#673AB7]"
        />
        <StatCard
          icon={<Calendar className="w-8 h-8 text-[#C62828]" />}
          value={isLoading ? "..." : upcomingBookings.length}
          label={t("upcoming_schedule")}
          trend={t("pending_and_approved")}
          trendColor="text-[#C62828]"
          color="border-l-[#C62828]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column 65% - Lịch đặt sắp tới */}
        <div className="lg:col-span-8 bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E0E0E0]/50 dark:border-slate-800/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
          <div className="px-7 py-6 border-b border-neutral-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-slate-100">{t("upcoming_schedule")}</h2>
            <Link to="/calendar" className="text-[14px] font-medium text-[#1E5FA5] dark:text-blue-400 hover:underline">
              {t("book_new_room")}
            </Link>
          </div>
          <div className="divide-y divide-[#E0E0E0] dark:divide-slate-800 flex-1">
            {isLoading ? (
              <>
                <SkeletonBookingItem />
                <SkeletonBookingItem />
                <SkeletonBookingItem />
              </>
            ) : upcomingBookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#757575] dark:text-slate-400">{t("no_upcoming_bookings")}</div>
            ) : (
              upcomingBookings.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-[#D6E4F7] dark:bg-blue-900/30 text-[#1E5FA5] dark:text-blue-400 flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#212121] dark:text-slate-200">
                        {item.room?.name || `Phòng #${item.room?.id || "?"}`}
                      </h3>
                      <div className="text-[12px] text-[#757575] dark:text-slate-400 mt-1">
                        {formatBookingDate(item.start_time)} • {formatBookingTime(item.start_time, item.end_time)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded text-[12px] font-medium ${
                      item.status === "APPROVED"
                        ? "bg-[#E8F5E9] dark:bg-green-900/30 text-[#2E7D32] dark:text-green-400"
                        : "bg-[#FFF3E0] dark:bg-orange-900/30 text-[#E65100] dark:text-orange-400"
                    }`}>
                      {item.status === "APPROVED" ? t("approved") : t("pending")}
                    </span>
                    {item.status === "APPROVED" && (
                      <button
                        onClick={() => generateICS(item)}
                        className="text-[#1E5FA5] dark:text-blue-400 hover:bg-[#D6E4F7] dark:bg-blue-900/30 dark:hover:bg-blue-900/50 p-1.5 rounded transition-colors"
                        title={t("save_to_calendar")}
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </button>
                    )}
                    {item.status === "PENDING" && (
                      <button
                        className="text-[12px] text-[#C62828] dark:text-red-400 hover:underline font-medium"
                        onClick={() => toast.error(t("cancel_feature_msg"))}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-slate-800 text-center">
            <Link to="/my-bookings" className="text-[14px] font-medium text-[#1E5FA5] dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              {t("view_all")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column 35% - Thông báo gần đây */}
        <div className="lg:col-span-4 bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E0E0E0]/50 dark:border-slate-800/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md h-[400px]">
          <div className="px-7 py-6 border-b border-neutral-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-slate-100">{t("recent_notifications")}</h2>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
          <div className="divide-y divide-[#E0E0E0] dark:divide-slate-800 flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-blue-200 dark:text-slate-600" />
                </div>
                <p className="text-[#757575] dark:text-slate-400 font-medium">Bạn không có thông báo mới nào</p>
              </div>
            ) : (
              notifications.map((item, i) => (
                <div 
                  key={item.id || i} 
                  onClick={() => handleMarkAsRead(item.id)}
                  className="px-6 py-4 flex gap-4 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer relative group"
                >
                  <div className="mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E5FA5] dark:bg-blue-500 shadow-[0_0_8px_rgba(30,95,165,0.5)]"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#212121] dark:text-slate-100 mb-1">{item.title}</p>
                    {item.message && <p className="text-[13px] text-[#424242] dark:text-slate-300 mb-2">{item.message}</p>}
                    <p className="text-[11px] text-[#757575] dark:text-slate-500 font-medium uppercase tracking-wider">
                      {formatDistanceToNow(new Date(item.created_at || item.timestamp), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-6 py-3 bg-[#F5F5F5] dark:bg-slate-800/50 border-t border-[#E0E0E0] dark:border-slate-800 text-center shrink-0">
              <button 
                onClick={handleMarkAllAsRead} 
                className="text-[14px] font-medium text-[#1E5FA5] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid - Phòng Lab khả dụng hôm nay */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-semibold text-[#212121] dark:text-slate-200">{t("available_labs")}</h2>
        {isLoading ? (
          <div className="text-center py-8 text-[#757575] dark:text-slate-400">{t("loading_rooms")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableRooms.map((lab) => {
              const isAvailable = lab.status === "AVAILABLE";
              return (
                <div key={lab.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E0E0E0]/50 dark:border-slate-800/50 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center">
                      <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                      isAvailable
                        ? "bg-[#E8F5E9] dark:bg-green-900/30 text-[#2E7D32] dark:text-green-400"
                        : "bg-[#FDEDED] dark:bg-red-900/30 text-[#C62828] dark:text-red-400"
                    }`}>
                      {isAvailable ? t("available") : lab.status === "MAINTENANCE" ? t("maintenance") : t("in_use")}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#212121] dark:text-slate-200 mb-1">{lab.name}</h3>
                  <p className="text-[14px] text-[#757575] dark:text-slate-400 mb-4">
                    {lab.location || "VJU Campus"}{lab.capacity ? ` • ${t("capacity")}${lab.capacity}` : ""}
                  </p>
                  <Link
                    to="/calendar"
                    className={`w-full py-2.5 rounded-xl flex justify-center items-center text-[14px] font-bold transition-all duration-300 ${
                      isAvailable
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                        : "bg-[#F5F5F5] dark:bg-slate-800 text-[#757575] dark:text-slate-500 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    {isAvailable ? t("book_now_btn") : t("cannot_book")}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton shimmer component ──
function SkeletonBookingItem() {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 w-full">
        <div className="w-12 h-12 rounded bg-gray-200 dark:bg-slate-700 animate-pulse flex-shrink-0"></div>
        <div className="space-y-2 w-full max-w-[200px]">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-16"></div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, trend, trendColor, color }: any) {
  const colorMap: Record<string, { bg: string; gradient: string; shadow: string }> = {
    'border-l-[#E65100]': { bg: 'bg-orange-50 dark:bg-orange-900/20', gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
    'border-l-[#2E7D32]': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
    'border-l-[#673AB7]': { bg: 'bg-purple-50 dark:bg-purple-900/20', gradient: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-500/20' },
    'border-l-[#C62828]': { bg: 'bg-rose-50 dark:bg-rose-900/20', gradient: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
  };
  const colors = colorMap[color] || { bg: 'bg-blue-50', gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl border border-[#E0E0E0]/50 dark:border-slate-800/50 p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group`}
    >
      <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full bg-gradient-to-br ${colors.gradient} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`}></div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">{label}</h3>
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{value}</div>
        <div className={`text-[13px] font-medium mt-2 ${trendColor}`}>{trend}</div>
      </div>
    </motion.div>
  );
}
