import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_SYNERGIA_API_BASE_URL;

if (!apiBaseUrl) {
  console.warn('VITE_SYNERGIA_API_BASE_URL is not defined in environment variables');
}

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional - for adding auth tokens, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional - for error handling)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // You can add global error handling here if needed
    return Promise.reject(error);
  }
);

export default apiClient;

