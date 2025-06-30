import { create } from 'zustand';
import { useApi } from '../hooks/useApi';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  language: string;
  is_active: boolean;
  is_verified: boolean;
  is_whitelisted: boolean;
  preferences: any;
  total_sessions: number;
  total_spent: number;
  created_at: string;
}

interface Appointment {
  id: string;
  client_id: string;
  staff_id: string;
  service_id: string;
  appointment_date: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
  client_name?: string;
  staff_name?: string;
  service_name?: string;
}

interface Analytics {
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

interface DataState {
  clients: Client[];
  appointments: Appointment[];
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchClients: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  createAppointment: (data: any) => Promise<void>;
  updateAppointment: (id: string, data: any) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  clients: [],
  appointments: [],
  analytics: null,
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const api = useApi();
      const clients = await api.get('/clients');
      set({ clients, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch clients', isLoading: false });
    }
  },

  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const api = useApi();
      const appointments = await api.get('/appointments');
      set({ appointments, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch appointments', isLoading: false });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const api = useApi();
      const analytics = await api.get('/analytics/dashboard');
      set({ analytics, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch analytics', isLoading: false });
    }
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    try {
      const api = useApi();
      await api.put(`/clients/${id}`, data);
      
      // Update local state
      const clients = get().clients.map(client => 
        client.id === id ? { ...client, ...data } : client
      );
      set({ clients });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update client' });
      throw error;
    }
  },

  createAppointment: async (data: any) => {
    try {
      const api = useApi();
      await api.post('/appointments', data);
      
      // Refresh appointments
      await get().fetchAppointments();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create appointment' });
      throw error;
    }
  },

  updateAppointment: async (id: string, data: any) => {
    try {
      const api = useApi();
      await api.put(`/appointments/${id}`, data);
      
      // Update local state
      const appointments = get().appointments.map(appointment => 
        appointment.id === id ? { ...appointment, ...data } : appointment
      );
      set({ appointments });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update appointment' });
      throw error;
    }
  },
}));