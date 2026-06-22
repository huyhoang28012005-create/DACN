import { X } from 'lucide-react';

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
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/50">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[18px] font-bold text-[#212121] dark:text-slate-100">{title}</h3>
            <button
              onClick={onCancel}
              className="text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[14px] text-[#757575] dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="bg-[#FAFAFA]/50 dark:bg-slate-800/30 px-5 py-4 flex justify-end gap-3 border-t border-[#E0E0E0]/50 dark:border-slate-800/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 text-[14px] font-bold text-white rounded-md transition-all duration-300 shadow-sm hover:-translate-y-0.5 ${
              isDestructive
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
