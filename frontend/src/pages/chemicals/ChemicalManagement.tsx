import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Beaker, ClipboardList, X } from "lucide-react";
import { chemicalService } from "../../services";
import { ConfirmModal } from "../../components/common/ConfirmModal";

import { toast } from "react-hot-toast";

export function ChemicalManagement() {
  const { t } = useTranslation();

  const [chemicals, setChemicals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ id: 0, name: "", formula: "", quantity_stock: 0, unit: "ml", expiration_date: "" });
  const [isEditing, setIsEditing] = useState(false);
  
  const [usageData, setUsageData] = useState({ chemical_id: 0, booking_id: 1, quantity_used: 0 }); // booking_id = 1 as placeholder for demo

  useEffect(() => {
    fetchChemicals();
  }, []);

  const fetchChemicals = async () => {
    setIsLoading(true);
    try {
      const res = await chemicalService.getAll();
      setChemicals(res.data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || t("load_chemicals_error");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (chemical?: any) => {
    if (chemical) {
      setFormData({
        id: chemical.id,
        name: chemical.name,
        formula: chemical.formula || "",
        quantity_stock: chemical.quantity_stock,
        unit: chemical.unit,
        expiration_date: chemical.expiration_date ? new Date(chemical.expiration_date).toISOString().split('T')[0] : ""
      });
      setIsEditing(true);
    } else {
      setFormData({ id: 0, name: "", formula: "", quantity_stock: 0, unit: "ml", expiration_date: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleOpenUsageModal = (chemical: any) => {
    setUsageData({ chemical_id: chemical.id, booking_id: 1, quantity_used: 0 });
    setIsUsageModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...restData } = formData;
      const payload = {
        ...restData,
        quantity_stock: Number(formData.quantity_stock),
        expiration_date: formData.expiration_date ? new Date(formData.expiration_date).toISOString() : undefined
      };
      
      if (isEditing) {
        await chemicalService.update(formData.id.toString(), payload);
        toast.success(t("update_chemical_success"));
      } else {
        await chemicalService.create(payload);
        toast.success(t("add_chemical_success"));
      }
      setIsModalOpen(false);
      fetchChemicals();
    } catch (error: any) {
      const msg = error.response?.data?.message || (isEditing ? t("update_chemical_failed") : t("add_chemical_failed"));
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await chemicalService.recordUsage({
        chemicalId: usageData.chemical_id.toString(),
        bookingId: usageData.booking_id.toString(),
        amountUsed: Number(usageData.quantity_used)
      });
      toast.success(t("record_usage_success"));
      setIsUsageModalOpen(false);
      fetchChemicals();
    } catch (error: any) {
      const msg = error.response?.data?.message || t("record_usage_error");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      try {
        await chemicalService.delete(deleteConfirmId.toString());
        toast.success(t("delete_chemical_success"));
        setDeleteConfirmId(null);
        fetchChemicals();
      } catch (error: any) {
        const msg = error.response?.data?.message || t("delete_chemical_failed");
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    }
  };

  const filteredChemicals = chemicals.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.formula && c.formula.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-[#E0E0E0] dark:border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between">
        <div className="relative w-[300px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] dark:text-slate-400" />
          <input 
            type="text" 
            placeholder={t("search_chemical_placeholder")} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 text-[14px]">
          <Plus className="w-4 h-4" /> Thêm Hóa chất
        </button>
      </div>
      
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E0E0E0]/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm sticky top-0 z-10">
              <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[20%]">{t("chemical_name")}</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[15%]">{t("formula")}</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[15%] text-right">{t("stock_quantity")}</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[15%] text-center">{t("unit")}</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 w-[15%]">{t("expiration_date")}</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-[#757575] dark:text-slate-400 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-800">
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-6 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-16 ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-12 mx-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-[#E0E0E0] rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-[#E0E0E0] rounded w-20 ml-auto"></div></td>
                </tr>
              ))}

              {!isLoading && filteredChemicals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#757575] dark:text-slate-400">
                  <Beaker className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                  <p className="mb-4">{t("no_chemicals_found")}</p>
                  <button onClick={() => { setFormData({ id: 0, name: '', formula: '', quantity_stock: 0, unit: 'ml', expiration_date: '' }); setIsEditing(false); setIsModalOpen(true); }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-[14px] transition-all duration-300 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">{t("add_chemical_now")}</button>
                </td>
              </tr>
              ) : !isLoading && filteredChemicals.map((c) => {
              const isLowStock = c.quantity_stock <= 5;
              return (
              <tr key={c.id} className="hover:bg-[#F5F5F5] dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-[14px] font-bold text-[#1E5FA5] dark:text-blue-400">{c.name}</td>
                <td className="px-6 py-4 text-[14px] text-[#212121] dark:text-slate-100">{c.formula || '-'}</td>
                <td className="px-6 py-4 text-[14px] text-right">
                  <span className={`font-semibold ${isLowStock ? 'text-red-500' : 'text-[#212121] dark:text-slate-100'}`}>{c.quantity_stock}</span>
                </td>
                <td className="px-6 py-4 text-[14px] text-center text-[#757575] dark:text-slate-400">{c.unit}</td>
                <td className="px-6 py-4 text-[14px] text-[#757575] dark:text-slate-400">
                  {c.expiration_date ? new Date(c.expiration_date).toLocaleDateString('vi-VN') : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleOpenUsageModal(c)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#2E7D32] hover:bg-[#E8F5E9] dark:bg-green-900/30 rounded transition-colors" title={t("record_usage")}>
                      <ClipboardList className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenModal(c)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#1E5FA5] dark:text-blue-400 hover:bg-[#D6E4F7] dark:bg-blue-900/30 rounded transition-colors" title={t("edit")}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirmId(c.id)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:text-[#C62828] hover:bg-[#FDEDED] dark:bg-red-900/30 rounded transition-colors" title={t("delete")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-md overflow-hidden border border-white/20 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-[#212121] dark:text-slate-100 text-[16px]">{isEditing ? t('edit_chemical_info') : t('add_new_chemical')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("chemical_name")} <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/80 border border-[#E0E0E0] dark:border-slate-800 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("chemical_formula_label")}</label>
                <input type="text" value={formData.formula} onChange={e => setFormData({...formData, formula: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px]" placeholder="Vd: H2SO4" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("quantity_stock_label")} <span className="text-red-500">*</span></label>
                  <input required type="number" step="0.1" value={formData.quantity_stock} onChange={e => setFormData({...formData, quantity_stock: Number(e.target.value)})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px]" />
                </div>
                <div className="w-1/3">
                  <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("unit")} <span className="text-red-500">*</span></label>
                  <select required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px]">
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t("expiration_date")}</label>
                <input type="date" value={formData.expiration_date} onChange={e => setFormData({...formData, expiration_date: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px]" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E0E0E0]/50 dark:border-slate-800/50 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded-lg transition-colors text-[14px] font-medium">{t("cancel")}</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 text-[14px]">{isEditing ? t('update') : t('add_new_btn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUsageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-900/50 w-full max-w-sm overflow-hidden border border-white/20 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#E0E0E0]/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-[#212121] dark:text-slate-100 text-[16px]">{t('record_usage')}</h3>
              <button onClick={() => setIsUsageModalOpen(false)} className="p-1.5 text-[#757575] dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRecordUsage} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t('booking_id_label')}</label>
                <input required type="number" value={usageData.booking_id} onChange={e => setUsageData({...usageData, booking_id: Number(e.target.value)})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] dark:text-slate-400 mb-1">{t('usage_quantity_label')} <span className="text-red-500">*</span></label>
                <input required type="number" step="0.1" value={usageData.quantity_used} onChange={e => setUsageData({...usageData, quantity_used: Number(e.target.value)})} className="w-full px-3 py-2 border border-[#E0E0E0] dark:border-slate-800 rounded-md text-[14px]" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E0E0E0]/50 dark:border-slate-800/50 mt-6">
                <button type="button" onClick={() => setIsUsageModalOpen(false)} className="px-4 py-2 text-[#757575] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded-lg transition-colors text-[14px] font-medium">{t("cancel")}</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 text-[14px]">{t('record_btn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={t("delete_chemical")}
        message={t("delete_chemical_confirm")}
        confirmText={t("delete_chemical")}
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
