import { useState, useEffect } from 'react';
import { X, Activity, AlertTriangle, MonitorSmartphone, Clock, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { userService } from '../../services';
import toast from 'react-hot-toast';

interface UserActivityModalProps {
  userId: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserActivityModal({ userId, userName, isOpen, onClose }: UserActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'booking'>('login');

  useEffect(() => {
    if (isOpen) {
      fetchActivity();
    }
  }, [isOpen, userId]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await userService.getActivity(userId);
      setActivity(res.data);
    } catch (error) {
      toast.error('Không thể tải lịch sử hoạt động');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E0E0E0] dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-[#212121] dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Nhật ký hoạt động
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Người dùng: <span className="font-semibold text-slate-700 dark:text-slate-200">{userName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#757575] hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        {activity && (
          <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-[#E0E0E0] dark:border-slate-800">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng lượt mượn/đặt phòng</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activity.stats.totalBookings}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vi phạm (No-show)</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activity.stats.noShowCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-4 border-b border-[#E0E0E0] dark:border-slate-800">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Lịch sử đăng nhập
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'booking'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Lịch sử mượn phòng
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/30 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !activity ? (
            <div className="text-center py-12 text-slate-500">Chưa có dữ liệu</div>
          ) : activeTab === 'login' ? (
            <div className="space-y-3">
              {activity.loginHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Không có lịch sử đăng nhập.</div>
              ) : (
                activity.loginHistory.map((log: any) => (
                  <div key={log.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[#E0E0E0] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.status.includes('Thành công') ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {log.status.includes('Thành công') ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{log.status}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleString('vi-VN')}</span>
                          <span className="flex items-center gap-1"><MonitorSmartphone className="w-3 h-3" /> {log.device}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">IP: {log.ip_address}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {activity.bookings.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Không có lịch sử mượn phòng.</div>
              ) : (
                activity.bookings.map((booking: any) => (
                  <div key={booking.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[#E0E0E0] dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Phòng: {booking.room?.name || 'Không xác định'}</p>
                      <p className="text-xs text-slate-500 mt-1">Mục đích: {booking.purpose}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Từ: {new Date(booking.start_time).toLocaleString('vi-VN')}</span>
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Đến: {new Date(booking.end_time).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-end gap-2 justify-between">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'NO_SHOW' ? 'bg-red-100 text-red-700' :
                        booking.status === 'CANCELLED' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
