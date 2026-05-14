import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

/**
 * Auth selectors for consuming auth state in components and guards.
 */
export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserDisplayName = createSelector(
  selectCurrentUser,
  (user) => user?.displayName ?? 'Guest'
);

export const selectUserEmail = createSelector(
  selectCurrentUser,
  (user) => user?.email ?? null
);
