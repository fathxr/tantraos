import { useAuth } from './useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export function useApi() {
  const { token, logout } = useAuth();

  const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401) {
        logout();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => apiCall(endpoint),
    post: (endpoint: string, body: any) => apiCall(endpoint, { method: 'POST', body }),
    put: (endpoint: string, body: any) => apiCall(endpoint, { method: 'PUT', body }),
    delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
  };
}