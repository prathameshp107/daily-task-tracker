import { AuthError, AuthErrorResponse } from '../types/auth'

/**
 * Authentication error codes and their corresponding user-friendly messages
 */
export const AUTH_ERROR_MESSAGES: Record<AuthError, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
}

/**
 * HTTP status codes that map to specific authentication errors
 */
const STATUS_CODE_ERROR_MAP: Record<number, AuthError> = {
  400: 'VALIDATION_ERROR',
  401: 'INVALID_CREDENTIALS',
  403: 'INVALID_CREDENTIALS',
  422: 'VALIDATION_ERROR',
  500: 'UNKNOWN_ERROR',
  502: 'NETWORK_ERROR',
  503: 'NETWORK_ERROR',
  504: 'NETWORK_ERROR',
}

/**
 * Enhanced authentication error handling utility
 */
export class AuthErrorHandler {
  /**
   * Parse and format authentication errors from various sources
   * @param error The error to handle (can be Error, Response, or unknown)
   * @returns Formatted authentication error response
   */
  static handleError(error: unknown): AuthErrorResponse {
    // Handle fetch Response errors
    if (error instanceof Response) {
      return this.handleResponseError(error)
    }

    // Handle JavaScript Error objects
    if (error instanceof Error) {
      return this.handleJavaScriptError(error)
    }

    // Handle string errors
    if (typeof error === 'string') {
      return this.handleStringError(error)
    }

    // Handle unknown error types
    return {
      type: 'UNKNOWN_ERROR',
      message: AUTH_ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }

  /**
   * Handle HTTP Response errors
   */
  private static handleResponseError(response: Response): AuthErrorResponse {
    const errorType = STATUS_CODE_ERROR_MAP[response.status] || 'UNKNOWN_ERROR'
    
    return {
      type: errorType,
      message: AUTH_ERROR_MESSAGES[errorType],
      details: {
        status: response.status.toString(),
        statusText: response.statusText,
      },
    }
  }

  /**
   * Handle JavaScript Error objects
   */
  private static handleJavaScriptError(error: Error): AuthErrorResponse {
    const message = error.message.toLowerCase()

    // Network-related errors
    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return {
        type: 'NETWORK_ERROR',
        message: AUTH_ERROR_MESSAGES.NETWORK_ERROR,
        details: { originalMessage: error.message },
      }
    }

    // Token-related errors
    if (message.includes('token') || message.includes('expired') || message.includes('invalid')) {
      return {
        type: 'TOKEN_EXPIRED',
        message: AUTH_ERROR_MESSAGES.TOKEN_EXPIRED,
        details: { originalMessage: error.message },
      }
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        type: 'VALIDATION_ERROR',
        message: AUTH_ERROR_MESSAGES.VALIDATION_ERROR,
        details: { originalMessage: error.message },
      }
    }

    // Credential errors
    if (message.includes('credentials') || message.includes('unauthorized') || message.includes('password')) {
      return {
        type: 'INVALID_CREDENTIALS',
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
        details: { originalMessage: error.message },
      }
    }

    // Default to unknown error
    return {
      type: 'UNKNOWN_ERROR',
      message: AUTH_ERROR_MESSAGES.UNKNOWN_ERROR,
      details: { originalMessage: error.message },
    }
  }

  /**
   * Handle string errors
   */
  private static handleStringError(error: string): AuthErrorResponse {
    const message = error.toLowerCase()

    if (message.includes('network') || message.includes('connection')) {
      return {
        type: 'NETWORK_ERROR',
        message: AUTH_ERROR_MESSAGES.NETWORK_ERROR,
        details: { originalMessage: error },
      }
    }

    if (message.includes('credentials') || message.includes('password')) {
      return {
        type: 'INVALID_CREDENTIALS',
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
        details: { originalMessage: error },
      }
    }

    if (message.includes('validation')) {
      return {
        type: 'VALIDATION_ERROR',
        message: AUTH_ERROR_MESSAGES.VALIDATION_ERROR,
        details: { originalMessage: error },
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: AUTH_ERROR_MESSAGES.UNKNOWN_ERROR,
      details: { originalMessage: error },
    }
  }

  /**
   * Create a user-friendly error message for display in UI components
   * @param error The authentication error response
   * @returns User-friendly error message
   */
  static getDisplayMessage(error: AuthErrorResponse): string {
    return error.message
  }

  /**
   * Check if an error should trigger a logout (e.g., token expired)
   * @param error The authentication error response
   * @returns true if the error should trigger logout
   */
  static shouldLogout(error: AuthErrorResponse): boolean {
    return error.type === 'TOKEN_EXPIRED' || error.type === 'INVALID_CREDENTIALS'
  }

  /**
   * Check if an error is retryable (e.g., network errors)
   * @param error The authentication error response
   * @returns true if the error is retryable
   */
  static isRetryable(error: AuthErrorResponse): boolean {
    return error.type === 'NETWORK_ERROR'
  }

  /**
   * Log authentication errors for debugging and monitoring
   * @param error The authentication error response
   * @param context Additional context about where the error occurred
   */
  static logError(error: AuthErrorResponse, context?: string): void {
    const logData = {
      type: error.type,
      message: error.message,
      details: error.details,
      context,
      timestamp: new Date().toISOString(),
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Authentication Error:', logData)
    }

    // In production, you would send this to your logging service
    // Example: sendToLoggingService(logData)
  }
}