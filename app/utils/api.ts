import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://172.20.30.16:8080',
    android: 'http://172.20.30.16:8080',
    default: 'http://172.20.30.16:8080'
  }),
  endpoints: {
    login: '/login',
    googleLogin: '/google-login',
    register: '/register',
  }
};

// Helper function for API requests
interface RequestOptions {
  headers?: Record<string, string>;
  [key: string]: any;
}

export const apiRequest = async (endpoint: any, options: RequestOptions = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Export default object to satisfy Expo Router
const apiUtils = {
  API_CONFIG,
  apiRequest,
};

export default apiUtils;