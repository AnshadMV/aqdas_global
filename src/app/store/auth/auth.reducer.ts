import { createReducer, on } from '@ngrx/store';
import { User, AuthError } from '../../shared/models';
import { AuthActions } from './auth.actions';

/**
 * Auth state tracks the current user, loading state, and any auth errors.
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const authReducer = createReducer(
  initialAuthState,

  // ── Login ────────────────────────────────────────────────
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    isAuthenticated: true,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Register ─────────────────────────────────────────────
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    isAuthenticated: true,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Logout ───────────────────────────────────────────────
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState,
  })),
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Auth State Check ─────────────────────────────────────
  on(AuthActions.checkAuth, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.authStateChanged, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    isAuthenticated: !!user,
  })),

  // ── Clear Error ──────────────────────────────────────────
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  }))
);
