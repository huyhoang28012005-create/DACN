import { useState } from "react";
import { Search, Check, X, CheckSquare } from "lucide-react";

const MOCK_REQUESTS = [
  { id: "REQ-001", user: "Nguyễn Văn A", mssv: "SV2021001", resource: "Lab AI & Máy học", time: "24/10/2023 • 09:00 - 11:30" },
  { id: "REQ-002", user: "Trần Thị B", mssv: "SV2021002", resource: "Oscilloscope Tektronix", time: "25/10/2023 • 14:00 - 16:00" },
  { id: "REQ-003", user: "Lê Văn C", mssv: "SV2021003", resource: "Hóa chất: Axit Sulfuric", time: "26/10/2023 • 08:00 - 10:00" },
];

export function Approvals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const removeReq = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-bold text-[#212121]">Duyệt yêu cầu</h1>
        <button className="flex items-center gap-2 bg-[#1E5FA5] hover:bg-[#154a85] text-white px-4 py-2.5 rounded-md font-medium transition-colors text-[14px]">
          <CheckSquare className="w-4 h-4" /> Duyệt tất cả
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F5] flex justify-between items-center">
          <div className="relative w-[320px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
            <input 
              type="text" 
              placeholder="Tìm theo người đăng ký hoặc tài nguyên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] focus:outline-none focus:border-[#1E5FA5]"
            />
          </div>
          <select className="px-4 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] text-[#212121] outline-none">
            <option>Trạng thái đơn: Chờ duyệt</option>
            <option>Trạng thái đơn: Đã duyệt</option>
            <option>Trạng thái đơn: Đã từ chối</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-white">
                <th className="px-4 py-4 w-12 text-center"><input type="checkbox" className="rounded text-[#1E5FA5] border-[#E0E0E0]" /></th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575]">Người đăng ký (Tên & MSSV)</th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575]">Tài nguyên (Thiết bị/Hóa chất)</th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575]">Thời gian yêu cầu</th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] text-center w-32">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F5F5F5] bg-white transition-colors">
                  <td className="px-4 py-4 text-center"><input type="checkbox" className="rounded text-[#1E5FA5] border-[#E0E0E0]" /></td>
                  <td className="px-4 py-4">
                    <div className="text-[14px] font-bold text-[#212121]">{req.user}</div>
                    <div className="text-[12px] text-[#757575]">{req.mssv}</div>
                  </td>
                  <td className="px-4 py-4 text-[14px] text-[#212121] font-medium">{req.resource}</td>
                  <td className="px-4 py-4 text-[14px] text-[#757575]">{req.time}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => removeReq(req.id)} className="p-1.5 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] rounded transition-colors" title="Phê duyệt">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeReq(req.id)} className="p-1.5 bg-[#FDEDED] text-[#C62828] hover:bg-[#FFCDD2] rounded transition-colors" title="Từ chối">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#757575]">Không còn đơn nào chờ duyệt.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
