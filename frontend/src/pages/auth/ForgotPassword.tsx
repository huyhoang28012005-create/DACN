import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { authService } from '../../services';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      toast.success((response.data as any).message || t('reset_link_sent'));
      setEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-slate-800/50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-slate-900/50 w-full max-w-[400px] p-8 border border-[#E0E0E0] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1E5FA5] dark:bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm dark:shadow-slate-900/50">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#212121] dark:text-slate-100 mb-2 tracking-tight">
            Khôi phục mật khẩu
          </h1>
          <p className="text-[14px] text-[#757575] dark:text-slate-400">
            Nhập email sinh viên/giảng viên của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              className="block text-[14px] font-medium text-[#212121] dark:text-slate-100"
              htmlFor="email"
            >
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E0E0E0] dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E5FA5] dark:focus:ring-blue-500/50 transition-all text-[14px]"
              placeholder="example@vju.ac.vn"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1E5FA5] dark:bg-blue-600 hover:bg-[#154a85] dark:hover:bg-blue-700 disabled:opacity-50 text-white font-bold h-[44px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E5FA5] dark:focus:ring-blue-500/50 focus:ring-offset-2 text-[14px]"
          >
            {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-[14px] font-medium text-[#757575] dark:text-slate-400 hover:text-[#1E5FA5] dark:text-blue-400 transition-colors"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
