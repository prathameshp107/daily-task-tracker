'use client'

import { useState } from 'react'
import { ProtectedRoute, RouteGuard, AuthenticatedRoute, UnauthenticatedRoute, AuthLoading, SessionManager } from './index'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Shield, Lock, Users, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

/**
 * Examples demonstrating different route protection patterns
 * This component showcases various authentication protection scenarios
 */
export function ProtectionExamples() {
  const [showExamples, setShowExamples] = useState(false)
  const [selectedExample, setSelectedExample] = useState<string>('basic')

  if (!showExamples) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Route Protection Examples
            </CardTitle>
            <CardDescription>
              Interactive examples of different authentication protection patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setShowExamples(true)} size="lg">
              <Eye className="h-4 w-4 mr-2" />
              View Examples
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Route Protection Examples</h1>
            <p className="text-muted-foreground">
              Interactive demonstrations of authentication protection patterns
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowExamples(false)}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide Examples
          </Button>
        </div>

        <Tabs value={selectedExample} onValueChange={setSelectedExample}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="loading">Loading</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          {/* Basic Protection Examples */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    ProtectedRoute
                  </CardTitle>
                  <CardDescription>
                    Basic route protection with automatic redirect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Authenticated Required
                    </Badge>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
{`<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>`}
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      Redirects to /login if user is not authenticated
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    AuthenticatedRoute
                  </CardTitle>
                  <CardDescription>
                    Convenience wrapper for authenticated routes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Authenticated Required
                    </Badge>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
{`<AuthenticatedRoute>
  <SettingsPage />
</AuthenticatedRoute>`}
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      Same as ProtectedRoute but with clearer naming
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    UnauthenticatedRoute
                  </CardTitle>
                  <CardDescription>
                    For pages that require user to be logged out
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Unauthenticated Required
                    </Badge>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
{`<UnauthenticatedRoute>
  <LoginForm />
</UnauthenticatedRoute>`}
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      Redirects to /dashboard if user is authenticated
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-gray-600" />
                    OptionalRoute
                  </CardTitle>
                  <CardDescription>
                    No authentication requirement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-gray-600 border-gray-600">
                      <Eye className="h-3 w-3 mr-1" />
                      Optional
                    </Badge>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
{`<OptionalRoute>
  <PublicContent />
</OptionalRoute>`}
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      Accessible to both authenticated and unauthenticated users
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Protection Examples */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>RouteGuard with Custom Options</CardTitle>
                  <CardDescription>
                    Advanced route protection with custom configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`<RouteGuard 
  type="authenticated" 
  redirectTo="/custom-login"
  message="You need special permissions to access this page"
>
  <AdminPanel />
</RouteGuard>`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Higher-Order Component Pattern</CardTitle>
                  <CardDescription>
                    Wrap components with protection using HOC
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`const ProtectedDashboard = withProtectedRoute(DashboardComponent, {
  redirectTo: '/login',
  requireAuth: true
})

export default ProtectedDashboard`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Loading Examples */}
          <TabsContent value="loading" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Loading States</CardTitle>
                  <CardDescription>
                    Different loading variants for authentication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Default Loading</h4>
                      <AuthLoading message="Checking authentication..." />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Card Variant</h4>
                      <AuthLoading variant="card" message="Verifying credentials..." />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Fallback</CardTitle>
                  <CardDescription>
                    Using custom fallback components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`<ProtectedRoute 
  fallback={
    <AuthLoading 
      variant="card" 
      message="Loading secure content..." 
    />
  }
>
  <SecureContent />
</ProtectedRoute>`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Session Management Examples */}
          <TabsContent value="session" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Automatic session handling and token refresh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`<SessionManager 
  warningThreshold={5}  // Show warning 5 minutes before expiration
  checkInterval={1}     // Check every minute
>
  <App />
</SessionManager>`}
                </pre>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Features:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Automatic token expiration warnings</li>
                    <li>• Session extension with token refresh</li>
                    <li>• Configurable warning thresholds</li>
                    <li>• Automatic logout on expiration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Common Patterns */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Page-Level Protection</CardTitle>
                  <CardDescription>
                    Protecting entire pages with route wrappers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`// pages/dashboard.tsx
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

// pages/login.tsx
export default function LoginPage() {
  return (
    <UnauthenticatedRoute redirectTo="/dashboard">
      <LoginForm />
    </UnauthenticatedRoute>
  )
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layout-Level Protection</CardTitle>
                  <CardDescription>
                    Protecting entire sections of the app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`// layouts/protected-layout.tsx
export default function ProtectedLayout({ children }) {
  return (
    <SessionManager>
      <ProtectedRoute>
        <Navbar />
        <main>{children}</main>
      </ProtectedRoute>
    </SessionManager>
  )
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}