'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts'
import { AuthService } from '../../lib/services/auth-service'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react'

/**
 * Props for the SessionManager component
 */
interface SessionManagerProps {
  children: React.ReactNode
  warningThreshold?: number // Minutes before expiration to show warning
  checkInterval?: number // Minutes between session checks
}

/**
 * Session manager component
 * Handles token expiration, automatic logout, and session warnings
 */
export function SessionManager({ 
  children, 
  warningThreshold = 5,
  checkInterval = 1 
}: SessionManagerProps) {
  const { isAuthenticated, logout } = useAuth()
  const [showExpirationWarning, setShowExpirationWarning] = useState(false)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * Check session status and handle expiration
   */
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const token = AuthService.getToken()
      if (!token) {
        logout()
        return
      }

      // Decode token to check expiration
      const { TokenManager } = await import('../../lib/auth')
      const payload = TokenManager.decodeToken(token)
      if (!payload) {
        logout()
        return
      }

      const currentTime = Math.floor(Date.now() / 1000)
      const timeLeft = payload.exp - currentTime
      const minutesLeft = Math.floor(timeLeft / 60)

      setTimeUntilExpiry(minutesLeft)

      // Show warning if token expires soon
      if (minutesLeft <= warningThreshold && minutesLeft > 0) {
        setShowExpirationWarning(true)
      }

      // Auto logout if token is expired
      if (timeLeft <= 0) {
        setShowExpirationWarning(false)
        logout()
      }
    } catch (error) {
      console.error('Session check failed:', error)
      logout()
    }
  }, [isAuthenticated, logout, warningThreshold])

  /**
   * Refresh the session token
   */
  const refreshSession = useCallback(async () => {
    try {
      setIsRefreshing(true)
      await AuthService.refreshToken()
      setShowExpirationWarning(false)
      setTimeUntilExpiry(null)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    } finally {
      setIsRefreshing(false)
    }
  }, [logout])

  /**
   * Extend session by refreshing token
   */
  const extendSession = useCallback(async () => {
    await refreshSession()
  }, [refreshSession])

  /**
   * Handle manual logout
   */
  const handleLogout = useCallback(() => {
    setShowExpirationWarning(false)
    logout()
  }, [logout])

  // Set up session checking interval
  useEffect(() => {
    if (!isAuthenticated) return

    // Initial check
    checkSession()

    // Set up periodic checking
    const intervalId = setInterval(checkSession, checkInterval * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, checkSession, checkInterval])

  // Handle page visibility change to check session when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        checkSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAuthenticated, checkSession])

  return (
    <>
      {children}
      
      {/* Session Expiration Warning Dialog */}
      <Dialog open={showExpirationWarning} onOpenChange={setShowExpirationWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription>
              Your session will expire in {timeUntilExpiry} minute{timeUntilExpiry !== 1 ? 's' : ''}. 
              Would you like to extend your session?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You will be automatically logged out when your session expires.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={isRefreshing}
              >
                Logout Now
              </Button>
              <Button 
                onClick={extendSession}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Extending...
                  </>
                ) : (
                  'Extend Session'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Session status indicator component
 * Shows current session status in the UI
 */
export function SessionStatusIndicator() {
  const { isAuthenticated } = useAuth()
  const [sessionStatus, setSessionStatus] = useState<'active' | 'expiring' | 'expired'>('active')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setSessionStatus('expired')
      return
    }

    const checkStatus = async () => {
      try {
        const token = AuthService.getToken()
        if (!token) {
          setSessionStatus('expired')
          return
        }

        const { TokenManager } = await import('../../lib/auth')
        const payload = TokenManager.decodeToken(token)
        if (!payload) {
          setSessionStatus('expired')
          return
        }

        const currentTime = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = payload.exp - currentTime
        const minutesLeft = Math.floor(timeUntilExpiry / 60)

        setTimeLeft(minutesLeft)

        if (timeUntilExpiry <= 0) {
          setSessionStatus('expired')
        } else if (minutesLeft <= 5) {
          setSessionStatus('expiring')
        } else {
          setSessionStatus('active')
        }
      } catch (error) {
        setSessionStatus('expired')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'active':
        return 'text-green-600 dark:text-green-400'
      case 'expiring':
        return 'text-amber-600 dark:text-amber-400'
      case 'expired':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'active':
        return `Session active (${timeLeft}m left)`
      case 'expiring':
        return `Session expiring (${timeLeft}m left)`
      case 'expired':
        return 'Session expired'
      default:
        return 'Unknown status'
    }
  }

  return (
    <div className={`text-xs ${getStatusColor()}`}>
      {getStatusText()}
    </div>
  )
}