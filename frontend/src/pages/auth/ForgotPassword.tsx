import { Link } from "react-router";

export function ForgotPassword() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-[400px] p-8 border border-[#E0E0E0] animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1E5FA5] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#212121] mb-2 tracking-tight">
            Khôi phục mật khẩu
          </h1>
          <p className="text-[14px] text-[#757575]">
            Nhập email sinh viên/giảng viên của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[14px] font-medium text-[#212121]" htmlFor="email">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#E0E0E0] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5FA5] transition-all text-[14px]"
              placeholder="example@vju.ac.vn"
            />
          </div>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); alert("Đã gửi liên kết khôi phục tới email của bạn."); }}
            className="w-full bg-[#1E5FA5] hover:bg-[#154a85] text-white font-bold h-[44px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E5FA5] focus:ring-offset-2 text-[14px]"
          >
            Gửi liên kết
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[14px] font-medium text-[#757575] hover:text-[#1E5FA5] transition-colors">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
