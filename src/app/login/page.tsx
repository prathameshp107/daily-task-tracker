'use client'

import { useEffect } from 'react'
import { useRedirectIfAuthenticated } from '../../contexts'
import { LoginForm } from '../../components/auth/login-form'

/**
 * Login page component
 * Handles user authentication and redirects authenticated users
 */
export default function LoginPage() {
  const { isAuthenticated, isLoading, shouldRedirect } = useRedirectIfAuthenticated('/tasks')

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render anything if user is authenticated (will redirect)
  if (isAuthenticated || shouldRedirect) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* App Logo/Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Daily Task Tracker
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stay organized and boost your productivity
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}