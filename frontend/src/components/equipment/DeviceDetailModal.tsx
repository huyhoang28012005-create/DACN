import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CommentSection } from "../common/CommentSection";
import { StatusBadge } from "./StatusBadge";

interface DeviceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDevice: any;
  currentUser: any;
}

export function DeviceDetailModal({ isOpen, onClose, selectedDevice, currentUser }: DeviceDetailModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !selectedDevice) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-[20px] font-bold text-[#212121] dark:text-slate-100">{t("device_details")} #{selectedDevice.id}</h2>
            <p className="text-[14px] text-[#757575] dark:text-slate-400 mt-1">{selectedDevice.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#757575] dark:text-slate-400 hover:text-[#212121] dark:text-slate-100 p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[13px] text-[#757575] dark:text-slate-400">{t("serial_num_label")}</span>
                <p className="text-[14px] font-medium text-[#212121] dark:text-slate-100 font-mono">{selectedDevice.serial_number}</p>
              </div>
              <div>
                <span className="text-[13px] text-[#757575] dark:text-slate-400">{t("status_label")}</span>
                <div><StatusBadge status={selectedDevice.status} /></div>
              </div>
              <div>
                <span className="text-[13px] text-[#757575] dark:text-slate-400">{t("lab_room_label")}</span>
                <p className="text-[14px] font-medium text-[#212121] dark:text-slate-100">{selectedDevice.room?.name || t("no_room_assigned")}</p>
              </div>
              <div>
                <span className="text-[13px] text-[#757575] dark:text-slate-400">{t("date_added_label")}</span>
                <p className="text-[14px] font-medium text-[#212121] dark:text-slate-100">{selectedDevice.created_at ? format(new Date(selectedDevice.created_at), "dd/MM/yyyy") : ''}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] dark:border-slate-800 pt-6">
            <CommentSection
              entityType="equipment"
              entityId={selectedDevice.id}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
