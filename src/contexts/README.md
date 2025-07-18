# Authentication Context

This directory contains the authentication context and related hooks for managing global authentication state in the application.

## Files

- `auth-context.tsx` - Main authentication context provider and hook
- `index.ts` - Clean exports for all authentication context and hooks
- `README.md` - This documentation file

## Usage

### Basic Setup

Wrap your app with the `AuthProvider`:

```tsx
import { AuthProvider } from '@/contexts'

function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  )
}
```

### Using the Authentication Context

```tsx
import { useAuth } from '@/contexts'

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    logout, 
    clearError 
  } = useAuth()

  // Your component logic
}
```

### Specialized Hooks

#### `useAuthStatus()`
Get authentication status with loading state:

```tsx
import { useAuthStatus } from '@/contexts'

function Header() {
  const { isAuthenticated, isLoading, isReady } = useAuthStatus()
  
  if (!isReady) return <div>Loading...</div>
  
  return (
    <div>
      {isAuthenticated ? 'Welcome!' : 'Please log in'}
    </div>
  )
}
```

#### `useCurrentUser()`
Get current user information:

```tsx
import { useCurrentUser } from '@/contexts'

function UserProfile() {
  const user = useCurrentUser()
  
  if (!user) return null
  
  return <div>Hello, {user.name}!</div>
}
```

#### `useLogin()`
Handle login with loading and error states:

```tsx
import { useLogin } from '@/contexts'

function LoginForm() {
  const { login, isLoading, error, clearError } = useLogin()
  
  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password)
      // Login successful - user will be redirected
    } catch (error) {
      // Error is already set in context
      console.error('Login failed:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

#### `useRequireAuth()`
Redirect to login if not authenticated:

```tsx
import { useRequireAuth } from '@/contexts'

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return null // Will redirect to login
  
  return <div>Protected content</div>
}
```

#### `useRedirectIfAuthenticated()`
Redirect authenticated users away from auth pages:

```tsx
import { useRedirectIfAuthenticated } from '@/contexts'

function LoginPage() {
  const { isAuthenticated, isLoading } = useRedirectIfAuthenticated('/dashboard')
  
  if (isLoading) return <div>Loading...</div>
  if (isAuthenticated) return null // Will redirect to dashboard
  
  return <LoginForm />
}
```

#### `useUserProfile()`
Get formatted user profile information:

```tsx
import { useUserProfile } from '@/contexts'

function UserAvatar() {
  const { displayName, initials, avatarUrl, isLoaded } = useUserProfile()
  
  if (!isLoaded) return null
  
  return (
    <div className="avatar">
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} />
      ) : (
        <div className="initials">{initials}</div>
      )}
    </div>
  )
}
```

## Features

### Automatic Session Management
- Checks authentication status on app initialization
- Validates and refreshes tokens automatically
- Periodic session validation (every 5 minutes)
- Automatic logout on token expiration

### Error Handling
- Comprehensive error handling with user-friendly messages
- Automatic error logging and monitoring
- Error state management in context

### Token Management
- Secure token storage in localStorage
- Automatic token refresh when near expiration
- Token validation and cleanup

### State Management
- Uses React's useReducer for predictable state updates
- Loading states for all async operations
- Error states with clear error messages

## Security Features

- Automatic token validation
- Secure token storage
- Session timeout handling
- Automatic logout on security errors
- CSRF protection considerations

## Development Features

- Mock API integration for development
- Comprehensive error logging
- TypeScript support with full type safety
- Extensive hook library for common use cases