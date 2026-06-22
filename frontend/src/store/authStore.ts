import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  is_mfa_enabled?: boolean;
  phone?: string;
  department?: string;
  trust_score?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Khôi phục từ localStorage lúc khởi tạo
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  let initialUser: User | null = null;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }

  return {
    user: initialUser,
    token: storedToken,
    setAuth: (user, token) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token });
    },
    clearAuth: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null });
    },
    updateUser: (updatedUser) => {
      set((state) => {
        if (!state.user) return state;
        const newUser = { ...state.user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUser));
        return { user: newUser };
      });
    },
  };
});
