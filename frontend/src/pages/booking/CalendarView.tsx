import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Clock, Calendar, Search, Filter, Plus, Info } from "lucide-react";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 to 22:00
const DAYS = [
  { name: "T2", date: "23/10" },
  { name: "T3", date: "24/10" },
  { name: "T4", date: "25/10" },
  { name: "T5", date: "26/10" },
  { name: "T6", date: "27/10" },
  { name: "T7", date: "28/10" },
  { name: "CN", date: "29/10" },
];

// Giả lập dữ liệu Booking
// Tương ứng trạng thái: 
// - locked: Pessimistic Locked (Màu xám + Ổ khóa)
// - pending: Pending approval (Màu vàng nhạt)
// - approved: Đã duyệt (Màu xanh dương - của user)
const MOCK_BOOKINGS: Record<string, { type: "locked" | "pending" | "approved"; title?: string; duration?: number }> = {
  "0-8": { type: "locked", duration: 2 },
  "0-9": { type: "locked" }, // spanned
  "1-14": { type: "pending", title: "Thực hành Hóa học", duration: 3 },
  "1-15": { type: "pending" }, // spanned
  "1-16": { type: "pending" }, // spanned
  "2-10": { type: "approved", title: "Lab IoT - Ca sáng", duration: 2 },
  "2-11": { type: "approved" }, // spanned
  "4-9": { type: "locked", duration: 1 },
  "4-13": { type: "locked", duration: 2 },
  "4-14": { type: "locked" }, // spanned
};

