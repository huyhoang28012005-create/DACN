import { useTranslation } from "react-i18next";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newDevice: { name: string; serial_number: string; room_id: number; status: string };
  setNewDevice: (device: any) => void;
  rooms: any[];
}

export function AddDeviceModal({ isOpen, onClose, onSubmit, newDevice, setNewDevice, rooms }: AddDeviceModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-md p-6 border border-white/20 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
        <h2 className="text-[20px] font-bold text-[#212121] dark:text-slate-100 mb-4">{t("add_new_device")}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("device_name")}</label>
            <input required type="text" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("serial_number_label")}</label>
            <input required type="text" value={newDevice.serial_number} onChange={e => setNewDevice({...newDevice, serial_number: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("lab_room")}</label>
            <select value={newDevice.room_id} onChange={e => setNewDevice({...newDevice, room_id: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
              <option value={0}>{t("no_room_assigned_option")}</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded-lg transition-colors">{t("cancel")}</button>
            <button type="submit" className="px-4 py-2 text-[14px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">{t("save_device")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
