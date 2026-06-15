# Hệ thống Quản lý Phòng Lab Toàn diện (Lab Management System)

Dự án phần mềm cấp độ Doanh nghiệp (Enterprise-level) dành cho việc quản lý, đặt lịch và vận hành các phòng thí nghiệm, thiết bị và hóa chất trong môi trường Đại học.

## 🌟 Tính năng Kỹ thuật Nổi bật (Core Innovations)

Dự án không chỉ dừng lại ở các thao tác CRUD cơ bản mà giải quyết triệt để các bài toán kỹ thuật phức tạp:

- 🛡️ **Pessimistic Locking (Chống Double-Booking):** Sử dụng `SELECT ... FOR UPDATE` ở tầng Database (MySQL InnoDB) để ngăn chặn hoàn toàn hiện tượng Race Condition khi hàng trăm sinh viên cùng tranh nhau đặt 1 phòng Lab hoặc 1 thiết bị.
- 🔐 **Dual JWT Authentication & Anti-IDOR:** Kiến trúc bảo mật cấp ngân hàng. Access Token (15m) lưu In-memory chống XSS, Refresh Token lưu HttpOnly Cookie. Tích hợp Ownership Check ngăn chặn Insecure Direct Object Reference (IDOR).
- ⚙️ **Automated Cron Jobs:** Tích hợp bộ lập lịch ngầm tự động quét và hủy đơn chờ quá 24h, bắt No-show sau 15 phút, và phân tích rủi ro hóa chất hết hạn (Node.js Scheduler).
- 📜 **Global Audit Logging:** Interceptor tự động lắng nghe và ghi vết mọi thao tác `POST, PUT, DELETE` vào cơ sở dữ liệu để phục vụ truy vết lịch sử (Traceability).
- 🤖 **Zero-cost AI Chatbot (Client-side NLP):** Tích hợp trợ lý ảo điều khiển hệ thống bằng giọng nói/văn bản. Regex NLP Engine chạy độc lập trên trình duyệt giúp độ trễ bằng 0 và không tốn chi phí API.
- 🚧 **Throttler & Security Headers:** Hệ thống chặn DDoS bằng Rate Limit qua Redis, chống XSS bằng Helmet CSP, chặn BOPLA (Mass Assignment) bằng ValidationPipes.

## 🛡️ Kiến trúc Bảo mật 15 Lớp (Enterprise Security)
Dự án được xây dựng với tư duy "Security-First", đáp ứng xuất sắc các tiêu chuẩn OWASP:
1. **Password Hashing:** Bcrypt (10 rounds).
2. **Password Strength:** Regex bắt buộc độ phức tạp cao.
3. **CORS Strict Policy:** Khóa chặt tài nguyên từ nguồn lạ.
4. **Data Validation Pipes:** Chống SQL/NoSQL Injection.
5. **JWT Authentication:** Xác thực không trạng thái (Stateless).
6. **Role-based Access Control (RBAC):** Phân quyền nghiêm ngặt cấp Endpoint.
7. **Rate Limiting (Redis):** Chống DDoS và Brute-force.
8. **Helmet Security Headers:** Chống Clickjacking & MIME-sniffing.
9. **Global XSS Sanitizer:** Bộ lọc toàn cục làm sạch HTML độc hại.
10. **Pessimistic Locking:** Chống Race Condition ở cấp Database.
11. **Account Lockout:** Đóng băng tài khoản 15 phút sau 5 lần nhập sai.
12. **Military-grade Encryption (AES-256-GCM):** Mã hóa dữ liệu nhạy cảm trước khi lưu DB.
13. **Hash-chaining Audit Logs:** Nhật ký không thể chối bỏ (Non-repudiation).
14. **Ghost Session Rejection:** Check Liveness của JWT theo thời gian thực (Real-time).
15. **Anti-IDOR Ownership Checks:** Ngăn chặn truy cập chéo tài nguyên trái phép.

## 🛠️ Technology Stack

- **Backend:** NestJS (TypeScript), Prisma ORM, MySQL 8.0, Redis (Caching & Rate Limit).
- **Frontend:** React 18, Vite, TailwindCSS, Zustand (State Management).
- **DevOps:** Docker & Docker Compose (Containerization).

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (1-Click)

Yêu cầu môi trường: Cài đặt sẵn `Docker` và `Docker Compose`.

**Bước 1: Clone dự án**
```bash
git clone <repository_url>
cd DACN-main
```

**Bước 2: Khởi chạy Database & Cache**
Chỉ với 1 lệnh, hệ thống sẽ tự động pull MySQL 8.0 và Redis, cài đặt cấu hình tự động:
```bash
docker-compose up -d
```
*(Mật khẩu và DB đã được cấu hình mặc định trong file `.env.example`. Không cần cài đặt thủ công)*

**Bước 3: Chạy Backend API**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed   # (Tùy chọn) Chạy lệnh này để tạo dữ liệu mẫu
npm run start:dev
```
API sẽ khởi chạy tại: `http://localhost:3000/api`

**Bước 4: Chạy Frontend UI**
```bash
cd frontend
npm install
npm run dev
```
Giao diện sẽ khởi chạy tại: `http://localhost:5173`

## 👥 Phân quyền (RBAC Matrix)
- **Student:** Đặt lịch, Xem thiết bị, Nhận thông báo.
- **Lecturer / Technician:** Phê duyệt đơn, Cập nhật trạng thái thiết bị hỏng, Theo dõi hóa chất.
- **Admin:** Quản lý User (Blacklist), Cấu hình thông số hệ thống, Xem Audit Logs.