import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Hourglass, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isResourceMode: boolean;
  activeTab: 'SPACE' | 'RESOURCE';
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  rooms: any[];
  equipments: any[];
  courses: any[];
  isInstructorOrAdmin: boolean;
  chemicals: any[];
  chemicalUsages: any[];
  setChemicalUsages: (data: any[]) => void;
  isWaitlist: boolean;
  setIsWaitlist: (val: boolean) => void;
  hasOverlapCurrentSelection: boolean;
  hasUserOverlap: boolean;
  overlappingUserBookings: any[];
  hasConflictError: boolean;
  setHasConflictError: (val: boolean) => void;
  suggestedSlots: any[];
  setSuggestedSlots: (data: any[]) => void;
}

export function BookingFormModal({
  isOpen,
  onClose,
  onSubmit,
  isResourceMode,
  activeTab,
  formData,
  setFormData,
  isSubmitting,
  rooms,
  equipments,
  courses,
  isInstructorOrAdmin,
  chemicals,
  chemicalUsages,
  setChemicalUsages,
  isWaitlist,
  setIsWaitlist,
  hasOverlapCurrentSelection,
  hasUserOverlap,
  overlappingUserBookings,
  hasConflictError,
  setHasConflictError,
  suggestedSlots,
  setSuggestedSlots,
}: BookingFormModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/50 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 flex justify-between items-center bg-[#FAFAFA]/50 dark:bg-slate-800/30 flex-shrink-0">
          <h3 className="font-bold text-[#212121] dark:text-slate-100 text-[16px]">
            {isResourceMode ? 'Mượn Dụng Cụ Học Tập' : t('book_schedule')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#757575] dark:text-slate-400 hover:bg-[#E0E0E0] dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                Mục đích sử dụng <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder={t('ex_purpose')}
                className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1E5FA5] dark:focus:ring-blue-500/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                {activeTab === 'SPACE' ? 'Chọn phòng Lab' : 'Nơi sử dụng (Phòng Lab)'} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.room_id}
                onChange={(e) =>
                  setFormData({ ...formData, room_id: e.target.value, equipment_id: '' })
                }
                className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1E5FA5] dark:focus:ring-blue-500/50"
                disabled={isSubmitting}
              >
                <option value="">{t('select_room')}</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({t('capacity')}: {r.capacity})
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'RESOURCE' && formData.room_id &&
              equipments.filter((eq) => eq.room_id.toString() === formData.room_id).length >
              0 && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                    Thiết bị đi kèm (Tùy chọn)
                  </label>
                  <select
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1E5FA5] dark:focus:ring-blue-500/50"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Không chọn thiết bị --</option>
                    {equipments
                      .filter((eq) => eq.room_id.toString() === formData.room_id)
                      .map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name} - S/N: {eq.serial_number}
                        </option>
                      ))}
                  </select>
                </div>
              )}

            {activeTab === 'SPACE' && isInstructorOrAdmin && courses.length > 0 && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                  {t('course_instructor_only', 'Học phần (Dành cho Giảng viên)')}
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1E5FA5] dark:focus:ring-blue-500/50"
                  disabled={isSubmitting}
                >
                  <option value="">-- {t('no_course_attached', 'Không gắn vào học phần')} --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'RESOURCE' && (
              <div className="animate-in slide-in-from-top-2 duration-300 border border-[#E0E0E0] dark:border-slate-800 rounded-md p-3 bg-[#FAFAFA] dark:bg-slate-800/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-medium text-[#757575] dark:text-slate-400">
                    Hóa chất tiêu hao (Tùy chọn)
                  </label>
                  <button
                    type="button"
                    onClick={() => setChemicalUsages([...chemicalUsages, { chemical_id: chemicals[0]?.id || 0, quantity: 1 }])}
                    className="text-[12px] font-bold text-[#1E5FA5] dark:text-blue-400 hover:text-blue-700 transition-colors"
                    disabled={chemicals.length === 0}
                  >
                    + Thêm
                  </button>
                </div>

                {chemicalUsages.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {chemicalUsages.map((usage: { chemical_id: number; quantity: number }, index: number) => {
                      const selectedChem = chemicals.find(c => c.id === usage.chemical_id);
                      return (
                        <div key={index} className="flex gap-2 items-start">
                          <select
                            value={usage.chemical_id}
                            onChange={(e) => {
                              const newArr = [...chemicalUsages];
                              newArr[index].chemical_id = Number(e.target.value);
                              setChemicalUsages(newArr);
                            }}
                            className="flex-1 px-2 py-1.5 border border-[#E0E0E0] dark:border-slate-700 rounded text-[13px] focus:outline-none focus:border-[#1E5FA5] dark:bg-slate-900"
                          >
                            {chemicals.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} (Còn {c.quantity_stock} {c.unit})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            max={selectedChem?.quantity_stock || 100}
                            value={usage.quantity}
                            onChange={(e) => {
                              const newArr = [...chemicalUsages];
                              newArr[index].quantity = Number(e.target.value);
                              setChemicalUsages(newArr);
                            }}
                            className="w-20 px-2 py-1.5 border border-[#E0E0E0] dark:border-slate-700 rounded text-[13px] focus:outline-none focus:border-[#1E5FA5] dark:bg-slate-900"
                            title="Số lượng"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newArr = [...chemicalUsages];
                              newArr.splice(index, 1);
                              setChemicalUsages(newArr);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded mt-0.5"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500"
                  disabled={isSubmitting}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                  Giờ bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">
                Thời lượng (Giờ) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#1E5FA5] dark:focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="1">{t('hour_1')}</option>
                <option value="2">{t('hour_2')}</option>
                <option value="3">{t('hour_3')}</option>
                <option value="4">{t('hour_4')}</option>
                <option value="5">{t('hour_5')}</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isWaitlist}
                  onChange={(e) => setIsWaitlist(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E0E0E0] dark:border-slate-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-[13px] font-medium text-[#212121] dark:text-slate-300 group-hover:text-amber-500 transition-colors">
                  {isResourceMode
                    ? 'Tham gia Danh sách chờ (nếu dụng cụ hoặc phòng bị trùng)'
                    : t('join_waitlist_checkbox')}
                </span>
              </label>
            </div>

            {hasOverlapCurrentSelection && !isWaitlist && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg animate-shake">
                <div className="text-[12px] font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Khung giờ bạn chọn đã bị trùng lặp với người khác. Vui lòng chọn giờ khác hoặc tick chọn "Tham gia Danh sách chờ".
                </div>
              </div>
            )}

            {hasUserOverlap && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg animate-shake mt-2">
                <div className="text-[12px] font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 shrink-0" /> 
                  <span>
                    🚫 <strong>Trùng lịch cá nhân:</strong> Bạn đã có lịch sử dụng {rooms.find(r => r.id === overlappingUserBookings[0]?.room_id)?.name || 'phòng khác'} vào khung giờ {format(new Date(overlappingUserBookings[0]?.start_time || new Date()), 'HH:mm')} - {format(new Date(overlappingUserBookings[0]?.end_time || new Date()), 'HH:mm')}. Bạn không thể đặt 2 phòng trong cùng một thời điểm!
                  </span>
                </div>
              </div>
            )}

            {hasConflictError && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg space-y-2 animate-shake shadow-md shadow-amber-500/10">
                <div className="text-[12px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Hourglass className="w-4 h-4" />
                  Không gian bị trùng lịch. Gợi ý 5 khung giờ trống (Sliding Window):
                </div>
                {suggestedSlots.length === 0 ? (
                  <div className="text-[11px] text-[#757575] dark:text-slate-400 italic">
                    Không có khung giờ nào trống trong 3 ngày tới.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {suggestedSlots.map((slot, sIdx) => {
                      const sDate = new Date(slot.start_time);
                      const eDate = new Date(slot.end_time);
                      const dateLabel = format(sDate, 'dd/MM');
                      const timeLabel = `${format(sDate, 'HH:mm')} - ${format(eDate, 'HH:mm')}`;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              date: format(sDate, 'yyyy-MM-dd'),
                              startTime: format(sDate, 'HH:mm'),
                            });
                            setHasConflictError(false);
                            setSuggestedSlots([]);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-[#1E5FA5] dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors flex items-center justify-between"
                        >
                          <span>
                            📅 {dateLabel} | ⏰ {timeLabel}
                          </span>
                          <span className="text-[10px] text-blue-500 font-medium">Chọn</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="pt-4 flex justify-end gap-3 border-t border-[#E0E0E0] dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-[14px] font-bold text-white rounded-md transition-all duration-300 flex items-center gap-2 shadow-sm ${
                  (isSubmitting || (hasOverlapCurrentSelection && !isWaitlist) || hasUserOverlap) ? 'opacity-50 cursor-not-allowed bg-neutral-400 dark:bg-slate-700' 
                  : isWaitlist ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                }`}
                disabled={isSubmitting || (hasOverlapCurrentSelection && !isWaitlist) || hasUserOverlap}
              >
                {isSubmitting && <LoadingSpinner size={16} className="p-0 text-white" />}
                {isSubmitting
                  ? t('processing')
                  : isWaitlist
                    ? t('btn_join_waitlist')
                    : t('confirm_booking')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
