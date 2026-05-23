import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors (Server down, cors, etc)
    if (!error.response) {
      toast.error('Mất kết nối máy chủ. Vui lòng kiểm tra mạng!');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Phiên đăng nhập đã hết hạn.');
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
    } else if (status === 400 || status === 404 || status === 409) {
      // Backend error messages
      const msg = data.message || data.error || 'Yêu cầu không hợp lệ.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } else if (status >= 500) {
      toast.error('Lỗi hệ thống nội bộ. Vui lòng thử lại sau.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
