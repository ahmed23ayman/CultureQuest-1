import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
    isAuthenticated: false,
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      const { user, token } = response;
      localStorage.setItem('token', token);
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      const { user, token } = response;
      localStorage.setItem('token', token);
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await apiRequest('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        setAuthState({
          user: response.user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
  };
}