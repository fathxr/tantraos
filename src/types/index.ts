export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff' | 'client';
  avatar?: string;
  isActive: boolean;
  language: 'en' | 'he' | 'ru' | 'ar';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Client extends User {
  role: 'client';
  isVerified: boolean;
  isWhitelisted: boolean;
  preferences: {
    services: string[];
    notifications: boolean;
    language: 'en' | 'he' | 'ru' | 'ar';
  };
  totalSessions: number;
  totalSpent: number;
}

export interface Staff extends User {
  role: 'staff' | 'admin';
  specializations: string[];
  schedule: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  rating: number;
  totalSessions: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  date: Date;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  requirements?: string[];
}

export interface Analytics {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
  clients: {
    total: number;
    active: number;
    new: number;
    returning: number;
  };
  staff: {
    total: number;
    active: number;
    utilization: number;
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  platform: 'whatsapp' | 'telegram' | 'internal';
  timestamp: Date;
  isRead: boolean;
}