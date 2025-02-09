import { createContext, useReducer, useContext, useEffect } from 'react';
import apiService from '../services/api';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Add function to check if token is valid
  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Get payload from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check if token has expired
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  // Add function to clear auth state
  const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Check token validity on mount and when token changes
  useEffect(() => {
    const checkAuth = () => {
      if (!isTokenValid()) {
        clearAuthState();
      }
    };

    // Check immediately
    checkAuth();

    // Set up interval to check periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiService.post('/auth/login', credentials, {
        requiresAuth: false
      });
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      const { token, user } = response.data;

      if (!user || !token) {
        throw new Error('Invalid response format: missing token or user data');
      }

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update auth state
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token }
      });

      return { user, token };
      
    } catch (error) {
      console.error('Login Error:', error);
      clearAuthState();
      throw error;
    }
  };

  const logout = () => {
    clearAuthState();
  };

  // Add this to handle initial auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      if (apiService && apiService.defaults) {
        apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      dispatch
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;