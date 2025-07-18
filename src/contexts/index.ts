/**
 * Authentication context exports
 */
export { AuthProvider, useAuth, withAuth } from './auth-context'

/**
 * Authentication hooks exports
 */
export {
  useAuthStatus,
  useCurrentUser,
  useAuthActions,
  useAuthError,
  useRequireAuth,
  useRedirectIfAuthenticated,
  useLogin,
  useLogout,
  useUserProfile,
} from '../hooks/use-auth'