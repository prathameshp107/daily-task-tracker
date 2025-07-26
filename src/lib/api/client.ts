import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Using empty string as base URL since Next.js API routes are relative to /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Handle 401 Unauthorized
          if (error.response.status === 401) {
            // Clear auth token and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }
          }
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );
  }

  // HTTP Methods with proper typing
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any, R = any>(
    url: string, 
    data?: T, 
    config?: AxiosRequestConfig
  ): Promise<R> {
    const response = await this.client.post<R>(url, data, config);
    return response.data;
  }

  async put<T = any, R = any>(
    url: string, 
    data?: T, 
    config?: AxiosRequestConfig
  ): Promise<R> {
    const response = await this.client.put<R>(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T = any, R = any>(
    url: string, 
    data?: T, 
    config?: AxiosRequestConfig
  ): Promise<R> {
    const response = await this.client.patch<R>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
