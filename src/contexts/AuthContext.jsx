import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth, isTokenValid } from '../utils/authUtils';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user from localStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        console.log('Initializing auth:', { storedToken: !!storedToken, storedUser: !!storedUser });

        if (storedToken && storedUser && isTokenValid(storedToken)) {
          console.log('Valid token found, setting auth state');
          setToken(storedToken);
          setUser(storedUser);
          
          // Verify token is still valid by making a request to /api/auth/me
          try {
            const response = await authApi.getCurrentUser();
            if (response.success) {
              console.log('Token verified with server, updating user data');
              setUser(response.data.user);
            } else {
              console.log('Token invalid on server, clearing auth');
              // Token is invalid, clear storage
              clearStoredAuth();
              setToken(null);
              setUser(null);
            }
          } catch (error) {
            console.log('Token verification failed, clearing auth:', error);
            // Token is invalid, clear storage
            clearStoredAuth();
            setToken(null);
            setUser(null);
          }
        } else if (storedToken && !isTokenValid(storedToken)) {
          console.log('Token expired, clearing auth');
          // Token is expired, clear storage
          clearStoredAuth();
          setToken(null);
          setUser(null);
    } else {
          console.log('No valid token found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid data
        clearStoredAuth();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
    }
    };

    initializeAuth();
  }, []);

  // Add a function to manually refresh auth state
  const refreshAuth = async () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser && isTokenValid(storedToken)) {
      setToken(storedToken);
      setUser(storedUser);
      return true;
    }
    return false;
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);
      
      const response = await authApi.login({ email, password });
      console.log('Login response:', response);

      if (response.success) {
        const { user: userData, token: authToken } = response.data;
        console.log('Login successful, storing auth data');
        
        // Store in localStorage
        setStoredAuth(authToken, userData);
        
        // Update state
        setUser(userData);
        setToken(authToken);
        
        console.log('Auth state updated, user logged in');
        return true;
      } else {
        console.error('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      // Return false for any error, let the login page handle the specific error message
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    clearStoredAuth();
    
    // Clear state
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    refreshAuth,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 