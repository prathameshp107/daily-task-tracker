import { AuthResponse, LoginCredentials, User, AuthError, AuthErrorResponse } from '../types/auth'
import { AuthUtils, TokenManager } from '../auth'
import { AuthErrorHandler } from './auth-errors'

/**
 * Authentication service for handling login, logout, and user session management
 * This service provides a centralized interface for all authentication operations
 */
export class AuthService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

  /**
   * Authenticate user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Promise resolving to authentication response
   * @throws Error if authentication fails
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const credentials: LoginCredentials = { email, password }
      
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401) {
          throw new Error('Invalid email or password')
        } else if (response.status === 422) {
          throw new Error('Please check your input and try again')
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later')
        } else {
          throw new Error(errorData.message || 'Authentication failed')
        }
      }

      const authResponse: AuthResponse = await response.json()
      
      // Validate response structure
      if (!authResponse.token || !authResponse.user) {
        throw new Error('Invalid authentication response')
      }

      // Store authentication data
      AuthUtils.storeAuthData(authResponse)

      return authResponse
    } catch (error) {
      // Re-throw with consistent error handling
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred during login')
    }
  }

  /**
   * Log out the current user and clear all authentication data
   */
  static logout(): void {
    try {
      // Clear all stored authentication data
      AuthUtils.clearAuthData()
      
      // Optional: Call logout endpoint to invalidate token on server
      // This is fire-and-forget, we don't wait for the response
      if (typeof window !== 'undefined') {
        fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            ...AuthUtils.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore logout endpoint errors since we've already cleared local data
        })
      }
    } catch (error) {
      // Even if logout fails, ensure local data is cleared
      TokenManager.clearAll()
      console.error('Error during logout:', error)
    }
  }

  /**
   * Get the currently authenticated user
   * @returns User object if authenticated, null otherwise
   */
  static getCurrentUser(): User | null {
    return AuthUtils.getCurrentUser()
  }

  /**
   * Check if user is currently authenticated
   * @returns true if user is authenticated with valid token
   */
  static isAuthenticated(): boolean {
    return AuthUtils.isAuthenticated()
  }

  /**
   * Get the current authentication token
   * @returns JWT token string if available, null otherwise
   */
  static getToken(): string | null {
    return TokenManager.getToken()
  }

  /**
   * Refresh the authentication token
   * @returns Promise resolving to new authentication response
   * @throws Error if token refresh fails
   */
  static async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = TokenManager.getRefreshToken()
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        // If refresh fails, clear all auth data
        AuthUtils.clearAuthData()
        throw new Error('Token refresh failed')
      }

      const authResponse: AuthResponse = await response.json()
      
      // Store new authentication data
      AuthUtils.storeAuthData(authResponse)

      return authResponse
    } catch (error) {
      // Clear auth data on refresh failure
      AuthUtils.clearAuthData()
      throw error
    }
  }

  /**
   * Validate current session and refresh token if needed
   * @returns Promise resolving to true if session is valid
   */
  static async validateSession(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        return false
      }

      const token = this.getToken()
      if (!token) {
        return false
      }

      // Check if token is close to expiration (within 5 minutes)
      const payload = TokenManager.decodeToken(token)
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = payload.exp - currentTime
      
      // If token expires in less than 5 minutes, try to refresh
      if (timeUntilExpiry < 300) {
        try {
          await this.refreshToken()
          return true
        } catch (error) {
          // Refresh failed, session is invalid
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Session validation error:', error)
      return false
    }
  }

  /**
   * Handle authentication errors and return user-friendly error information
   * @param error The error to handle
   * @param context Optional context about where the error occurred
   * @returns Formatted error information
   */
  static handleAuthError(error: unknown, context?: string): AuthErrorResponse {
    const errorResponse = AuthErrorHandler.handleError(error)
    
    // Log the error for debugging and monitoring
    AuthErrorHandler.logError(errorResponse, context)
    
    // If this is a token expiration error, automatically logout
    if (AuthErrorHandler.shouldLogout(errorResponse)) {
      this.logout()
    }
    
    return errorResponse
  }

  /**
   * Check if an authentication error is retryable
   * @param error The authentication error response
   * @returns true if the error can be retried
   */
  static isRetryableError(error: AuthErrorResponse): boolean {
    return AuthErrorHandler.isRetryable(error)
  }

  /**
   * Get a user-friendly display message for an authentication error
   * @param error The authentication error response
   * @returns User-friendly error message
   */
  static getErrorDisplayMessage(error: AuthErrorResponse): string {
    return AuthErrorHandler.getDisplayMessage(error)
  }
}