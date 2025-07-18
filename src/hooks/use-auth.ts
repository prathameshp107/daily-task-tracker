'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/auth-context'
import { User } from '../lib/types/auth'

/**
 * Hook for authentication status with loading state
 * @returns Object with authentication status and loading state
 */
export function useAuthStatus() {
  const { isAuthenticated, isLoading } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading, // Convenience flag for when auth check is complete
  }
}

/**
 * Hook for current user information
 * @returns Current user object or null if not authenticated
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth()
  return user
}

/**
 * Hook for authentication actions
 * @returns Object with login and logout functions
 */
export function useAuthActions() {
  const { login, logout, clearError } = useAuth()
  
  return {
    login,
    logout,
    clearError,
  }
}

/**
 * Hook for authentication errors
 * @returns Object with error state and clear function
 */
export function useAuthError() {
  const { error, clearError } = useAuth()
  
  return {
    error,
    hasError: !!error,
    clearError,
  }
}

/**
 * Hook that redirects to login if user is not authenticated
 * @param redirectTo Optional redirect path after login (default: current path)
 * @returns Authentication status
 */
export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShouldRedirect(true)
      
      // Store the intended destination for after login
      if (typeof window !== 'undefined') {
        const currentPath = redirectTo || window.location.pathname
        sessionStorage.setItem('auth_redirect_after_login', currentPath)
        
        // Redirect to login page
        window.location.href = '/login'
      }
    }
  }, [isAuthenticated, isLoading, redirectTo])
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect,
  }
}

/**
 * Hook that redirects authenticated users away from auth pages
 * @param redirectTo Path to redirect to if authenticated (default: '/dashboard')
 * @returns Authentication status
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { isAuthenticated, isLoading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setShouldRedirect(true)
      
      // Check if there's a stored redirect path
      if (typeof window !== 'undefined') {
        const storedRedirect = sessionStorage.getItem('auth_redirect_after_login')
        const destination = storedRedirect || redirectTo
        
        // Clear the stored redirect
        sessionStorage.removeItem('auth_redirect_after_login')
        
        // Redirect to destination
        window.location.href = destination
      }
    }
  }, [isAuthenticated, isLoading, redirectTo])
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect,
  }
}

/**
 * Hook for handling login with loading and error states
 * @returns Object with login function and states
 */
export function useLogin() {
  const { login, error, clearError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      clearError()
      await login(email, password)
    } catch (error) {
      // Error is already handled by the context
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [login, clearError])
  
  return {
    login: handleLogin,
    isLoading,
    error,
    clearError,
  }
}

/**
 * Hook for handling logout with confirmation
 * @returns Object with logout function and confirmation state
 */
export function useLogout() {
  const { logout } = useAuth()
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const handleLogout = useCallback(() => {
    logout()
    setShowConfirmation(false)
  }, [logout])
  
  const requestLogout = useCallback(() => {
    setShowConfirmation(true)
  }, [])
  
  const cancelLogout = useCallback(() => {
    setShowConfirmation(false)
  }, [])
  
  return {
    logout: handleLogout,
    requestLogout,
    cancelLogout,
    showConfirmation,
  }
}

/**
 * Hook for user profile information with formatting utilities
 * @returns Object with user info and formatting functions
 */
export function useUserProfile() {
  const user = useCurrentUser()
  
  const getDisplayName = useCallback(() => {
    if (!user) return ''
    return user.name || user.email.split('@')[0]
  }, [user])
  
  const getInitials = useCallback(() => {
    if (!user) return ''
    
    if (user.name) {
      return user.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    return user.email.charAt(0).toUpperCase()
  }, [user])
  
  const getAvatarUrl = useCallback(() => {
    return user?.avatar || null
  }, [user])
  
  return {
    user,
    displayName: getDisplayName(),
    initials: getInitials(),
    avatarUrl: getAvatarUrl(),
    isLoaded: !!user,
  }
}