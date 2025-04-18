
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Create the context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock function to simulate API requests (temporary solution)
const mockApiRequest = (data: any, successRate = 0.9): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate success rate (90% success by default)
      if (Math.random() < successRate) {
        console.log('Mock API request successful:', data);
        resolve(data);
      } else {
        console.log('Mock API request failed:', data);
        reject(new Error('Mock API request failed'));
      }
    }, 800);
  });
};

// Mock user storage (temporary until backend is connected)
const STORAGE_KEY = 'mock_auth_users';

const saveUser = (user: Partial<User>) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const findUser = (email: string) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return users.find((u: any) => u.email === email);
};

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Clear any auth errors
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // Mock API request (temporary until backend is connected)
      const user = findUser(credentials.email);
      
      if (!user || user.password !== credentials.password) {
        throw new Error('Invalid email or password');
      }
      
      await mockApiRequest({ email: credentials.email });
      
      // Create a user object without the password
      const { password, ...safeUser } = user;
      
      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(safeUser));
      
      setState({
        user: safeUser as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      toast.success('Logged in successfully');
    } catch (error: any) {
      const message = error.message || 'Login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      toast.error(message);
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // Check if passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      
      // Check if user already exists
      const existingUser = findUser(userData.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // Mock API request (temporary until backend is connected)
      await mockApiRequest({ email: userData.email });
      
      // Create user object
      const newUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        password: userData.password, // Note: In a real app, this would be hashed
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save user to mock storage
      saveUser(newUser);
      
      // Create a user object without the password
      const { password, ...safeUser } = newUser;
      
      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(safeUser));
      
      setState({
        user: safeUser as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      toast.success('Registered successfully');
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      toast.error(message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      // Mock API request (temporary until backend is connected)
      await mockApiRequest({});
      
      // Remove from localStorage
      localStorage.removeItem('auth_user');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      const message = error.message || 'Logout failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      toast.error(message);
    }
  };

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check localStorage for persisted user
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
