# 🚀 Hệ thống Quản lý Thực hành & Tài nguyên Phòng Lab (Lab Management System)

Dự án Đồ án Chuyên ngành (DACN) - Hệ thống Quản lý phòng thực hành toàn diện, hỗ trợ quản lý phòng Lab, trang thiết bị, hóa chất tiêu hao và tự động hóa điểm danh, giám sát lịch trình.

---

## 🌟 Các tính năng nổi bật (Key Features)

### 1. 👥 Quản lý Phân quyền Đa cấp độ (Role-Based Access Control)
- **Admin**: Quản trị toàn quyền hệ thống, phê duyệt yêu cầu, quản lý người dùng, cài đặt hệ thống.
- **Instructor (Giảng viên)**: Đặt phòng/thiết bị tự động được phê duyệt, báo cáo sự cố, đánh giá thiết bị.
- **Student (Sinh viên)**: Đặt phòng chờ duyệt, kiểm tra số lượng thiết bị, điểm danh QR.

### 2. 📅 Đặt phòng & Mượn thiết bị (Booking & Equipment)
- Đặt lịch phòng Lab và mượn thiết bị kèm theo.
- Lên lịch lặp lại (Recurring Booking).
- Gợi ý thay thế thiết bị khi hết hàng hoặc hỏng hóc.
- **Bảo mật:** Áp dụng thuật toán chặn Xung đột đồng thời (Race Condition) bằng `Serializable Isolation`. Ngăn chặn việc nhiều người đặt cùng lúc 1 thiết bị.

### 3. 🧪 Quản lý Hóa chất & Vật tư (Chemical Inventory)
- Theo dõi tồn kho hóa chất, ghi log xuất/nhập/tiêu hao.
- Áp dụng Hạn mức (Chemical Limits) theo từng môn học/đồ án.
- Cảnh báo hóa chất sắp hết hạn hoặc sắp hết tồn kho.
- Chặn lỗi nhập số âm (Negative Input Bypass) bằng Validation bảo mật.

### 4. 📍 Điểm danh Chống gian lận (GPS-secured QR Check-in)
- Tạo mã QR động cho từng phòng/thiết bị.
- **Tích hợp GPS:** Sinh viên dùng điện thoại quét mã phải mở quyền Vị trí (Geolocation) để đảm bảo có mặt thực sự tại trường, chống quét hộ từ xa.
- Xử lý No-show tự động: Hủy lịch và trừ điểm Uy tín nếu vắng mặt không lý do sau 15 phút.

### 5. 🛠 Báo cáo sự cố & Đánh giá (Reports & Reviews)
- Theo dõi vòng đời sửa chữa thiết bị (Từ lúc báo hỏng -> Đang sửa -> Hoàn tất).
- Cho phép sinh viên đánh giá (Review/Rating) chất lượng thiết bị.
- Tích hợp logic "AI xử lý phạt oan": Bỏ qua phạt No-show nếu sinh viên báo cáo thiết bị hỏng trước giờ.

### 6. 🌍 Giao diện Đa ngôn ngữ & UI/UX Hiện đại
- Tích hợp Dark/Light Mode bằng biến số CSS `oklch`.
- Hỗ trợ i18n (Tiếng Việt / Tiếng Anh) mượt mà không cần reload trang.
- Dashboard báo cáo thống kê bằng biểu đồ đa dạng.

---

## 💻 Công nghệ sử dụng (Tech Stack)

### Frontend
- **Framework**: React.js (Vite)
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **State Management**: Zustand
- **Data Fetching**: Axios, SWR / React Query
- **Routing**: React Router DOM

### Backend
- **Framework**: NestJS
- **Ngôn ngữ**: TypeScript
- **ORM**: Prisma
- **Database**: MySQL
- **Authentication**: Passport-JWT
- **Task Scheduling**: @nestjs/schedule (Cronjobs)

---

## 🛠 Hướng dẫn Cài đặt & Chạy dự án (Local Setup)

### Yêu cầu cài đặt (Prerequisites)
- [Node.js](https://nodejs.org/en/) (phiên bản 18+ trở lên)
- [MySQL](https://www.mysql.com/) (hoặc sử dụng XAMPP/WAMP)
- Git

### 1. Clone dự án về máy
```bash
git clone https://github.com/huyhoang28012005-create/DACN.git
cd DACN
```

### 2. Cài đặt Backend
Mở Terminal, di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```

Thiết lập biến môi trường:
- Tạo một file `.env` ở thư mục `backend` bằng cách copy từ file mẫu:
```bash
cp .env.example .env
```
- Chỉnh sửa file `.env` và cập nhật chuỗi kết nối Database MySQL của bạn:
```env
DATABASE_URL="mysql://root:@localhost:3306/dacn_lab_management"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
```

Khởi tạo Database và nạp dữ liệu mẫu (Seeding):
```bash
# Push cấu trúc bảng lên MySQL
npx prisma db push

# Chạy seed dữ liệu mẫu (Tạo Admin mặc định, Phòng, Thiết bị...)
npx prisma db seed
```
> **Tài khoản mặc định:** `admin@gmail.com` / `123456`

Chạy Backend server:
```bash
npm run start:dev
```
Backend sẽ khởi chạy tại `http://localhost:3001`

### 3. Cài đặt Frontend
Mở một Terminal khác, di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
```

Thiết lập biến môi trường:
- Tạo file `.env` ở thư mục `frontend`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

Chạy Frontend server:
```bash
npm run dev
```
Trang web sẽ khởi chạy tại `http://localhost:5173`. Bạn có thể mở trình duyệt và đăng nhập!

---

## 🤝 Tác giả (Author)
- **GitHub**: [huyhoang28012005-create](https://github.com/huyhoang28012005-create)
- Đồ án Chuyên ngành - Phát triển Hệ thống Quản lý Tài nguyên Đại học.