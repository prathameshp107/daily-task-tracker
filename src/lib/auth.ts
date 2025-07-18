import { AuthResponse, TokenPayload, User, AuthError } from './types/auth'

/**
 * Storage keys for authentication data
 */
const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'
const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token'

/**
 * Token management utilities
 */
export class TokenManager {
  /**
   * Store authentication token in localStorage
   */
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    }
  }

  /**
   * Retrieve authentication token from localStorage
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY)
    }
    return null
  }

  /**
   * Remove authentication token from localStorage
   */
  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }

  /**
   * Store refresh token in localStorage
   */
  static setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  /**
   * Retrieve refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
    }
    return null
  }

  /**
   * Remove refresh token from localStorage
   */
  static removeRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
    }
  }

  /**
   * Store user data in localStorage
   */
  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    }
  }

  /**
   * Retrieve user data from localStorage
   */
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(AUTH_USER_KEY)
      if (userData) {
        try {
          return JSON.parse(userData) as User
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error)
          return null
        }
      }
    }
    return null
  }

  /**
   * Remove user data from localStorage
   */
  static removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY)
    }
  }

  /**
   * Clear all authentication data from localStorage
   */
  static clearAll(): void {
    this.removeToken()
    this.removeRefreshToken()
    this.removeUser()
  }

  /**
   * Check if token exists and is not expired
   */
  static isTokenValid(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = this.decodeToken(token)
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp > currentTime
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  /**
   * Decode JWT token payload (client-side only for expiration check)
   * Note: This is not for security validation, only for client-side checks
   */
  static decodeToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload) as TokenPayload
    } catch (error) {
      throw new Error('Invalid token format')
    }
  }
}

/**
 * Authentication utilities
 */
export class AuthUtils {
  /**
   * Check if user is authenticated based on stored token
   */
  static isAuthenticated(): boolean {
    return TokenManager.isTokenValid()
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    if (this.isAuthenticated()) {
      return TokenManager.getUser()
    }
    return null
  }

  /**
   * Store authentication data after successful login
   */
  static storeAuthData(authResponse: AuthResponse): void {
    TokenManager.setToken(authResponse.token)
    TokenManager.setUser(authResponse.user)
    
    if (authResponse.refreshToken) {
      TokenManager.setRefreshToken(authResponse.refreshToken)
    }
  }

  /**
   * Clear all authentication data (logout)
   */
  static clearAuthData(): void {
    TokenManager.clearAll()
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): Record<string, string> {
    const token = TokenManager.getToken()
    if (token) {
      return {
        Authorization: `Bearer ${token}`
      }
    }
    return {}
  }

  /**
   * Handle authentication errors and return user-friendly messages
   */
  static handleAuthError(error: unknown): { type: AuthError; message: string } {
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch')) {
        return {
          type: 'NETWORK_ERROR',
          message: 'Unable to connect to the server. Please check your internet connection.'
        }
      }
      
      // Token expiration
      if (error.message.includes('token') || error.message.includes('expired')) {
        return {
          type: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.'
        }
      }
      
      // Validation errors
      if (error.message.includes('validation')) {
        return {
          type: 'VALIDATION_ERROR',
          message: 'Please check your input and try again.'
        }
      }
      
      // Invalid credentials
      if (error.message.includes('credentials') || error.message.includes('unauthorized')) {
        return {
          type: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please try again.'
        }
      }
    }
    
    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.'
    }
  }

  /**
   * Format user display name
   */
  static formatUserDisplayName(user: User): string {
    return user.name || user.email.split('@')[0]
  }

  /**
   * Get user initials for avatar display
   */
  static getUserInitials(user: User): string {
    if (user.name) {
      return user.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email.charAt(0).toUpperCase()
  }
}