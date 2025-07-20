import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data: any = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage or cookie (handled by httpOnly cookie)
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        
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
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Return the full response with data, status, etc.
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      },
      (error: AxiosError) => {
        if (error.response) {
          // Handle 401 Unauthorized
          if (error.response.status === 401) {
            // Clear token and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }
          }
          
          // Create a consistent error format
          const apiError = new ApiError(
            error.response.status,
            (error.response.data as any)?.message || 'An error occurred',
            error.response.data
          );
          return Promise.reject(apiError);
        }
        
        return Promise.reject(
          new ApiError(500, 'Network error. Please check your connection and try again.')
        );
      }
    );
  }

  // Generic request method with proper typing
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await this.client.request<ApiResponse<T>>(config);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'An unexpected error occurred');
    }
  }

  // HTTP Methods with proper typing
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}

export const apiClient = new ApiClient();
