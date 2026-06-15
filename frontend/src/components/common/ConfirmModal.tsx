import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl dark:shadow-slate-900/50 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[18px] font-bold text-[#212121] dark:text-slate-100">{title}</h3>
            <button onClick={onCancel} className="text-[#757575] dark:text-slate-400 hover:text-[#212121] dark:text-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[14px] text-[#757575] dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="bg-[#F5F5F5] dark:bg-slate-800/50 px-5 py-3 flex justify-end gap-3 border-t border-[#E0E0E0] dark:border-slate-800">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#E0E0E0] dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }} 
            className={`px-4 py-2 text-[14px] font-medium text-white rounded-md transition-colors shadow-sm dark:shadow-slate-900/50 ${
              isDestructive ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-[#1E5FA5] dark:bg-blue-600 hover:bg-[#154a85] dark:hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
