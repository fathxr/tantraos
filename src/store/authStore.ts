import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      name: 'Admin User',
      email,
      phone: '+972-50-123-4567',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
      isActive: true,
      language: 'en',
      createdAt: new Date(),
      lastLogin: new Date()
    };

    set({ 
      user: mockUser, 
      isAuthenticated: true, 
      isLoading: false 
    });
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },

  updateProfile: (data: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ 
        user: { ...user, ...data } 
      });
    }
  }
}));