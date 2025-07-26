# Authentication Components

This directory contains all authentication-related UI components built with ShadCN UI, including login forms, route protection, and session management.

## Components

### Login Components

#### LoginForm
The main login form component with comprehensive validation and error handling.

**Features:**
- Email and password validation using Zod schemas
- Loading states during authentication
- Error display with user-friendly messages
- Password visibility toggle
- Demo login button (development only)
- Forgot password link placeholder
- Full ShadCN UI integration

**Usage:**
```tsx
import { LoginForm } from '@/components/auth'

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  )
}
```

### Route Protection Components

#### ProtectedRoute
Main component for protecting authenticated routes with comprehensive error handling.

**Features:**
- Authentication checking with loading states
- Automatic redirect to login for unauthenticated users
- Error handling with retry functionality
- Customizable fallback components
- Higher-order component support

**Usage:**
```tsx
import { ProtectedRoute } from '@/components/auth'

function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksContent />
    </ProtectedRoute>
  )
}

// Or as HOC
const ProtectedTasks = withProtectedRoute(TasksContent)
```

#### RouteGuard
Advanced route guard with multiple protection types.

**Types:**
- `authenticated`: Requires user to be logged in
- `unauthenticated`: Requires user to be logged out
- `optional`: No authentication requirement

**Usage:**
```tsx
import { RouteGuard, AuthenticatedRoute, UnauthenticatedRoute } from '@/components/auth'

// Generic guard
function MyPage() {
  return (
    <RouteGuard type="authenticated" redirectTo="/login">
      <PageContent />
    </RouteGuard>
  )
}

// Convenience components
function LoginPage() {
  return (
    <UnauthenticatedRoute redirectTo="/tasks">
      <LoginForm />
    </UnauthenticatedRoute>
  )
}

function TasksPage() {
  return (
    <AuthenticatedRoute>
      <TasksContent />
    </AuthenticatedRoute>
  )
}
```

### Loading Components

#### AuthLoading
Customizable authentication loading component.

**Variants:**
- `default`: Full-screen loading
- `card`: Card-wrapped loading
- `minimal`: Compact loading

**Usage:**
```tsx
import { AuthLoading } from '@/components/auth'

function MyComponent() {
  return (
    <AuthLoading 
      message="Verifying credentials..." 
      variant="card" 
      size="lg" 
    />
  )
}
```

#### Specialized Loading Components
- `RouteProtectionLoading`: For route protection
- `UserVerificationLoading`: For user verification
- `SessionValidationLoading`: For session validation

### Session Management Components

#### SessionManager
Handles token expiration, automatic logout, and session warnings.

**Features:**
- Automatic session validation
- Expiration warnings with extend option
- Token refresh handling
- Configurable warning thresholds

**Usage:**
```tsx
import { SessionManager } from '@/components/auth'

function App() {
  return (
    <SessionManager warningThreshold={5} checkInterval={1}>
      <AppContent />
    </SessionManager>
  )
}
```

#### SessionStatusIndicator
Shows current session status in the UI.

**Usage:**
```tsx
import { SessionStatusIndicator } from '@/components/auth'

function Header() {
  return (
    <div className="header">
      <SessionStatusIndicator />
    </div>
  )
}
```

## Route Protection Patterns

### Basic Protection
```tsx
import { ProtectedRoute } from '@/components/auth'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  )
}
```

### Custom Fallback
```tsx
import { ProtectedRoute, AuthLoading } from '@/components/auth'

export default function ProtectedPage() {
  return (
    <ProtectedRoute 
      fallback={<AuthLoading variant="card" />}
      redirectTo="/custom-login"
    >
      <PageContent />
    </ProtectedRoute>
  )
}
```

### Higher-Order Component
```tsx
import { withProtectedRoute } from '@/components/auth'

const MyComponent = () => <div>Protected Content</div>

export default withProtectedRoute(MyComponent, {
  redirectTo: '/login',
  requireAuth: true
})
```

## Session Management

### Automatic Session Handling
```tsx
import { SessionManager } from '@/components/auth'

function RootLayout({ children }) {
  return (
    <SessionManager 
      warningThreshold={5}  // Show warning 5 minutes before expiration
      checkInterval={1}     // Check every minute
    >
      {children}
    </SessionManager>
  )
}
```

## Security Features

### Token Management
- Automatic token validation
- Secure token refresh
- Token expiration handling
- Cleanup on logout

### Route Protection
- Server-side and client-side guards
- Automatic redirects
- Session validation
- Access control

## Integration

All components integrate seamlessly with:
- **Authentication Context**: Global state management
- **Authentication Service**: API calls and token management
- **Next.js Routing**: Automatic navigation and redirects
- **ShadCN UI**: Consistent styling and components