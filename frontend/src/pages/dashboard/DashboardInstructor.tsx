import { useState, useEffect } from "react";
import { BookOpen, Clock, LayoutGrid, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { bookingService, courseService, roomService } from "../../services";
import { format, isToday, isTomorrow } from "date-fns";

export function DashboardInstructor() {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userName = currentUser?.name || "Giảng viên";
  const userInitial = userName.charAt(0).toUpperCase();

  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [bookingsRes, coursesRes, roomsRes] = await Promise.all([
          bookingService.getAll(),
          courseService.getAll(),
          roomService.getAll(),
        ]);

        const bookings = bookingsRes.data || [];
        const courses = coursesRes.data || [];
        const rooms = roomsRes.data || [];

        // Lọc số lượng khóa học do giảng viên này phụ trách
        const myCourses = courses.filter((c: any) => c.instructor_id === currentUser?.id);
        setCoursesCount(myCourses.length);

        const pending = bookings.filter((b: any) => b.status === "PENDING");
        const approved = bookings.filter((b: any) => b.status === "APPROVED");

        setPendingCount(pending.length);
        setApprovedCount(approved.length);

        const upcoming = bookings
          .filter((b: any) => b.status === "PENDING" || b.status === "APPROVED")
          .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
          .slice(0, 5);
        setUpcomingBookings(upcoming);

        setAvailableRooms(rooms.slice(0, 3));
      } catch (error: any) {
        toast.error("Không thể tải dữ liệu Dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id]);

  const formatBookingDate = (startTime: string) => {
    const date = new Date(startTime);
    if (isToday(date)) return t("today");
    if (isTomorrow(date)) return t("tomorrow");
    return format(date, "dd/MM/yyyy");
  };

  const formatBookingTime = (startTime: string, endTime: string) => {
    return `${format(new Date(startTime), "HH:mm")} - ${format(new Date(endTime), "HH:mm")}`;
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 flex justify-between items-center shadow-lg shadow-blue-500/20 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10">
          <h1 className="text-[28px] font-bold text-white mb-2">Chào mừng Giảng viên, {userName} 👋</h1>
          <p className="text-[14px] text-blue-100 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" /> {today}
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-2xl font-bold shadow-xl border border-white/30 relative z-10 hover:bg-white/30 transition-colors cursor-pointer">
          {userInitial}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
          value={isLoading ? "..." : coursesCount}
          label="Học phần phụ trách"
          trend="Học kỳ này"
          trendColor="text-indigo-600"
          color="border-l-indigo-600"
          bgColor="bg-indigo-600"
        />
        <StatCard
          icon={<Clock className="w-8 h-8 text-orange-600" />}
          value={isLoading ? "..." : pendingCount}
          label="Đơn chờ duyệt"
          trend="Cần xử lý"
          trendColor="text-orange-600"
          color="border-l-orange-600"
          bgColor="bg-orange-600"
        />
        <StatCard
          icon={<CheckCircle2 className="w-8 h-8 text-green-600" />}
          value={isLoading ? "..." : approvedCount}
          label="Lịch sắp tới"
          trend="Đã xác nhận"
          trendColor="text-green-600"
          color="border-l-green-600"
          bgColor="bg-green-600"
        />
        <StatCard
          icon={<LayoutGrid className="w-8 h-8 text-purple-600" />}
          value={isLoading ? "..." : availableRooms.filter((r) => r.status === "AVAILABLE").length}
          label="Phòng Lab Trống"
          trend="Sẵn sàng đặt"
          trendColor="text-purple-600"
          color="border-l-purple-600"
          bgColor="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lịch duyệt sắp tới */}
        <div className="lg:col-span-8 bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E0E0E0]/50 dark:border-slate-800/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
          <div className="px-7 py-6 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 flex justify-between items-center bg-white/40 dark:bg-slate-800/40">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Đơn đặt phòng cần lưu ý
            </h2>
            <Link to="/approvals" className="text-[14px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
              Tới trang duyệt đơn <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[#E0E0E0]/50 dark:divide-slate-800/50 flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-[#757575] dark:text-slate-400">Đang tải...</div>
            ) : upcomingBookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#757575] dark:text-slate-400">Không có đơn đặt phòng nào gần đây</div>
            ) : (
              upcomingBookings.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#212121] dark:text-slate-200">
                        {item.room?.name || `Phòng #${item.room?.id || "?"}`}
                      </h3>
                      <div className="text-[12px] text-[#757575] dark:text-slate-400 mt-1">
                        {item.user?.name || "Sinh viên"} • {formatBookingDate(item.start_time)}
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
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-slate-800 text-center">
            <Link to="/approvals" className="text-[14px] font-medium text-indigo-600 hover:underline inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Thông báo */}
        <div className="lg:col-span-4 bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E0E0E0]/50 dark:border-slate-800/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
          <div className="px-7 py-6 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Báo cáo & Sự cố
            </h2>
          </div>
          <div className="divide-y divide-[#E0E0E0]/50 dark:divide-slate-800/50 flex-1 p-6 flex flex-col items-center justify-center text-center text-[#757575] dark:text-slate-400 text-sm min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            Hiện chưa có báo cáo sự cố nào thuộc học phần của bạn.
          </div>
          <div className="p-4 bg-white/40 dark:bg-slate-800/40 border-t border-[#E0E0E0]/50 dark:border-slate-800/50 text-center">
            <Link to="/reports" className="text-[14px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg w-full justify-center">
              Đi tới Báo cáo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, trend, trendColor, color, bgColor }: any) {
  const bgHighlightClass = bgColor ? `${bgColor}/10` : color.replace('border-l-', 'bg-') + '/10';
  const blurBgClass = bgColor || color.replace('border-l-', 'bg-');
  
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md border border-[#E0E0E0]/50 dark:border-slate-800/50 p-7 cursor-pointer transition-all duration-300 relative overflow-hidden group`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${blurBgClass} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}></div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgHighlightClass} dark:bg-opacity-20 shadow-inner`}>
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
