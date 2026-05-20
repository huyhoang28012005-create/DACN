import { useState } from "react";
import { Plus, Search, QrCode, X, Image as ImageIcon } from "lucide-react";

const DEVICES = [
  { id: "TB-001", name: "Oscilloscope Tektronix", location: "Lab IoT", status: "Sẵn sàng" },
  { id: "TB-002", name: "3D Printer Creality", location: "Xưởng in 3D", status: "Sẵn sàng" },
  { id: "TB-003", name: "NVIDIA A100 Server", location: "Lab AI", status: "Bảo trì" },
  { id: "TB-004", name: "Kính hiển vi điện tử", location: "Phòng Hóa Sinh", status: "Sẵn sàng" },
];

export function ResourceManagement() {
  const [activeTab, setActiveTab] = useState("Thiết bị");
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    return status === "Sẵn sàng" 
      ? <span className="px-2 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded text-[12px] font-medium border border-[#C8E6C9]">Sẵn sàng</span>
      : <span className="px-2 py-1 bg-[#FFF8E1] text-[#F59E0B] rounded text-[12px] font-medium border border-[#FFECB3]">Bảo trì</span>;
  };

  return (
    <div className="h-full flex overflow-hidden max-w-[1400px] mx-auto animate-in fade-in duration-300 gap-6">
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[24px] font-bold text-[#212121] mb-4">Quản lý Tài nguyên</h1>
            {/* Tabs */}
            <div className="flex border-b border-[#E0E0E0]">
              {['Phòng Lab', 'Thiết bị', 'Hóa chất'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-[14px] font-medium border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-[#1E5FA5] text-[#1E5FA5]' 
                      : 'border-transparent text-[#757575] hover:text-[#212121]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#1E5FA5] hover:bg-[#154a85] text-white px-4 py-2.5 rounded-md font-medium transition-colors text-[14px] mb-2">
            <Plus className="w-4 h-4" /> Thêm {activeTab.toLowerCase()}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F5]">
             <div className="relative w-[300px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-[14px] focus:outline-none focus:border-[#1E5FA5]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0E0E0] bg-white sticky top-0">
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Mã TB</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Tên thiết bị</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Vị trí phòng</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575]">Trạng thái</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] text-center">Mã QR</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {DEVICES.map((d) => (
                  <tr 
                    key={d.id} 
                    onClick={() => setSelectedDevice(d)}
                    className={`transition-colors cursor-pointer ${selectedDevice?.id === d.id ? 'bg-[#D6E4F7]/30' : 'hover:bg-[#F5F5F5] bg-white'}`}
                  >
                    <td className="px-6 py-4 text-[14px] font-mono text-[#757575]">{d.id}</td>
                    <td className="px-6 py-4 text-[14px] font-bold text-[#212121]">{d.name}</td>
                    <td className="px-6 py-4 text-[14px] text-[#212121]">{d.location}</td>
                    <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-[#1E5FA5] hover:bg-[#D6E4F7] rounded transition-colors inline-block" onClick={(e) => {e.stopPropagation(); setSelectedDevice(d)}}>
                        <QrCode className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-[13px] text-[#1E5FA5] font-medium hover:underline">Chi tiết</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selectedDevice && (
        <div className="w-[360px] bg-white rounded-xl shadow-sm border border-[#E0E0E0] flex-shrink-0 flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="p-4 border-b border-[#E0E0E0] flex justify-between items-center bg-[#FAFAFA] rounded-t-xl">
            <h3 className="font-bold text-[#212121]">Chi tiết thiết bị</h3>
            <button onClick={() => setSelectedDevice(null)} className="p-1.5 text-[#757575] hover:bg-[#E0E0E0] rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Image Placeholder */}
            <div className="w-full h-40 bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg flex items-center justify-center flex-col text-[#9E9E9E]">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span className="text-[12px]">Image Placeholder</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[12px] text-[#757575] uppercase font-bold tracking-wider mb-1">Tên thiết bị</div>
                <div className="text-[16px] font-bold text-[#212121]">{selectedDevice.name}</div>
                <div className="text-[14px] text-[#757575] font-mono mt-1">{selectedDevice.id}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-b border-[#E0E0E0] py-4">
                <div>
                  <div className="text-[12px] text-[#757575] mb-1">Vị trí</div>
                  <div className="text-[14px] font-medium text-[#212121]">{selectedDevice.location}</div>
                </div>
                <div>
                  <div className="text-[12px] text-[#757575] mb-1">Trạng thái</div>
                  {getStatusBadge(selectedDevice.status)}
                </div>
              </div>

              <div>
                <div className="text-[12px] text-[#757575] uppercase font-bold tracking-wider mb-3">Mã QR Quản lý</div>
                <div className="w-32 h-32 bg-white border-2 border-[#212121] p-2 mx-auto rounded flex items-center justify-center relative overflow-hidden">
                  {/* Mock QR pattern */}
                  <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-1">
                    {Array.from({length: 16}).map((_, i) => (
                      <div key={i} className={`bg-[#212121] ${i % 3 === 0 ? 'opacity-0' : ''} ${i===0 || i===3 || i===12 ? 'col-span-2 row-span-2' : ''}`}></div>
                    ))}
                  </div>
                </div>
                <p className="text-center text-[12px] text-[#757575] mt-2">Quét để báo cáo sự cố hoặc đặt lịch</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#E0E0E0] bg-[#FAFAFA] rounded-b-xl flex gap-3">
             <button className="flex-1 border border-[#E0E0E0] bg-white hover:bg-[#F5F5F5] text-[#212121] font-medium py-2 rounded text-[14px] transition-colors">Sửa</button>
             <button className="flex-1 bg-[#1E5FA5] hover:bg-[#154a85] text-white font-medium py-2 rounded text-[14px] transition-colors">In mã QR</button>
          </div>
        </div>
      )}
    </div>
  );
}
