import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  RefreshCw,
  X,
  Check,
  XCircle,
  CheckSquare,
  CalendarX,
  CheckCircle,
  Clock,
  FileCheck,
} from 'lucide-react';
import { bookingService } from '../../services';
import { format } from 'date-fns';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatMini } from '../../components/ui/StatMini';
import { IBooking } from '../../types/models';
import { BookingStatus } from '../../constants/roles';

export function Approvals() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [requestType, setRequestType] = useState<'ALL' | 'SCHEDULE' | 'EQUIPMENT'>('ALL');
  const [requests, setRequests] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'APPROVE_ALL' | 'APPROVE_SELECTED' | 'REJECT' | 'REJECT_SELECTED';
    id?: number;
  }>({ isOpen: false, type: 'APPROVE_ALL' });
  const [rejectReason, setRejectReason] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [statusFilter, requestType, searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getAll();
      setRequests(res.data || []);
    } catch (error: unknown) {
      const err = error as any;
      const msg = err.response?.data?.message || t('load_approvals_error');
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, reason?: string) => {
    try {
      await bookingService.update(id.toString(), { status, rejection_reason: reason });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as BookingStatus, rejection_reason: reason } : r)));
      toast.success(t('status_update_success'));
    } catch (error: unknown) {
      const err = error as any;
      const msg = err.response?.data?.message || t('status_update_error');
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleApproveAll = () => {
    const pendingReqs = requests.filter((r) => r.status === 'PENDING');
    if (pendingReqs.length === 0) {
      toast.error(t('no_pending_requests'));
      return;
    }
    setConfirmState({ isOpen: true, type: 'APPROVE_ALL' });
  };

  const executeConfirmAction = async () => {
    if (confirmState.type === 'APPROVE_ALL') {
      const pendingReqs = requests.filter((r) => r.status === 'PENDING');
      try {
        await Promise.all(
          pendingReqs.map((r) => bookingService.update(r.id.toString(), { status: 'APPROVED' }))
        );
        toast.success(`${t('approved_n_requests')} ${pendingReqs.length}`);
        fetchData();
      } catch (error: unknown) {
        const err = error as any;
        const msg = err.response?.data?.message || t('approve_all_error');
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    } else if (confirmState.type === 'APPROVE_SELECTED') {
      try {
        await Promise.all(
          selectedIds.map((id) => bookingService.update(id.toString(), { status: 'APPROVED' }))
        );
        toast.success(`Đã duyệt ${selectedIds.length} đơn`);
        setSelectedIds([]);
        fetchData();
      } catch (error: unknown) {
        toast.error('Có lỗi xảy ra khi duyệt các đơn đã chọn');
      }
    } else if (confirmState.type === 'REJECT') {
      if (confirmState.id) {
        handleUpdateStatus(confirmState.id, 'REJECTED', rejectReason);
      }
      setRejectReason('');
    } else if (confirmState.type === 'REJECT_SELECTED') {
      try {
        await Promise.all(
          selectedIds.map((id) => bookingService.update(id.toString(), { status: 'REJECTED', rejection_reason: rejectReason }))
        );
        toast.success(`Đã từ chối ${selectedIds.length} đơn`);
        setSelectedIds([]);
        fetchData();
      } catch (error: unknown) {
        toast.error('Có lỗi xảy ra khi từ chối các đơn đã chọn');
      }
      setRejectReason('');
    }
    setConfirmState({ ...confirmState, isOpen: false });
  };


  const typedRequests = useMemo(() => {
    return requests.filter(r => {
      const isEquipmentReq = r.equipment_id || (r.chemical_usages && r.chemical_usages.length > 0);
      if (requestType === 'ALL') return true;
      if (requestType === 'SCHEDULE') return !isEquipmentReq;
      if (requestType === 'EQUIPMENT') return !!isEquipmentReq;
      return true;
    });
  }, [requests, requestType]);

  const stats = useMemo(
    () => ({
      total: typedRequests.length,
      pending: typedRequests.filter((r) => r.status === 'PENDING').length,
      approved: typedRequests.filter((r) => r.status === 'APPROVED').length,
      rejected: typedRequests.filter((r) => r.status === 'REJECTED').length,
    }),
    [typedRequests]
  );

  const filteredRequests = typedRequests.filter((r) => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchSearch =
      (r.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingFilteredIds = filteredRequests.filter(r => r.status === 'PENDING').map(r => r.id);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(pendingFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };


  return (
    <div className="max-w-[1200px] w-full mx-auto animate-in fade-in duration-300 h-full flex flex-col space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-[24px] font-bold text-[#212121] dark:text-slate-100">
            {t('approve_requests')}
          </h1>
          {selectedIds.length > 0 ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmState({ isOpen: true, type: 'APPROVE_SELECTED' })}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 text-[14px] hover:-translate-y-0.5"
              >
                <Check className="w-4 h-4" /> {t('approve_n_requests_btn', { count: selectedIds.length })}
              </button>
              <button
                onClick={() => setConfirmState({ isOpen: true, type: 'REJECT_SELECTED' })}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 text-[14px] hover:-translate-y-0.5"
              >
                <X className="w-4 h-4" /> {t('reject_n_requests_btn', { count: selectedIds.length })}
              </button>
            </div>
          ) : (
            <button
              onClick={handleApproveAll}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-[14px] hover:-translate-y-0.5"
            >
              <CheckSquare className="w-4 h-4" /> {t('approve_all')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E0E0E0] dark:border-slate-800">
          <button
            onClick={() => setRequestType('ALL')}
            className={`px-6 py-3 font-bold text-[14px] border-b-2 transition-colors ${
              requestType === 'ALL'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-[#757575] hover:text-[#212121] dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('all_requests')}
          </button>
          <button
            onClick={() => setRequestType('SCHEDULE')}
            className={`px-6 py-3 font-bold text-[14px] border-b-2 transition-colors ${
              requestType === 'SCHEDULE'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-[#757575] hover:text-[#212121] dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('approve_schedule_lab')}
          </button>
          <button
            onClick={() => setRequestType('EQUIPMENT')}
            className={`px-6 py-3 font-bold text-[14px] border-b-2 transition-colors ${
              requestType === 'EQUIPMENT'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-[#757575] hover:text-[#212121] dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('approve_equipment_chemicals')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatMini
            label={t('total_requests', 'Tổng đơn')}
            value={stats.total}
            icon={<FileCheck className="w-5 h-5" />}
            color="text-blue-600"
            bgColor="bg-blue-600"
          />
          <StatMini
            label={t('status_filter_pending', 'Chờ duyệt')}
            value={stats.pending}
            icon={<Clock className="w-5 h-5" />}
            color="text-orange-500"
            bgColor="bg-orange-500"
          />
          <StatMini
            label={t('status_filter_approved', 'Đã duyệt')}
            value={stats.approved}
            icon={<CheckCircle className="w-5 h-5" />}
            color="text-emerald-600"
            bgColor="bg-emerald-600"
          />
          <StatMini
            label={t('status_filter_rejected', 'Từ chối')}
            value={stats.rejected}
            icon={<XCircle className="w-5 h-5" />}
            color="text-red-600"
            bgColor="bg-red-600"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between items-center flex-wrap gap-4">
          <div className="relative w-[320px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] dark:text-slate-400" />
            <input
              type="text"
              placeholder={t('search_request_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={fetchData}
              className="p-2 text-[#757575] dark:text-slate-400 hover:text-[#1E5FA5] dark:text-blue-400 hover:bg-white dark:bg-slate-900 rounded border border-transparent hover:border-[#E0E0E0] dark:border-slate-800 transition-colors bg-white dark:bg-slate-900"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] text-[#212121] dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">{t('all_statuses')}</option>
              <option value="PENDING">{t('status_filter_pending')}</option>
              <option value="APPROVED">{t('status_filter_approved')}</option>
              <option value="REJECTED">{t('status_filter_rejected')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm sticky top-0 z-10">
                <th className="px-4 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    disabled={pendingFilteredIds.length === 0}
                    checked={pendingFilteredIds.length > 0 && selectedIds.length === pendingFilteredIds.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#1E5FA5] dark:text-blue-400 border-[#E0E0E0] dark:border-slate-800 disabled:opacity-50 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">
                  {t('requester')}
                </th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">
                  {t('room_device')}
                </th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">
                  {t('purpose')}
                </th>
                <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400">
                  {t('request_time')}
                </th>
                {['PENDING', 'ALL'].includes(statusFilter) && (
                  <th className="px-4 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-center w-32">
                    {t('action')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <LoadingSpinner text={t('loading_requests')} />
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 bg-white dark:bg-slate-900 transition-colors"
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        disabled={req.status !== 'PENDING'}
                        checked={selectedIds.includes(req.id)}
                        onChange={() => handleSelectOne(req.id)}
                        className="rounded text-[#1E5FA5] dark:text-blue-400 border-[#E0E0E0] dark:border-slate-800 disabled:opacity-30 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[14px] font-bold text-[#212121] dark:text-slate-100">
                        {req.user?.name}
                      </div>
                      <div className="text-[12px] text-[#757575] dark:text-slate-400">
                        {req.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[14px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#212121] dark:text-slate-100 font-medium">
                          {req.room?.name || t('no_room')}
                        </span>
                        {req.equipment_id || (req.chemical_usages && req.chemical_usages.length > 0) ? (
                          <span className="w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">{t('borrow_equipment_tag')}</span>
                        ) : (
                          <span className="w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{t('book_space_tag')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[14px] text-[#212121] dark:text-slate-100">
                      {req.purpose}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[14px] text-[#212121] dark:text-slate-100 font-medium">
                        {format(new Date(req.start_time), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-[12px] text-[#757575] dark:text-slate-400">
                        {format(new Date(req.start_time), 'HH:mm')} -{' '}
                        {format(new Date(req.end_time), 'HH:mm')}
                      </div>
                    </td>
                    {['PENDING', 'ALL'].includes(statusFilter) && (
                      <td className="px-4 py-4 text-center">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="p-1.5 bg-[#E8F5E9] dark:bg-green-900/30 text-[#2E7D32] hover:bg-[#C8E6C9] rounded transition-colors"
                              title={t('approve')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmState({ isOpen: true, type: 'REJECT', id: req.id })
                              }
                              className="p-1.5 bg-[#FDEDED] dark:bg-red-900/30 text-[#C62828] hover:bg-[#FFCDD2] rounded transition-colors"
                              title={t('reject')}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[12px] font-medium text-[#757575] dark:text-slate-500">
                            {req.status === 'APPROVED' ? t('status_filter_approved') : t('status_filter_rejected')}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
              {!isLoading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#757575] dark:text-slate-400">
                    <CalendarX className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                    <p>{t('no_booking_requests')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen && confirmState.type === 'APPROVE_ALL'}
        title={t('approve_all')}
        message={t('approve_all_confirm')}
        confirmText={t('approve_all')}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
      />

      {/* Custom Reject Modal */}
      {confirmState.isOpen && confirmState.type === 'REJECT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/50">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[18px] font-bold text-[#212121] dark:text-slate-100">{t('reject_request')}</h3>
                <button
                  onClick={() => {
                    setConfirmState({ ...confirmState, isOpen: false });
                    setRejectReason('');
                  }}
                  className="text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[14px] text-[#757575] dark:text-slate-400 mb-4">
                {t('reject_request_confirm')}
              </p>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                  Lý do từ chối (Gửi cho người đăng ký) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thiết bị này đang bảo trì..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="bg-[#FAFAFA]/50 dark:bg-slate-800/30 px-5 py-4 flex justify-end gap-3 border-t border-[#E0E0E0]/50 dark:border-slate-800/50">
              <button
                onClick={() => {
                  setConfirmState({ ...confirmState, isOpen: false });
                  setRejectReason('');
                }}
                className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 rounded-md transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                     toast.error('Vui lòng nhập lý do từ chối');
                     return;
                  }
                  executeConfirmAction();
                }}
                className="px-4 py-2 text-[14px] font-bold text-white rounded-md transition-all duration-300 shadow-sm hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20"
              >
                {t('reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
