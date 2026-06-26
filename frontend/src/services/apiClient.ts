import axios from 'axios';
import { toast } from 'react-hot-toast';

import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Gửi kèm HttpOnly Cookie tự động
});

// Thêm Access Token vào mọi Request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value: string | null) => void; reject: (reason?: unknown) => void }[] =
  [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Xử lý lỗi toàn cục
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Lỗi mạng (Network error / Server Down)
    if (!error.response) {
      toast.error('Mất kết nối máy chủ. Vui lòng kiểm tra mạng!');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Bắt lỗi 503 (Hệ thống bảo trì)
    if (status === 503 && data?.message === 'MAINTENANCE_MODE') {
      useAuthStore.getState().clearAuth();
      toast.error('Hệ thống đang được bảo trì. Bạn đã bị đăng xuất!');
      return Promise.reject(error);
    }

    // Bắt lỗi 401 (Access Token hết hạn) và gọi API cấp lại Token
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const user = useAuthStore.getState().user;

      if (!user) {
        isRefreshing = false;
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi thẳng axios gốc nhưng nhớ bật withCredentials để trình duyệt tự gửi Cookie
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {
            userId: user.id,
          },
          {
            withCredentials: true,
          }
        );

        const { access_token } = response.data;

        // Cập nhật Token mới
        useAuthStore.getState().setAuth(user, access_token);

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return apiClient(originalRequest); // Gửi lại Request ban đầu bị fail
      } catch (refreshError) {
        processQueue(refreshError, null);

        // UX Improvement: Chỉ văng màn hình login nếu có mạng (Lỗi từ server thực sự trả về 401/403)
        // Nếu không có mạng thì không bắt user đăng nhập lại
        if (navigator.onLine) {
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          toast.error('Lỗi kết nối khi làm mới phiên làm việc. Vui lòng thử lại khi có mạng.');
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý các lỗi khác (400, 404, 500 sẽ do từng component tự bắt và hiển thị)
    if (status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
    } else if (status === 409) {
      const msg =
        data.message ||
        data.error ||
        'Tài nguyên đã bị thay đổi bởi một người dùng khác. Vui lòng tải lại dữ liệu.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
