import { useState } from "react";
import { Search, XCircle, FileText, Calendar } from "lucide-react";

const MOCK_BOOKINGS = [
  { id: "BK-20231024-01", resource: "Lab AI & Máy học", time: "24/10/2023 • 09:00 - 11:30", status: "Approved" },
  { id: "BK-20231025-02", resource: "Oscilloscope Tektronix", time: "25/10/2023 • 14:00 - 16:00", status: "Pending" },
  { id: "BK-20231020-05", resource: "Phòng Thực hành Mạng", time: "20/10/2023 • 07:00 - 10:00", status: "Canceled" },
];

export function MyBookings() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Pending": return <span className="px-2.5 py-1 bg-[#FFF8E1] text-[#F59E0B] rounded text-[12px] font-medium border border-[#FFECB3]">Chờ duyệt</span>;
      case "Approved": return <span className="px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded text-[12px] font-medium border border-[#C8E6C9]">Đã duyệt</span>;
      case "Canceled": return <span className="px-2.5 py-1 bg-[#FDEDED] text-[#EF4444] rounded text-[12px] font-medium border border-[#FFCDD2]">Đã hủy</span>;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-bold text-[#212121]">Đơn đặt lịch của tôi</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F5] flex justify-between items-center">
          <div className="relative w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn hoặc tên tài nguyên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] focus:outline-none focus:border-[#1E5FA5]"
            />
          </div>
          <select className="px-4 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] text-[#212121] outline-none">
            <option>Tất cả trạng thái</option>
            <option>Chờ duyệt</option>
            <option>Đã duyệt</option>
            <option>Đã hủy</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-white">
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Mã đơn</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Tên thiết bị/Phòng Lab</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Thời gian (Ngày & Giờ)</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Trạng thái</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {MOCK_BOOKINGS.map((bk, i) => (
                <tr key={i} className="hover:bg-[#F5F5F5] bg-white transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-[#1E5FA5]">
                      <FileText className="w-4 h-4" /> {bk.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#212121] font-medium">{bk.resource}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[14px] text-[#757575]">
                      <Calendar className="w-4 h-4" /> {bk.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(bk.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {bk.status === "Pending" && (
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C62828] text-[#C62828] hover:bg-[#FDEDED] rounded text-[13px] font-medium transition-colors">
                        <XCircle className="w-4 h-4" /> Hủy đơn
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
