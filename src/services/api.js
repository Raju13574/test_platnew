import axios from 'axios';

//const API_URL = 'https://testapi.nexterchat.com/api';
const API_URL = 'http://localhost:5000/api';



// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Add timeout
  timeout: 10000
});

// Add auth token to requests
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Attach the setAuthToken function to the axiosInstance
axiosInstance.setAuthToken = setAuthToken;

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get stored token
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Check token expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 <= Date.now()) {
          // Token has expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject('Token expired');
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject('Invalid token');
      }
    }
    
    // Add token to all requests except auth endpoints
    if (!config.url.includes('/auth/') && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request with sanitized headers (remove sensitive info)
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? '[PRESENT]' : '[NONE]'
      }
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Only store the URL if it's not already /login
      const currentUrl = window.location.href;
      if (currentUrl.includes('/test/shared/') && !currentUrl.includes('/login')) {
        // Store the full URL
        localStorage.setItem('redirectAfterLogin', currentUrl);
        console.log('Storing redirect URL:', currentUrl);
      }
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Add checkServerHealth to the apiService object
export const apiService = {
  checkServerHealth: async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      console.log('Server is accessible:', response.data);
      return true;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  },

  get: async (endpoint, config = {}) => {
    try {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return await axiosInstance.get(path, config);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint, data = {}, config = {}) => {
    console.log('API Request:', {
      endpoint,
      data
    });
    
    try {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await axiosInstance.post(path, data, {
        ...config,
        requiresAuth: !endpoint.includes('/auth/')
      });
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  put: async (endpoint, data = {}, config = {}) => {
    try {
      return await axiosInstance.put(endpoint, data, config);
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  delete: async (endpoint, config = {}) => {
    try {
      return await axiosInstance.delete(endpoint, config);
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },
  patch: async (endpoint, data = {}, config = {}) => {
    try {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Make request without requiring health check
      const response = await axiosInstance.patch(path, data, {
        ...config,
        timeout: 5000,
        validateStatus: status => status >= 200 && status < 300
      });

      return response;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.error('Network Error Details:', {
          baseURL: API_URL,
          endpoint,
          fullURL: `${API_URL}${endpoint}`,
          error: error.message
        });
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      // Throw the original error response if available
      if (error.response?.data) {
        throw error.response.data;
      }
      
      throw error;
    }
  },
  getCandidates: async () => {
    return await axiosInstance.get('vendor/candidates');
  },

  getCandidateMetrics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await axiosInstance.get(`vendor/candidate-metrics?${queryString}`);
  },

  getSubmissionDetails: async (testId, userId) => {
    return await axiosInstance.get(`submissions/test/${testId}/user/${userId}/details`);
  },

  getPerformanceMetrics: async (period = 'month') => {
    try {
      const response = await axiosInstance.get(`vendor/performance/metrics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  },

  getComprehensiveSubmission: async (testId, userId) => {
    try {
      // Update the URL to match the backend route
      const response = await axiosInstance.get(`/submissions/comprehensive/${testId}/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching comprehensive submission:', error);
      throw error;
    }
  }
};

export default apiService; 