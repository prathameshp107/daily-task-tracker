'use client'

import { LoadingSpinner } from '../ui/loading-spinner'
import { Card, CardContent } from '../ui/card'
import { Shield, Lock, User } from 'lucide-react'

/**
 * Props for authentication loading components
 */
interface AuthLoadingProps {
  message?: string
  variant?: 'default' | 'card' | 'minimal'
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Authentication loading component
 * Shows loading state while checking authentication
 */
export function AuthLoading({ 
  message = 'Checking authentication...', 
  variant = 'default',
  size = 'default' 
}: AuthLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <LoadingSpinner size={size} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="h-4 w-4 text-primary/50" />
        </div>
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )

  switch (variant) {
    case 'card':
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              {content}
            </CardContent>
          </Card>
        </div>
      )
    
    case 'minimal':
      return (
        <div className="flex items-center justify-center p-8">
          {content}
        </div>
      )
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          {content}
        </div>
      )
  }
}

/**
 * Route protection loading component
 * Shows loading state specifically for route protection
 */
export function RouteProtectionLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium">Securing Route</h3>
          <p className="text-muted-foreground text-sm">
            {message || 'Verifying your access permissions...'}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * User verification loading component
 * Shows loading state for user verification
 */
export function UserVerificationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium">Verifying Identity</h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we verify your credentials...
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Session validation loading component
 * Shows loading state for session validation
 */
export function SessionValidationLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-6 h-6 border-2 border-primary/30 rounded-full"></div>
          <div className="absolute inset-0 w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span className="text-sm text-muted-foreground">Validating session...</span>
      </div>
    </div>
  )
}