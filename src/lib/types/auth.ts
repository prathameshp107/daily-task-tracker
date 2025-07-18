/**
 * User interface representing authenticated user data
 */
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Authentication response from login API
 */
export interface AuthResponse {
  token: string
  user: User
  expiresIn: number
  refreshToken?: string
}

/**
 * Authentication state for context management
 */
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

/**
 * Authentication context type with methods
 */
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

/**
 * Token payload interface for JWT decoding
 */
export interface TokenPayload {
  sub: string // user id
  email: string
  name: string
  iat: number // issued at
  exp: number // expires at
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Authentication error types
 */
export type AuthError = 
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Authentication error interface
 */
export interface AuthErrorResponse {
  type: AuthError
  message: string
  details?: Record<string, string>
}