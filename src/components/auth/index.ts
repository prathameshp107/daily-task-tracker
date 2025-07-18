/**
 * Authentication component exports
 */
export { LoginForm } from './login-form'

/**
 * Protected route components
 */
export { ProtectedRoute, withProtectedRoute } from './protected-route'
export { 
  RouteGuard, 
  AuthenticatedRoute, 
  UnauthenticatedRoute, 
  OptionalRoute 
} from './route-guard'

/**
 * Loading components
 */
export { 
  AuthLoading, 
  RouteProtectionLoading, 
  UserVerificationLoading, 
  SessionValidationLoading 
} from './auth-loading'

/**
 * Session management components
 */
export { SessionManager, SessionStatusIndicator } from './session-manager'

/**
 * Example components
 */
export { ProtectionExamples } from './protection-examples'