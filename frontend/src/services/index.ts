import apiClient from './apiClient';

export const authService = {
  register: (data: { email: string; password: string; fullName: string; code?: string }) =>
    apiClient.post('/api/auth/register', { email: data.email, password: data.password, name: data.fullName }),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  saveToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
};

export const userService = {
  create: (data: { email: string; password: string; fullName: string; code?: string; role?: string }) =>
    apiClient.post('/api/users', { email: data.email, password: data.password, name: data.fullName, role: data.role }),

  getAll: () => apiClient.get('/api/users'),

  getOne: (id: string) => apiClient.get(`/api/users/${id}`),

  update: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/users/${id}`),
};

export const roomService = {
  create: (data: { name: string; capacity: number; isActive?: boolean }) =>
    apiClient.post('/api/rooms', { name: data.name, capacity: Number(data.capacity) }),

  getAll: () => apiClient.get('/api/rooms'),

  getOne: (id: string) => apiClient.get(`/api/rooms/${id}`),

  update: (id: string, data: any) => apiClient.put(`/api/rooms/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/rooms/${id}`),
};

export const equipmentService = {
  create: (data: { name: string; code: string; qrCode: string; status?: string; roomId: string }) =>
    apiClient.post('/api/equipment', { name: data.name, serial_number: data.code || data.qrCode, room_id: Number(data.roomId), status: data.status }),

  getAll: () => apiClient.get('/api/equipment'),

  getByRoom: (roomId: string) => apiClient.get(`/api/equipment?roomId=${roomId}`),

  getOne: (id: string) => apiClient.get(`/api/equipment/${id}`),

  update: (id: string, data: any) => apiClient.put(`/api/equipment/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/equipment/${id}`),
};

export const bookingService = {
  create: (data: { roomId: string | number; startTime: Date; endTime: Date; purpose: string }) =>
    apiClient.post('/api/bookings', {
      room_id: Number(data.roomId),
      start_time: data.startTime.toISOString(),
      end_time: data.endTime.toISOString(),
      purpose: data.purpose,
    }),

  getAll: () => apiClient.get('/api/bookings'),

  getOne: (id: string) => apiClient.get(`/api/bookings/${id}`),

  getMyBookings: () => apiClient.get('/api/bookings/user/my-bookings'),

  update: (id: string, data: any) => apiClient.patch(`/api/bookings/${id}`, data),

  cancel: (id: string) => apiClient.post(`/api/bookings/${id}/cancel`),

  delete: (id: string) => apiClient.delete(`/api/bookings/${id}`),
};

export const chemicalService = {
  create: (data: { name: string; quantity: number; unit: string }) =>
    apiClient.post('/api/chemicals', { name: data.name, quantity_stock: Number(data.quantity), unit: data.unit }),

  getAll: () => apiClient.get('/api/chemicals'),

  getOne: (id: string) => apiClient.get(`/api/chemicals/${id}`),

  recordUsage: (data: { chemicalId: string; amountUsed: number; bookingId?: string }) =>
    apiClient.post('/api/chemicals/usage/record', data),

  getUsageHistory: (chemicalId?: string) =>
    apiClient.get(`/api/chemicals/history/usage${chemicalId ? `?chemicalId=${chemicalId}` : ''}`),

  update: (id: string, data: any) => apiClient.put(`/api/chemicals/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/chemicals/${id}`),
};

export const reportService = {
  create: (data: { title: string; description: string; equipment_id?: number; room_id?: number }) =>
    apiClient.post('/api/reports', data),

  getAll: () => apiClient.get('/api/reports'),

  getOne: (id: string) => apiClient.get(`/api/reports/${id}`),

  getMyReports: () => apiClient.get('/api/reports/user/my-reports'),

  getStatistics: () => apiClient.get('/api/reports/statistics/overview'),

  update: (id: string, data: any) => apiClient.patch(`/api/reports/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/reports/${id}`),
};

export const checkInService = {
  checkIn: (data: { equipmentId: string }) => apiClient.post('/api/check-in', { equipment_id: Number(data.equipmentId) }),

  checkOut: (recordId: string) => apiClient.post(`/api/check-in/${recordId}/check-out`),

  getActive: () => apiClient.get('/api/check-in/active/records'),

  getHistory: () => apiClient.get('/api/check-in/history/user'),

  getAll: () => apiClient.get('/api/check-in'),
};
