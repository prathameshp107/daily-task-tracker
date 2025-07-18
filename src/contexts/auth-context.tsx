'use client'

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { AuthContextType, AuthState, User, AuthErrorResponse } from '../lib/types/auth'
import { AuthService } from '../lib/services/auth-service'

/**
 * Authentication action types for reducer
 */
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_AUTH' }
  | { type: 'CLEAR_ERROR' }

/**
 * Initial authentication state
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true, // Start with loading true to check existing session
  isAuthenticated: false,
  error: null,
}

/**
 * Authentication state reducer
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    
    case 'CLEAR_AUTH':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    
    default:
      return state
  }
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication context provider props
 */
interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Authentication context provider component
 * Manages global authentication state and provides auth methods to the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  /**
   * Check authentication status on app initialization
   */
  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Check if user is authenticated with valid token
      if (AuthService.isAuthenticated()) {
        const user = AuthService.getCurrentUser()
        const token = AuthService.getToken()
        
        if (user && token) {
          // Validate session and refresh token if needed
          const isValidSession = await AuthService.validateSession()
          
          if (isValidSession) {
            // Get potentially refreshed user and token
            const refreshedUser = AuthService.getCurrentUser()
            const refreshedToken = AuthService.getToken()
            
            if (refreshedUser && refreshedToken) {
              dispatch({ 
                type: 'SET_USER', 
                payload: { user: refreshedUser, token: refreshedToken } 
              })
              return
            }
          }
        }
      }
      
      // If we reach here, authentication failed or token is invalid
      dispatch({ type: 'CLEAR_AUTH' })
    } catch (error) {
      console.error('Auth check failed:', error)
      dispatch({ type: 'CLEAR_AUTH' })
    }
  }, [])

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      
      const authResponse = await AuthService.login(email, password)
      
      dispatch({ 
        type: 'SET_USER', 
        payload: { user: authResponse.user, token: authResponse.token } 
      })
    } catch (error) {
      const authError = AuthService.handleAuthError(error, 'login')
      dispatch({ type: 'SET_ERROR', payload: authError.message })
      throw error // Re-throw so components can handle it
    }
  }, [])

  /**
   * Logout current user
   */
  const logout = useCallback(() => {
    try {
      AuthService.logout()
      dispatch({ type: 'CLEAR_AUTH' })
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear the local state
      dispatch({ type: 'CLEAR_AUTH' })
    }
  }, [])

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  /**
   * Check authentication on mount and set up periodic validation
   */
  useEffect(() => {
    checkAuth()
    
    // Set up periodic session validation (every 5 minutes)
    const intervalId = setInterval(async () => {
      if (state.isAuthenticated) {
        try {
          const isValid = await AuthService.validateSession()
          if (!isValid) {
            logout()
          }
        } catch (error) {
          console.error('Session validation failed:', error)
          logout()
        }
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(intervalId)
  }, [checkAuth, logout, state.isAuthenticated])

  /**
   * Context value
   */
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuth,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to consume authentication context
 * @returns Authentication context value
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Higher-order component to provide authentication context
 * @param Component The component to wrap
 * @returns Component wrapped with AuthProvider
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  )
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return WrappedComponent
}