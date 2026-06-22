import apiClient from './apiClient';
import { useAuthStore } from '../store/authStore';

export const authService = {
  register: (data: { email: string; password: string; fullName: string; code?: string }) =>
    apiClient.post('/api/auth/register', {
      email: data.email,
      password: data.password,
      name: data.fullName,
    }),

  login: (data: { email: string; password: string; recaptchaToken?: string }) =>
    apiClient.post('/api/auth/login', data),

  forgotPassword: (email: string) => apiClient.post('/api/auth/forgot-password', { email }),

  generateMfa: () => apiClient.post('/api/auth/mfa/generate'),
  verifyMfa: (data: { userId: number; code: string }) =>
    apiClient.post('/api/auth/mfa/verify', data),
  disableMfa: () => apiClient.post('/api/auth/mfa/disable'),

  logout: () => {
    useAuthStore.getState().clearAuth();
  },

  saveToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
};

export const userService = {
  create: (data: {
    email: string;
    password: string;
    fullName: string;
    code?: string;
    role?: string;
    department?: string;
    student_class?: string;
  }) =>
    apiClient.post('/api/users', {
      email: data.email,
      password: data.password,
      name: data.fullName,
      role: data.role,
      department: data.department,
      student_class: data.student_class,
    }),

  getAll: () => apiClient.get('/api/users'),

  getOne: (id: string) => apiClient.get(`/api/users/${id}`),

  updateProfile: (data: Record<string, unknown>) => apiClient.patch('/api/users/me', data),

  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/api/users/${id}`, data),

  resetMfa: (id: string | number) => apiClient.patch(`/api/users/${id}/reset-mfa`),

  getLoginHistory: () => apiClient.get('/api/users/me/login-history'),

  getActivity: (id: string | number) => apiClient.get(`/api/users/${id}/activity`),

  updateTrustScore: (id: string | number, scoreDiff: number) =>
    apiClient.patch(`/api/users/${id}/trust-score`, { scoreDiff }),

  delete: (id: string) => apiClient.delete(`/api/users/${id}`),

  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const roomService = {
  create: (data: {
    name: string;
    location: string;
    capacity: number;
    has_air_conditioner: boolean;
  }) => apiClient.post('/api/rooms', data),

  getAll: () => apiClient.get('/api/rooms'),

  getOne: (id: string) => apiClient.get(`/api/rooms/${id}`),

  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/api/rooms/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/rooms/${id}`),
};

export const equipmentService = {
  create: (data: { name: string; serial_number: string; status?: string; room_id: number }) =>
    apiClient.post('/api/equipment', data),

  getAll: (startTime?: string, endTime?: string) => {
    let url = '/api/equipment';
    if (startTime && endTime) {
      url += `?startTime=${startTime}&endTime=${endTime}`;
    }
    return apiClient.get(url);
  },

  getByRoom: (roomId: string) => apiClient.get(`/api/equipment?roomId=${roomId}`),

  getOne: (id: string) => apiClient.get(`/api/equipment/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/api/equipment/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/equipment/${id}`),
};

export const bookingService = {
  create: (data: {
    roomId: string | number;
    equipmentId?: string | number;
    courseId?: string | number;
    startTime: Date;
    endTime: Date;
    purpose: string;
    status?: string;
    chemical_usages?: { chemical_id: number; quantity: number }[];
  }) =>
    apiClient.post('/api/bookings', {
      room_id: Number(data.roomId),
      ...(data.equipmentId && { equipment_id: Number(data.equipmentId) }),
      ...(data.courseId && { course_id: Number(data.courseId) }),
      ...(data.chemical_usages && data.chemical_usages.length > 0 && { chemical_usages: data.chemical_usages }),
      start_time: data.startTime.toISOString(),
      end_time: data.endTime.toISOString(),
      purpose: data.purpose,
      status: data.status,
    }),

  getAll: (startDate?: string, endDate?: string) => {
    let url = '/api/bookings';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return apiClient.get(url);
  },

  getOne: (id: string) => apiClient.get(`/api/bookings/${id}`),

  exportExcel: () => apiClient.get('/api/bookings/export/excel', { responseType: 'blob' }),

  getMyBookings: () => apiClient.get('/api/bookings/user/my-bookings'),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/api/bookings/${id}`, data),

  cancel: (id: string) => apiClient.post(`/api/bookings/${id}/cancel`),

  reschedule: (id: number | string, startTime: string, endTime: string) =>
    apiClient.patch(`/api/bookings/${id}/reschedule`, {
      start_time: startTime,
      end_time: endTime,
    }),

  delete: (id: string) => apiClient.delete(`/api/bookings/${id}`),

  suggestSlots: (
    roomId: number | string,
    date: string,
    durationMinutes: number,
    equipmentId?: number | string
  ) => {
    let url = `/api/bookings/suggest/slots?room_id=${roomId}&date=${date}&duration_minutes=${durationMinutes}`;
    if (equipmentId) {
      url += `&equipment_id=${equipmentId}`;
    }
    return apiClient.get(url);
  },
};

export const chemicalService = {
  create: (data: Record<string, unknown>) => apiClient.post('/api/chemicals', data),

  getAll: () => apiClient.get('/api/chemicals'),

  getOne: (id: string) => apiClient.get(`/api/chemicals/${id}`),

  recordUsage: (data: { chemicalId: string; amountUsed: number; bookingId?: string }) =>
    apiClient.post('/api/chemicals/usage/record', data),

  getUsageHistory: (chemicalId?: string) =>
    apiClient.get(`/api/chemicals/history/usage${chemicalId ? `?chemicalId=${chemicalId}` : ''}`),

  getLowStockAlerts: () => apiClient.get('/api/chemicals/alerts/low-stock'),

  getExpiringAlerts: () => apiClient.get('/api/chemicals/alerts/expiring'),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/api/chemicals/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/chemicals/${id}`),
};

