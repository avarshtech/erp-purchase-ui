import axios from 'axios';
import { showErrorToast } from '../utils/globalToast';

/**
 * Axios instance configuration for API requests
 * This instance includes default settings and interceptors for error handling
 */
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage
    const token = sessionStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from response
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Extract message from response data - prioritize API's message field
      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          // Use the message from API response (e.g., "Bad credentials" or detailed error message)
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        }
      }
      
      // Only set default messages if no message was extracted from API response
      if (!data?.message && !data?.error) {
        switch (status) {
          case 401:
            errorMessage = 'Session expired. Please login again.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 409:
            errorMessage = 'A conflict occurred. The resource may already exist.';
            break;
          case 422:
            errorMessage = 'Validation failed. Please check your input.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            break;
        }
      }
      
      // Handle 401 redirect separately (after setting message)
      if (status === 401) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        // Don't redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error - please check your connection';
    }
    
    // Attach the extracted message to the error object for easy access
    error.errorMessage = errorMessage;
    
    // Show global toast for all API errors (except 401 which redirects to login)
    // This ensures users always see error messages even if component doesn't handle them
    if (!error.response || error.response.status !== 401) {
      showErrorToast(errorMessage);
    }
    
    return Promise.reject(error);
  }
);


/**
 * File upload wrapper (multipart/form-data)
 * @param {string} url - The endpoint URL
 * @param {FormData} formData - The form data with file
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise} - Response data
 */
export const upload = async (url, formData, onProgress = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }
    
    const response = await axiosInstance.post(url, formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default axiosInstance;
