
import axios from 'axios';
import { LoginCredentials, RegisterCredentials, ProfileUpdateData, User } from '@/types/auth';

// This would be replaced with a real API URL in production
const API_URL = 'http://localhost:5000/api';

// Create an axios instance with credentials support for cookies
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    const message = error.response?.data?.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Mock functions that will be replaced by real API calls when backend is connected
const mockApiCall = (data: any, delay = 500): Promise<any> => {
  console.log('Mock API call with data:', data);
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Auth API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    // In a real app, this would call the API
    return mockApiCall({ user: { email: credentials.email } });
  },

  // Register new user
  register: async (userData: RegisterCredentials) => {
    // In a real app, this would call the API
    return mockApiCall({ 
      user: { 
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } 
    });
  },

  // Logout user
  logout: async () => {
    // In a real app, this would call the API
    return mockApiCall({ status: 'success' });
  },

  // Check authentication status
  checkAuthStatus: async () => {
    // In a real app, this would call the API
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      return mockApiCall({ user: JSON.parse(storedUser) });
    }
    throw new Error('Not authenticated');
  },

  // Request password reset
  forgotPassword: async (email: string) => {
    // In a real app, this would call the API
    return mockApiCall({ status: 'success', message: 'Reset link sent to email' });
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    // In a real app, this would call the API
    return mockApiCall({ status: 'success' });
  }
};

// User API functions
export const userApi = {
  // Get current user profile
  getProfile: async () => {
    // In a real app, this would call the API
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      return mockApiCall({ user: JSON.parse(storedUser) });
    }
    throw new Error('User not found');
  },

  // Update user profile
  updateProfile: async (profileData: ProfileUpdateData) => {
    // In a real app, this would call the API
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      return mockApiCall({ user: updatedUser });
    }
    throw new Error('User not found');
  },

  // Upload profile image
  uploadProfileImage: async (formData: FormData) => {
    // In a real app, this would call the API
    return mockApiCall({ imageUrl: 'https://via.placeholder.com/150' });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    // In a real app, this would call the API
    return mockApiCall({ status: 'success' });
  },

  // Delete account
  deleteAccount: async () => {
    // In a real app, this would call the API
    localStorage.removeItem('auth_user');
    return mockApiCall({ status: 'success' });
  }
};

export default api;
