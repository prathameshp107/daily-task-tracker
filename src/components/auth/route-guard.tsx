'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts'
import { LoadingSpinner } from '../ui/loading-spinner'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { AlertTriangle, Shield, Lock } from 'lucide-react'

/**
 * Route guard types
 */
type GuardType = 'authenticated' | 'unauthenticated' | 'optional'

/**
 * Props for the RouteGuard component
 */
interface RouteGuardProps {
  children: React.ReactNode
  type: GuardType
  fallback?: React.ReactNode
  redirectTo?: string
  message?: string
}

/**
 * Advanced route guard component with multiple protection types
 */
export function RouteGuard({
  children,
  type,
  fallback,
  redirectTo,
  message,
}: RouteGuardProps) {
  const { isAuthenticated, isLoading, error } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      switch (type) {
        case 'authenticated':
          if (!isAuthenticated) {
            setShouldRedirect(true)
            // Store current path for redirect after login
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('auth_redirect_after_login', window.location.pathname)
              setTimeout(() => {
                window.location.href = redirectTo || '/login'
              }, 100)
            }
          }
          break
        case 'unauthenticated':
          if (isAuthenticated) {
            setShouldRedirect(true)
            setTimeout(() => {
              window.location.href = redirectTo || '/dashboard'
            }, 100)
          }
          break
        case 'optional':
          // No redirect needed for optional routes
          break
      }
    }
  }, [isAuthenticated, isLoading, type, redirectTo])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      )
    )
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Handle redirect states
  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    )
  }

  // Check access based on guard type
  const hasAccess = () => {
    switch (type) {
      case 'authenticated':
        return isAuthenticated
      case 'unauthenticated':
        return !isAuthenticated
      case 'optional':
        return true
      default:
        return false
    }
  }

  // Show access denied if user doesn't have access
  if (!hasAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              {message || 'You do not have permission to access this page.'}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => window.location.href = isAuthenticated ? '/dashboard' : '/login'}>
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render children if access is granted
  return <>{children}</>
}

/**
 * Convenience components for specific guard types
 */
export function AuthenticatedRoute({ children, ...props }: Omit<RouteGuardProps, 'type'>) {
  return (
    <RouteGuard type="authenticated" {...props}>
      {children}
    </RouteGuard>
  )
}

export function UnauthenticatedRoute({ children, ...props }: Omit<RouteGuardProps, 'type'>) {
  return (
    <RouteGuard type="unauthenticated" {...props}>
      {children}
    </RouteGuard>
  )
}

export function OptionalRoute({ children, ...props }: Omit<RouteGuardProps, 'type'>) {
  return (
    <RouteGuard type="optional" {...props}>
      {children}
    </RouteGuard>
  )
}