/**
 * User model for authentication state.
 */
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * Serializable auth error.
 */
export interface AuthError {
  code: string;
  message: string;
}