export function CalendarView() {
  const [selectedRooms, setSelectedRooms] = useState<string[]>(["lab-iot", "lab-ai"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const toggleRoom = (id: string) => {
    setSelectedRooms(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const getSlot = (dayIdx: number, hour: number) => {
    return MOCK_BOOKINGS[`${dayIdx}-${hour}`];
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Lọc & Cài đặt (Left Sidebar) - 260px */}
      <div className="w-full md:w-[260px] flex flex-col gap-6 flex-shrink-0">
        <button className="w-full bg-[#1E5FA5] hover:bg-[#154a85] text-white py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm text-[14px]">
          <Plus className="w-5 h-5" /> Đặt phòng / Thiết bị
        </button>

        {/* Filter Box */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F5] flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#757575]" />
            <h3 className="text-[14px] font-bold text-[#212121]">Bộ lọc tìm kiếm</h3>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            
            {/* Lọc theo Phòng */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-[#212121] uppercase tracking-wide">Phòng Lab</h4>
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input 
                  type="text" 
                  placeholder="Tìm tên phòng..." 
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F5F5] border-transparent rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1E5FA5] transition-shadow"
                />
              </div>
              <div className="space-y-2">
                {[
                  { id: "lab-iot", label: "Lab IoT & Robotics" },
                  { id: "lab-ai", label: "Lab AI & Máy học" },
                  { id: "x3d", label: "Xưởng in 3D" },
                  { id: "hoa-sinh", label: "Phòng Thực hành Hóa Sinh" },
                  { id: "mang", label: "Phòng Thực hành Mạng" },
                ].map((room) => (
                  <label key={room.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedRooms.includes(room.id)}
                      onChange={() => toggleRoom(room.id)}
                      className="w-4 h-4 rounded border-[#E0E0E0] text-[#1E5FA5] focus:ring-[#1E5FA5]"
                    />
                    <span className="text-[13px] text-[#212121] group-hover:text-[#1E5FA5] transition-colors">{room.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#E0E0E0]"></div>

            {/* Lọc theo Loại Thiết bị */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-[#212121] uppercase tracking-wide">Thiết bị đi kèm</h4>
              <div className="space-y-2">
                {[
                  { id: "may-tinh", label: "Máy tính hiệu năng cao" },
                  { id: "cam-bien", label: "Bộ Kit Cảm biến" },
                  { id: "kinh-hien-vi", label: "Kính hiển vi điện tử" },
                  { id: "dong-ho-do", label: "Đồng hồ đo điện" },
                ].map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#E0E0E0] text-[#1E5FA5] focus:ring-[#1E5FA5]"
                    />
                    <span className="text-[13px] text-[#212121] group-hover:text-[#1E5FA5] transition-colors">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-4 space-y-3">
          <h4 className="text-[13px] font-bold text-[#212121]">Chú thích trạng thái</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white border border-[#E0E0E0] rounded-sm"></div>
              <span className="text-[13px] text-[#757575]">Trống (Có thể đặt)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#F5F5F5] border border-[#E0E0E0] rounded-sm flex items-center justify-center"><Lock className="w-3 h-3 text-[#9E9E9E]" /></div>
              <span className="text-[13px] text-[#757575]">Đã có người đặt / Khóa</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#FFF8E1] border border-[#FFE082] rounded-sm"></div>
              <span className="text-[13px] text-[#757575]">Đang chờ duyệt (Pending)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#D6E4F7] border border-[#1E5FA5] rounded-sm"></div>
              <span className="text-[13px] text-[#757575]">Lịch của bạn (Approved)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col min-w-0">
        
        {/* Calendar Header */}
        <div className="h-[64px] border-b border-[#E0E0E0] px-6 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#F5F5F5] rounded-md text-[#212121]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#212121]">23 - 29 Tháng 10, 2023</h2>
              <p className="text-[12px] text-[#757575] font-medium">Học kỳ 1 • Tuần 8</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[13px] font-bold text-[#757575] bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#212121] rounded transition-colors">
              Hôm nay
            </button>
            <div className="w-px h-6 bg-[#E0E0E0] mx-1"></div>
            <button className="p-1.5 text-[#757575] border border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#212121] rounded transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-[#757575] border border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#212121] rounded transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-[#F5F5F5] relative p-4">
          <div className="min-w-[800px] bg-white border border-[#E0E0E0] rounded-lg overflow-hidden shadow-sm">
            
            {/* Days Header Row */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#E0E0E0] bg-[#FAFAFA]">
              <div className="p-3 border-r border-[#E0E0E0] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#9E9E9E]" />
              </div>
              {DAYS.map((d, i) => (
                <div key={i} className={`p-3 border-r border-[#E0E0E0] text-center ${i === 2 ? 'bg-[#D6E4F7]/30' : ''}`}>
                  <div className={`text-[14px] font-bold ${i === 2 ? 'text-[#1E5FA5]' : 'text-[#212121]'}`}>{d.name}</div>
                  <div className={`text-[12px] mt-0.5 ${i === 2 ? 'text-[#1E5FA5] font-semibold' : 'text-[#757575]'}`}>{d.date}</div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="relative bg-white">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] relative group">
                  {/* Time Label */}
                  <div className="h-[60px] border-b border-r border-[#E0E0E0] flex items-start justify-center pt-2 text-[12px] font-medium text-[#757575] bg-[#FAFAFA]">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  
                  {/* Day Slots for this hour */}
                  {DAYS.map((_, dayIdx) => {
                    const slot = getSlot(dayIdx, hour);
                    
                    // If it's a spanned slot (has type but no title/duration -> it's the tail of a previous block)
                    // In a real app we'd absolutely position these, but for a grid we just visually style the cell.
                    let cellClasses = "border-b border-r border-[#E0E0E0] transition-colors relative h-[60px] p-1 ";
                    let content = null;

                    if (!slot) {
                      cellClasses += "bg-white hover:bg-[#F5F5F5] cursor-pointer";
                    } else if (slot.type === "locked") {
                      cellClasses += "bg-[#F5F5F5] cursor-not-allowed";
                      if (slot.duration) {
                        content = (
                          <div className="w-full h-full flex items-center justify-center flex-col opacity-60 text-[#757575]">
                            <Lock className="w-4 h-4 mb-1" />
                            <span className="text-[10px] font-medium">Đã đặt</span>
                          </div>
                        );
                      }
                    } else if (slot.type === "pending") {
                      cellClasses += "bg-[#FFF8E1] border-l-4 border-l-[#FFC107] cursor-not-allowed";
                      if (slot.duration) {
                        content = (
                          <div className="w-full h-full p-1 overflow-hidden">
                            <div className="text-[12px] font-bold text-[#F57F17] line-clamp-1 leading-tight">{slot.title}</div>
                            <div className="text-[10px] text-[#F57F17] mt-1 flex items-center gap-1">
                              <Info className="w-3 h-3" /> Chờ duyệt
                            </div>
                          </div>
                        );
                      }
                    } else if (slot.type === "approved") {
                      cellClasses += "bg-[#D6E4F7] border-l-4 border-l-[#1E5FA5] cursor-pointer hover:bg-[#C2D6F2]";
                      if (slot.duration) {
                        content = (
                          <div className="w-full h-full p-1 overflow-hidden">
                            <div className="text-[12px] font-bold text-[#1E5FA5] line-clamp-1 leading-tight">{slot.title}</div>
                            <div className="text-[10px] text-[#1E5FA5] mt-1 font-medium">Lịch của bạn</div>
                          </div>
                        );
                      }
                    }

                    // Remove right border for the last item
                    if (dayIdx === 6) cellClasses = cellClasses.replace("border-r", "");

                    return (
                      <div key={dayIdx} className={cellClasses}>
                        {content}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>

    </div>
  );
}