export const chemicalLimitService = {
  create: (data: {
    course_id: number;
    chemical_id: number;
    max_quantity: number;
    unit: string;
    description?: string;
  }) => apiClient.post('/api/chemical-limits', data),

  getAll: (filters?: { course_id?: number; chemical_id?: number }) =>
    apiClient.get('/api/chemical-limits', { params: filters }),

  getOne: (id: number) => apiClient.get(`/api/chemical-limits/${id}`),

  update: (id: number, data: { max_quantity?: number; unit?: string; description?: string }) =>
    apiClient.patch(`/api/chemical-limits/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/chemical-limits/${id}`),

  getCourseStats: (courseId: number) =>
    apiClient.get(`/api/chemical-limits/course/${courseId}/stats`),

  checkLimit: (courseId: number, chemicalId: number, quantity: number) =>
    apiClient.get(`/api/chemical-limits/check/${courseId}/${chemicalId}`, {
      params: { quantity },
    }),
};

export const reportService = {
  create: (data: { title: string; description: string; equipment_id?: number; room_id?: number }) =>
    apiClient.post('/api/reports', data),

  getAll: () => apiClient.get('/api/reports'),

  getOne: (id: string) => apiClient.get(`/api/reports/${id}`),

  getMyReports: () => apiClient.get('/api/reports/user/my-reports'),

  getStatistics: () => apiClient.get('/api/reports/statistics/overview'),

  getOperational: () => apiClient.get('/api/reports/operational'),

  getManagement: () => apiClient.get('/api/reports/management'),

  getStrategic: () => apiClient.get('/api/reports/strategic'),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/api/reports/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/reports/${id}`),
};

export const comboService = {
  create: (data: Record<string, unknown>) => apiClient.post('/api/combos', data),
  getAll: () => apiClient.get('/api/combos'),
  getOne: (id: number | string) => apiClient.get(`/api/combos/${id}`),
  update: (id: number | string, data: Record<string, unknown>) => apiClient.patch(`/api/combos/${id}`, data),
  delete: (id: number | string) => apiClient.delete(`/api/combos/${id}`),
  book: (id: number | string, data: Record<string, unknown>) => apiClient.post(`/api/combos/${id}/book`, data),
};

export const maintenanceService = {
  create: (data: Record<string, unknown>) => apiClient.post('/api/maintenance', data),
  getAll: () => apiClient.get('/api/maintenance'),
  getOne: (id: number | string) => apiClient.get(`/api/maintenance/${id}`),
  update: (id: number | string, data: Record<string, unknown>) => apiClient.patch(`/api/maintenance/${id}`, data),
  delete: (id: number | string) => apiClient.delete(`/api/maintenance/${id}`),
};

export const commentService = {
  getAll: (reportId?: number, bookingId?: number, equipmentId?: number) => {
    const params = new URLSearchParams();
    if (reportId) params.append('reportId', reportId.toString());
    if (bookingId) params.append('bookingId', bookingId.toString());
    if (equipmentId) params.append('equipmentId', equipmentId.toString());
    return apiClient.get(`/api/comments?${params.toString()}`);
  },
  create: (data: {
    content: string;
    reportId?: number;
    bookingId?: number;
    equipmentId?: number;
    parentId?: number;
  }) => apiClient.post('/api/comments', data),
  delete: (id: number) => apiClient.delete(`/api/comments/${id}`),
};

export const courseService = {
  getAll: () => apiClient.get('/api/courses'),

  getOne: (id: string) => apiClient.get(`/api/courses/${id}`),

  create: (data: Record<string, unknown>) => apiClient.post('/api/courses', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/api/courses/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/courses/${id}`),

  requestDelete: (id: string, reason: string) =>
    apiClient.post(`/api/courses/${id}/request-delete`, { reason }),
};

export const checkInService = {
  checkIn: (data: { equipmentId: string }) =>
    apiClient.post('/api/check-in', { equipment_id: Number(data.equipmentId) }),

  checkOut: (recordId: string) => apiClient.post(`/api/check-in/${recordId}/check-out`),

  getActive: () => apiClient.get('/api/check-in/active/records'),

  getHistory: () => apiClient.get('/api/check-in/history/user'),

  getAll: () => apiClient.get('/api/check-in'),

  scanQR: (qrData: string) => apiClient.post('/api/check-in/scan-qr', { qr_data: qrData }),
};

export const notificationService = {
  getUnread: () => apiClient.get('/api/notifications'),
  markAsRead: (id: string | number) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/api/notifications/read-all'),
};

export const uploadService = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const investmentService = {
  getAll: () => apiClient.get('/api/investments'),
  create: (data: Record<string, unknown>) => apiClient.post('/api/investments', data),
  delete: (id: string) => apiClient.delete(`/api/investments/${id}`),
};

export const publicationService = {
  getAll: () => apiClient.get('/api/publications'),
  create: (data: Record<string, unknown>) => apiClient.post('/api/publications', data),
  delete: (id: number) => apiClient.delete(`/api/publications/${id}`),
};
