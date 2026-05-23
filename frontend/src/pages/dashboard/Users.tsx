import { useState, useEffect } from "react";
import { Search, Edit2, Plus } from "lucide-react";
import { userService } from "../../services";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async () => {
    // Demo implementation since we don't have an isActive field easily togglable
    toast.error("Tính năng khóa tài khoản đang được phát triển");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'TECHNICIAN': return 'Kỹ thuật viên';
      case 'LECTURER': return 'Giảng viên';
      case 'STUDENT': return 'Sinh viên';
      default: return role;
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Tìm theo tên, email..." 
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-white">
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Họ tên</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">ID Hệ thống</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Email</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Vai trò</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <LoadingSpinner text="Đang tải danh sách người dùng..." />
                  </td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F5F5F5] bg-white transition-colors">
                  <td className="px-6 py-4 text-[14px] font-bold text-[#212121]">{u.name}</td>
                  <td className="px-6 py-4 text-[14px] text-[#757575] font-mono">{u.id}</td>
                  <td className="px-6 py-4 text-[14px] text-[#212121]">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[#F5F5F5] rounded text-[12px] font-medium text-[#757575]">{getRoleLabel(u.role)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleActive()}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-[#1E5FA5]`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform translate-x-4`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => toast.error("Tính năng đang phát triển")} className="p-1.5 text-[#757575] hover:text-[#1E5FA5] hover:bg-[#D6E4F7] rounded transition-colors" title="Chỉnh sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#757575]">Không tìm thấy người dùng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
