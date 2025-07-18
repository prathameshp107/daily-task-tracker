'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '../../contexts'
import { LoadingSpinner } from '../ui/loading-spinner'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * Protected route wrapper component
 * Guards authenticated routes and redirects unauthenticated users to login
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, shouldRedirect } = useRequireAuth(redirectTo)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Handle authentication errors
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !shouldRedirect && retryCount > 2) {
      setHasError(true)
    }
  }, [isLoading, isAuthenticated, shouldRedirect, retryCount])

  // Retry authentication check
  const handleRetry = () => {
    setHasError(false)
    setRetryCount(prev => prev + 1)
    // Force a page reload to retry authentication
    window.location.reload()
  }

  // Skip protection if not required
  if (!requireAuth) {
    return <>{children}</>
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Checking authentication..." />
        </div>
      )
    )
  }

  // Show error state if authentication check failed
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to verify your authentication status. Please try again or log in.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect to login)
  if (!isAuthenticated || shouldRedirect) {
    return null
  }

  // Render protected content
  return <>{children}</>
}

/**
 * Higher-order component version of ProtectedRoute
 * @param Component The component to protect
 * @param options Protection options
 * @returns Protected component
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  const ProtectedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`

  return ProtectedComponent
}