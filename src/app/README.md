# Application Routing Structure

This document outlines the routing structure and authentication flow for the Daily Task Tracker application.

## Route Structure

### Public Routes
- `/login` - Login page for user authentication
- `/` - Root page that redirects based on authentication status

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard with task management interface
- `/analytics` - Analytics and reporting page
- `/settings` - Application settings page

## Authentication Flow

### 1. Root Page (`/`)
- Checks user authentication status
- Redirects to `/dashboard` if authenticated
- Redirects to `/login` if not authenticated

### 2. Login Page (`/login`)
- Displays login form for unauthenticated users
- Redirects authenticated users to `/dashboard`
- Handles login form submission and authentication
- Shows loading states and error messages

### 3. Dashboard Page (`/dashboard`)
- Main authenticated landing page
- Requires authentication to access
- Redirects unauthenticated users to `/login`
- Contains the main task management interface

### 4. Other Protected Pages
- All other pages require authentication
- Use `useRequireAuth` hook for protection
- Automatically redirect to login if not authenticated

## Authentication Context Integration

### Root Layout (`/app/layout.tsx`)
```tsx
<ThemeProvider>
  <AuthProvider>
    {children}
  </AuthProvider>
</ThemeProvider>
```

### Authentication Hooks Used
- `useAuth()` - Main authentication context
- `useAuthStatus()` - Authentication status checking
- `useRequireAuth()` - Redirect to login if not authenticated
- `useRedirectIfAuthenticated()` - Redirect away from auth pages
- `useUserProfile()` - User profile information
- `useLogout()` - Logout functionality

## Navigation Components

### Navbar Integration
- Shows navigation links only for authenticated users
- Displays user profile information and logout option
- Uses authentication hooks for conditional rendering
- Handles logout functionality

### Route Protection Patterns

#### Protected Page Pattern
```tsx
'use client'

import { useRequireAuth } from '@/contexts'

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <PageContent />
}
```

#### Auth Page Pattern (Login)
```tsx
'use client'

import { useRedirectIfAuthenticated } from '@/contexts'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useRedirectIfAuthenticated('/dashboard')

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return <LoginForm />
}
```

## Redirect Logic

### After Login Success
1. Check for stored redirect path in sessionStorage
2. Redirect to stored path or default to `/dashboard`
3. Clear stored redirect path

### After Logout
1. Clear all authentication data
2. Redirect to `/login`

### Unauthorized Access
1. Store current path in sessionStorage
2. Redirect to `/login`
3. After successful login, redirect back to stored path

## Session Management

### Automatic Session Validation
- Periodic session validation (every 5 minutes)
- Automatic token refresh when near expiration
- Automatic logout on token expiration

### Token Storage
- JWT tokens stored in localStorage
- Refresh tokens for automatic renewal
- Secure token validation and cleanup

## Error Handling

### Authentication Errors
- Network errors with retry suggestions
- Invalid credentials with user-friendly messages
- Token expiration with automatic logout
- Validation errors with field-specific feedback

### Route Protection Errors
- Graceful handling of authentication failures
- Fallback UI for error states
- Proper error logging and monitoring

## Development Features

### Mock Authentication
- Demo login credentials for development
- Mock API endpoints for testing
- Development-only features and debugging

### Testing Routes
- `/components/auth/login-form-test` - Isolated login form testing
- Authentication test components for development

## Security Considerations

### Client-Side Protection
- Route guards using authentication hooks
- Conditional rendering based on auth status
- Automatic redirects for unauthorized access

### Token Security
- Secure token storage and validation
- Automatic token refresh and cleanup
- Session timeout handling

### CSRF Protection
- Proper request headers and validation
- Secure API endpoint configuration
- Input sanitization and validation