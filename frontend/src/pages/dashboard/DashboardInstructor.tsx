import { useState, useEffect } from "react";
import { BookOpen, Clock, LayoutGrid, CheckCircle2, ArrowRight } from "lucide-react";
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-neutral-100 dark:border-slate-800 flex justify-between items-center shadow-sm dark:shadow-slate-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div>
          <h1 className="text-[28px] font-bold text-[#212121] dark:text-slate-100">Chào mừng Giảng viên, {userName} 👋</h1>
          <p className="text-[14px] text-[#757575] dark:text-slate-400 mt-1">{today}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-md border-4 border-white dark:border-slate-800">
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
        />
        <StatCard
          icon={<Clock className="w-8 h-8 text-[#E65100]" />}
          value={isLoading ? "..." : pendingCount}
          label="Đơn chờ duyệt"
          trend="Cần xử lý"
          trendColor="text-[#E65100]"
          color="border-l-[#E65100]"
        />
        <StatCard
          icon={<CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />}
          value={isLoading ? "..." : approvedCount}
          label="Lịch sắp tới"
          trend="Đã xác nhận"
          trendColor="text-[#2E7D32]"
          color="border-l-[#2E7D32]"
        />
        <StatCard
          icon={<LayoutGrid className="w-8 h-8 text-[#673AB7]" />}
          value={isLoading ? "..." : availableRooms.filter((r) => r.status === "AVAILABLE").length}
          label="Phòng Lab Trống"
          trend="Sẵn sàng đặt"
          trendColor="text-[#673AB7]"
          color="border-l-[#673AB7]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lịch duyệt sắp tới */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="px-7 py-6 border-b border-neutral-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-slate-100">Đơn đặt phòng cần lưu ý</h2>
            <Link to="/approvals" className="text-[14px] font-medium text-indigo-600 hover:underline">
              Tới trang duyệt đơn
            </Link>
          </div>
          <div className="divide-y divide-[#E0E0E0] dark:divide-slate-800 flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-[#757575] dark:text-slate-400">Đang tải...</div>
            ) : upcomingBookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#757575] dark:text-slate-400">Không có đơn đặt phòng nào gần đây</div>
            ) : (
              upcomingBookings.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
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
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="px-7 py-6 border-b border-neutral-100 dark:border-slate-800">
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-slate-100">Báo cáo & Sự cố</h2>
          </div>
          <div className="divide-y divide-[#E0E0E0] dark:divide-slate-800 flex-1 p-6 text-center text-[#757575] dark:text-slate-400 text-sm">
            Hiện chưa có báo cáo sự cố nào thuộc học phần của bạn.
          </div>
          <div className="px-6 py-3 bg-[#F5F5F5] dark:bg-slate-800/50 border-t border-[#E0E0E0] dark:border-slate-800 text-center">
            <Link to="/reports" className="text-[14px] font-medium text-indigo-600 hover:underline inline-flex items-center gap-1">
              Đi tới Báo cáo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, trend, trendColor, color }: any) {
  const bgHighlightClass = color.replace('border-l-', 'bg-') + '/10';
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl border border-neutral-100 dark:border-slate-800 p-7 cursor-pointer transition-all duration-300 relative overflow-hidden group`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${color.replace('border-l-', 'bg-')} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}></div>
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
