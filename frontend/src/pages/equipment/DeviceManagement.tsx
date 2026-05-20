import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, AlertCircle, RefreshCw, Filter, ShieldAlert, CheckCircle2, AlertTriangle, FileText, FileClock } from "lucide-react";

// Component hóa StatusBadge chuẩn màu PDF
function StatusBadge({ status }: { status: string }) {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Khả dụng': return 'bg-[#E8F5E9] text-[#2E7D32]';
      case 'Đang dùng': return 'bg-[#D6E4F7] text-[#1E5FA5]';
      case 'Bảo trì': return 'bg-[#FFF3E0] text-[#E65100]';
      case 'Hỏng': return 'bg-[#FDEDED] text-[#C62828]';
      default: return 'bg-[#F5F5F5] text-[#757575]';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-[12px] font-medium ${getBadgeStyle(status)}`}>
      {status}
    </span>
  );
}

const INITIAL_DEVICES = [
  { id: "TB-001", name: "Oscilloscope Tektronix", category: "Đo lường", lab: "Lab IoT", total: 10, available: 8, status: "Khả dụng", expiry: "12/2025", incidents: 0 },
  { id: "TB-002", name: "3D Printer Creality", category: "Chế tạo", lab: "Xưởng in 3D", total: 2, available: 0, status: "Đang dùng", expiry: "06/2024", incidents: 0 },
  { id: "TB-003", name: "NVIDIA A100 Server", category: "Máy chủ", lab: "Lab AI", total: 1, available: 0, status: "Bảo trì", expiry: "01/2026", incidents: 1 },
  { id: "TB-004", name: "Máy hút ẩm công nghiệp", category: "Khác", lab: "Phòng Hóa sinh", total: 1, available: 0, status: "Hỏng", expiry: "Đã hết hạn", incidents: 2 },
];

export function DeviceManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Giả lập gọi API NestJS
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setIsLoading(true);
    setFetchError(null);
    setTimeout(() => {
      // 10% tỷ lệ lỗi
      if (Math.random() < 0.1) {
        setFetchError("Lỗi máy chủ (500). Không thể tải danh sách thiết bị.");
        setDevices([]);
      } else {
        setDevices(INITIAL_DEVICES);
      }
      setIsLoading(false);
    }, 1000);
  };

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Header + Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#212121]">Quản lý Thiết bị</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1E5FA5] hover:bg-[#154a85] text-white px-4 py-2 rounded-md font-medium transition-colors text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Thêm thiết bị mới
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatMini label="Tổng thiết bị" value="145" icon={<FileText className="w-5 h-5" />} color="text-[#1E5FA5]" />
          <StatMini label="Khả dụng" value="120" icon={<CheckCircle2 className="w-5 h-5" />} color="text-[#2E7D32]" />
          <StatMini label="Đang dùng" value="18" icon={<FileClock className="w-5 h-5" />} color="text-[#1E5FA5]" />
          <StatMini label="Bảo trì" value="5" icon={<AlertTriangle className="w-5 h-5" />} color="text-[#E65100]" />
          <StatMini label="Hỏng hóc" value="2" icon={<ShieldAlert className="w-5 h-5" />} color="text-[#C62828]" />
        </div>
      </div>

      {/* Error State */}
      {fetchError && (
        <div className="bg-[#FDEDED] border border-[#C62828] text-[#C62828] p-4 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-[14px] font-medium">{fetchError}</span>
          </div>
          <button onClick={fetchData} className="flex items-center gap-1 text-[13px] bg-white px-3 py-1.5 rounded border border-[#C62828] hover:bg-red-50">
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      )}

      {/* Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F5] flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input 
                type="text" 
                placeholder="Tìm tên hoặc mã thiết bị..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] focus:outline-none focus:border-[#1E5FA5]"
              />
            </div>
            <select className="px-3 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] text-[#212121] outline-none">
              <option>Tất cả phòng Lab</option>
              <option>Lab IoT</option>
              <option>Lab AI</option>
            </select>
            <select className="px-3 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] text-[#212121] outline-none">
              <option>Tất cả trạng thái</option>
              <option>Khả dụng</option>
              <option>Đang dùng</option>
            </select>
            <select className="px-3 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] text-[#212121] outline-none">
              <option>Danh mục</option>
              <option>Đo lường</option>
              <option>Chế tạo</option>
            </select>
          </div>
          <button onClick={fetchData} className="p-2 text-[#757575] hover:text-[#1E5FA5] hover:bg-white rounded border border-transparent hover:border-[#E0E0E0] transition-colors bg-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-white">
                <th className="px-4 py-3 w-12 text-center"><input type="checkbox" className="rounded text-[#1E5FA5]" /></th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575]">Tên thiết bị & Mã</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575]">Danh mục</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575]">Phòng Lab</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575] text-center">SL Khả dụng</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575]">Trạng thái</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575]">Bảo hành đến</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575] text-center">Sự cố mở</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-[#757575] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse bg-white">
                  <td className="px-4 py-4 text-center"><div className="w-4 h-4 bg-[#E0E0E0] rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-32 mb-1"></div><div className="h-3 bg-[#F5F5F5] rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-10 mx-auto"></div></td>
                  <td className="px-4 py-4"><div className="h-5 bg-[#E0E0E0] rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-8 mx-auto"></div></td>
                  <td className="px-4 py-4"><div className="h-6 bg-[#E0E0E0] rounded w-16 ml-auto"></div></td>
                </tr>
              ))}

              {!isLoading && filteredDevices.map((dev, i) => (
                <tr key={i} className="hover:bg-[#F5F5F5] bg-white transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded text-[#1E5FA5]" /></td>
                  <td className="px-4 py-3">
                    <div className="text-[14px] font-medium text-[#212121]">{dev.name}</div>
                    <div className="text-[12px] text-[#757575]">{dev.id}</div>
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[#212121]">{dev.category}</td>
                  <td className="px-4 py-3 text-[14px] text-[#212121]">{dev.lab}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-[#212121]">{dev.available}</span> <span className="text-[#757575]">/ {dev.total}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={dev.status} /></td>
                  <td className="px-4 py-3 text-[14px] text-[#212121]">{dev.expiry}</td>
                  <td className="px-4 py-3 text-center">
                    {dev.incidents > 0 ? (
                      <span className="inline-flex w-5 h-5 items-center justify-center bg-[#FDEDED] text-[#C62828] rounded-full text-[12px] font-bold">
                        {dev.incidents}
                      </span>
                    ) : (
                      <span className="text-[#757575] text-[14px]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-[#757575] hover:text-[#1E5FA5] hover:bg-[#D6E4F7] rounded" title="Sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[#757575] hover:text-[#C62828] hover:bg-[#FDEDED] rounded" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredDevices.length === 0 && !fetchError && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#757575] bg-[#F5F5F5]">
                    Không tìm thấy thiết bị nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm flex items-center justify-between">
      <div>
        <div className="text-[12px] text-[#757575] font-medium mb-1">{label}</div>
        <div className={`text-[20px] font-bold text-[#212121]`}>{value}</div>
      </div>
      <div className={`p-2 rounded-md bg-[#F5F5F5] ${color}`}>
        {icon}
      </div>
    </div>
  );
}
