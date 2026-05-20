import { useState } from "react";
import { Search, Edit2, Plus } from "lucide-react";

const MOCK_USERS = [
  { id: "SV2021001", name: "Nguyễn Văn A", email: "student@vju.ac.vn", role: "Sinh viên", active: true },
  { id: "GV1002", name: "TS. Trần Lê B", email: "lecturer@vju.ac.vn", role: "Giảng viên", active: true },
  { id: "SV2021044", name: "Lý Thị C", email: "sv.lythic@vju.ac.vn", role: "Sinh viên", active: false },
  { id: "AD001", name: "Admin System", email: "admin@vju.ac.vn", role: "Quản trị viên", active: true },
];

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(MOCK_USERS);

  const toggleActive = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-bold text-[#212121]">Quản lý người dùng</h1>
        <button className="flex items-center gap-2 bg-[#1E5FA5] hover:bg-[#154a85] text-white px-4 py-2.5 rounded-md font-medium transition-colors text-[14px]">
          <Plus className="w-4 h-4" /> Thêm tài khoản mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F5] flex justify-between items-center">
          <div className="relative w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, email, MSSV..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] focus:outline-none focus:border-[#1E5FA5]"
            />
          </div>
          <select className="px-4 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] text-[#212121] outline-none">
            <option>Vai trò (Tất cả)</option>
            <option>Sinh viên</option>
            <option>Giảng viên</option>
            <option>Quản trị viên</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-white">
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Họ tên</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">MSSV/ID</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Email</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Vai trò</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F5F5F5] bg-white transition-colors">
                  <td className="px-6 py-4 text-[14px] font-bold text-[#212121]">{u.name}</td>
                  <td className="px-6 py-4 text-[14px] text-[#757575] font-mono">{u.id}</td>
                  <td className="px-6 py-4 text-[14px] text-[#212121]">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[#F5F5F5] rounded text-[12px] font-medium text-[#757575]">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => toggleActive(u.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.active ? 'bg-[#1E5FA5]' : 'bg-[#E0E0E0]'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${u.active ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-[#757575] hover:text-[#1E5FA5] hover:bg-[#D6E4F7] rounded transition-colors" title="Chỉnh sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>
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
