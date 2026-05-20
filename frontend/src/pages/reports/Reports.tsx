import { Download, FileText, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MOCK_BAR_DATA = [
  { name: 'T2', value: 40 },
  { name: 'T3', value: 65 },
  { name: 'T4', value: 80 },
  { name: 'T5', value: 45 },
  { name: 'T6', value: 90 },
  { name: 'T7', value: 20 },
  { name: 'CN', value: 10 },
];

const MOCK_PIE_DATA = [
  { name: 'Đã duyệt', value: 60, color: '#2E7D32' },
  { name: 'Chờ duyệt', value: 25, color: '#F59E0B' },
  { name: 'Đã hủy', value: 15, color: '#EF4444' },
];

const MOCK_HEATMAP = Array.from({ length: 7 }, (_, day) => 
  Array.from({ length: 8 }, (_, hour) => ({
    day, hour, value: Math.floor(Math.random() * 100)
  }))
);
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

export function Reports() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-bold text-[#212121]">Báo cáo & Thống kê</h1>
        <button className="flex items-center gap-2 bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#212121] px-4 py-2.5 rounded-md font-medium transition-colors text-[14px] shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Tổng số yêu cầu" value="1,284" sub="+12% tuần này" icon={<FileText className="w-5 h-5 text-[#1E5FA5]" />} bg="bg-[#D6E4F7]/50" />
        <KPICard title="Thiết bị đang bảo trì" value="15" sub="3 thiết bị sắp sửa xong" icon={<Settings className="w-5 h-5 text-[#F59E0B]" />} bg="bg-[#FFF8E1]" />
        <KPICard title="Hóa chất sắp hết hạn" value="8" sub="Cần kiểm tra ngay" icon={<AlertTriangle className="w-5 h-5 text-[#EF4444]" />} bg="bg-[#FDEDED]" />
        <KPICard title="Tỷ lệ phê duyệt" value="85%" sub="Ổn định" icon={<CheckCircle className="w-5 h-5 text-[#2E7D32]" />} bg="bg-[#E8F5E9]" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
          <h2 className="text-[16px] font-bold text-[#212121] mb-6">Tần suất sử dụng phòng Lab theo tuần</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_BAR_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#757575', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#757575', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F5F5F5'}} contentStyle={{borderRadius: '8px', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="value" fill="#1E5FA5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
          <h2 className="text-[16px] font-bold text-[#212121] mb-6">Tỷ lệ trạng thái đơn hàng</h2>
          <div className="h-[280px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_PIE_DATA}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[140px] flex flex-col gap-4">
              {MOCK_PIE_DATA.map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <div>
                    <div className="text-[12px] text-[#757575]">{item.name}</div>
                    <div className="text-[14px] font-bold text-[#212121]">{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
        <h2 className="text-[16px] font-bold text-[#212121] mb-6">Khung giờ cao điểm</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header Row */}
            <div className="flex mb-2">
              <div className="w-16"></div>
              {HOURS.map(h => (
                <div key={h} className="flex-1 text-center text-[12px] text-[#757575]">{h}</div>
              ))}
            </div>
            {/* Grid */}
            <div className="space-y-2">
              {DAYS.map((day, dIdx) => (
                <div key={day} className="flex items-center gap-2">
                  <div className="w-14 text-[13px] font-bold text-[#212121]">{day}</div>
                  <div className="flex-1 flex gap-2">
                    {HOURS.map((_, hIdx) => {
                      const val = MOCK_HEATMAP[dIdx][hIdx].value;
                      // Calculate opacity based on value (0-100)
                      const opacity = Math.max(0.1, val / 100);
                      return (
                        <div 
                          key={`${dIdx}-${hIdx}`} 
                          className="flex-1 h-10 rounded cursor-help transition-all hover:ring-2 hover:ring-[#212121] hover:ring-offset-1"
                          style={{ backgroundColor: `rgba(30, 95, 165, ${opacity})` }}
                          title={`${day} lúc ${HOURS[hIdx]}: ${val}% công suất`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* Heatmap Legend */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <span className="text-[12px] text-[#757575]">Thấp</span>
              <div className="w-32 h-3 rounded bg-gradient-to-r from-[#1E5FA5]/10 to-[#1E5FA5]"></div>
              <span className="text-[12px] text-[#757575]">Cao</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({title, value, sub, icon, bg}: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-[13px] font-medium text-[#757575] mb-1">{title}</div>
        <div className="text-[24px] font-bold text-[#212121] leading-none mb-2">{value}</div>
        <div className="text-[12px] text-[#757575]">{sub}</div>
      </div>
    </div>
  );
}
