import { Calendar, Clock, ArrowRight, LayoutGrid, CheckCircle2, ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export function DashboardStudent() {
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-[#D6E4F7] to-white rounded-xl p-6 border border-[#E0E0E0] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-[28px] font-bold text-[#212121]">Xin chào, Nguyễn Văn A 👋</h1>
          <p className="text-[14px] text-[#757575] mt-1">{today}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-[#1E5FA5] text-white flex items-center justify-center text-xl font-bold shadow-md border-4 border-white">
          A
        </div>
      </div>

      {/* Stats Row - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Clock className="w-8 h-8 text-[#E65100]" />}
          value="2"
          label="Đơn chờ duyệt"
          trend="Hôm nay"
          trendColor="text-[#757575]"
          color="border-l-[#E65100]"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />}
          value="5"
          label="Đơn đã duyệt"
          trend="↑ 2 so với tháng trước"
          trendColor="text-[#2E7D32]"
          color="border-l-[#2E7D32]"
        />
        <StatCard 
          icon={<LayoutGrid className="w-8 h-8 text-[#673AB7]" />}
          value="12h"
          label="Tổng giờ sử dụng"
          trend="Tháng này"
          trendColor="text-[#757575]"
          color="border-l-[#673AB7]"
        />
        <StatCard 
          icon={<Calendar className="w-8 h-8 text-[#C62828]" />}
          value="1"
          label="Lịch sắp tới hôm nay"
          trend="14:00 - 16:30"
          trendColor="text-[#C62828]"
          color="border-l-[#C62828]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column 65% - Lịch đặt sắp tới */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E0E0E0] flex justify-between items-center bg-[#F5F5F5]">
            <h2 className="text-[18px] font-semibold text-[#212121]">Lịch đặt sắp tới</h2>
            <Link to="/calendar" className="text-[14px] font-medium text-[#1E5FA5] hover:underline">
              Đặt phòng mới
            </Link>
          </div>
          <div className="divide-y divide-[#E0E0E0] flex-1">
            {[
              { room: "Phòng Thực hành Hóa Sinh", date: "Hôm nay", time: "14:00 - 16:30", status: "Approved" },
              { room: "Lab Máy tính AI", date: "Ngày mai", time: "09:00 - 11:00", status: "Pending" },
              { room: "Xưởng in 3D", date: "26/10/2023", time: "13:30 - 15:00", status: "Approved" },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-[#F5F5F5] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-[#D6E4F7] text-[#1E5FA5] flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#212121]">{item.room}</h3>
                    <div className="text-[12px] text-[#757575] mt-1">{item.date} • {item.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded text-[12px] font-medium ${
                    item.status === "Approved" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF3E0] text-[#E65100]"
                  }`}>
                    {item.status === "Approved" ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                  {item.status === "Pending" && (
                    <button className="text-[12px] text-[#C62828] hover:underline font-medium">Hủy</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-[#F5F5F5] border-t border-[#E0E0E0] text-center">
            <button className="text-[14px] font-medium text-[#1E5FA5] hover:underline inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column 35% - Thông báo gần đây */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E0E0E0] bg-[#F5F5F5]">
            <h2 className="text-[18px] font-semibold text-[#212121]">Thông báo gần đây</h2>
          </div>
          <div className="divide-y divide-[#E0E0E0] flex-1">
            {[
              { title: "Yêu cầu mượn Lab AI đã được duyệt", time: "2 giờ trước", unread: true },
              { title: "Nhắc nhở: Lịch thực hành chiều nay", time: "5 giờ trước", unread: true },
              { title: "Hệ thống bảo trì cuối tuần này", time: "1 ngày trước", unread: false },
            ].map((item, i) => (
              <div key={i} className={`px-6 py-4 flex gap-3 hover:bg-[#F5F5F5] transition-colors ${item.unread ? "bg-blue-50/30" : ""}`}>
                <div className="mt-1">
                  <div className={`w-2 h-2 rounded-full ${item.unread ? "bg-[#1E5FA5]" : "bg-transparent"}`}></div>
                </div>
                <div>
                  <p className={`text-[14px] ${item.unread ? "font-semibold text-[#212121]" : "text-[#212121]"}`}>{item.title}</p>
                  <p className="text-[12px] text-[#757575] mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-[#F5F5F5] border-t border-[#E0E0E0] text-center">
            <button className="text-[14px] font-medium text-[#1E5FA5] hover:underline inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid - Phòng Lab khả dụng hôm nay */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-semibold text-[#212121]">Phòng Lab khả dụng hôm nay</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Lab IoT & Robotics", building: "Tòa A - Tầng 2", capacity: 20, available: true },
            { name: "Phòng Thực hành Mạng", building: "Tòa B - Tầng 3", capacity: 40, available: true },
            { name: "Xưởng Cơ khí", building: "Xưởng 1", capacity: 15, available: false },
          ].map((lab, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-[#757575]" />
                </div>
                <span className={`px-2 py-1 rounded text-[12px] font-medium ${
                  lab.available ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FDEDED] text-[#C62828]"
                }`}>
                  {lab.available ? "Khả dụng" : "Đang bảo trì"}
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-[#212121] mb-1">{lab.name}</h3>
              <p className="text-[14px] text-[#757575] mb-4">{lab.building} • Sức chứa: {lab.capacity}</p>
              <Link to="/calendar" className={`w-full py-2 rounded flex justify-center items-center text-[14px] font-medium transition-colors ${
                lab.available 
                  ? "bg-[#D6E4F7] text-[#1E5FA5] hover:bg-[#1E5FA5] hover:text-white" 
                  : "bg-[#F5F5F5] text-[#757575] cursor-not-allowed"
              }`}>
                {lab.available ? "Đặt ngay" : "Không thể đặt"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, trend, trendColor, color }: any) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#E0E0E0] border-l-4 ${color} p-5 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group`}>
      <div className="absolute top-4 right-4 p-2 rounded-lg bg-[#F5F5F5] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-[36px] font-bold text-[#212121] leading-none mb-1">{value}</div>
        <div className="text-[14px] text-[#757575] font-medium mb-3">{label}</div>
        <div className={`text-[12px] font-medium ${trendColor}`}>{trend}</div>
      </div>
    </div>
  );
}
