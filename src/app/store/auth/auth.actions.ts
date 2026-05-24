import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User, AuthError } from '../../shared/models';

/**
 * Auth actions for login, logout, registration, and session management.
 */
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    /** Email/password login */
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: AuthError }>(),

    /** Google login */
    'Google Login': emptyProps(),
    'Google Login Success': props<{ user: User }>(),
    'Google Login Failure': props<{ error: AuthError }>(),

    /** Registration */
    'Register': props<{ email: string; password: string; displayName: string }>(),
    'Register Success': props<{ user: User }>(),
    'Register Failure': props<{ error: AuthError }>(),

    /** Logout */
    'Logout': emptyProps(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: AuthError }>(),

    /** Forgot Password */
    'Forgot Password': props<{ email: string }>(),
    'Forgot Password Success': emptyProps(),
    'Forgot Password Failure': props<{ error: AuthError }>(),

    /** Check existing auth state on app init */
    'Check Auth': emptyProps(),
    'Auth State Changed': props<{ user: User | null }>(),

    /** Update Profile details */
    'Update Profile': props<{ displayName?: string; photoURL?: string; phoneNumber?: string; shippingAddress?: any }>(),
    'Update Profile Success': props<{ user: User }>(),
    'Update Profile Failure': props<{ error: AuthError }>(),

    /** Clear auth errors */
    'Clear Auth Error': emptyProps(),
  },
});
