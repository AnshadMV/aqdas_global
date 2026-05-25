/**
 * User model for authentication state.
 */
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: 'admin' | 'user';
  userType?: 'normal' | 'wholesale';
  phoneNumber?: string;
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
  };
}

/**
 * Serializable auth error.
 */
export interface AuthError {
  code: string;
  message: string;
}
