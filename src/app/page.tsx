'use client'

import { useEffect } from 'react'
import { useAuthStatus } from '../contexts'

/**
 * Root page component
 * Redirects users to appropriate page based on authentication status
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuthStatus()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to dashboard if authenticated
        window.location.href = '/dashboard'
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login'
      }
    }
  }, [isAuthenticated, isLoading])

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading...</p>
        <a href="/signup" className="underline text-primary ml-4">Sign up</a>
      </div>
    </div>
  )
}
