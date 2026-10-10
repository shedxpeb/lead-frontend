import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, clearSession } from '@/core/auth/session';
import { authService } from '@/features/auth/authService';
import dayjs from 'dayjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
}

// Date field names that should be parsed as dates
const DATE_FIELDS = [
  'createdAt', 'updatedAt', 'deletedAt',
  'lastFollowUp', 'nextFollowUpDate',
  'convertedDate', 'performedAt', 'timestamp',
  'date', 'dueDate', 'startDate', 'endDate',
  'birthDate', 'joinDate', 'expiryDate'
];

// Recursively parse date strings in response data
function parseDates(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => parseDates(item));
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if this is a date field and value is a string
      if (DATE_FIELDS.includes(key) && typeof value === 'string') {
        const parsed = dayjs(value);
        if (parsed.isValid()) {
          result[key] = parsed.toDate();
        } else {
          result[key] = value;
        }
      } else {
        result[key] = parseDates(value);
      }
    }
    return result;
  }

  return data;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove default Content-Type for FormData to let browser generate multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Track refresh request to prevent multiple simultaneous refreshes
let refreshPromise: Promise<any> | null = null;

// Response interceptor - handle 401 and date parsing
apiClient.interceptors.response.use(
  (response) => {
    // Skip date parsing for binary responses (Blob, ArrayBuffer)
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }

    // Parse date strings in response data
    if (response.data) {
      response.data = parseDates(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't refresh for auth endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/refresh') ||
                           originalRequest.url?.includes('/auth/logout');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // If a refresh is already in progress, wait for it
      if (refreshPromise) {
        try {
          await refreshPromise;
          // Retry the original request with new token
          return apiClient(originalRequest);
        } catch (refreshError) {
          clearSession();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      // Start a new refresh
      originalRequest._retry = true;
      refreshPromise = authService.refresh()
        .then((response) => {
          const { accessToken } = response;
          setAccessToken(accessToken);
          refreshPromise = null;
          // Retry the original request with new token
          return apiClient(originalRequest);
        })
        .catch((refreshError) => {
          refreshPromise = null;
          clearSession();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        });

      return refreshPromise;
    }

    return Promise.reject(error);
  },
);

// Typed API methods - unwrap response.data
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then(res => res.data),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then(res => res.data),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then(res => res.data),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then(res => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then(res => res.data),
};

export interface ApiResponse<T> { data: T; message?: string; success: boolean; }
export interface PaginatedResponse<T> { data: T[]; pagination: { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrevious: boolean; }; }
export interface ApiError { message: string; code: string; statusCode: number; details?: any; }

export default api;
