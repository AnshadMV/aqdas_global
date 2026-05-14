import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.reducer';

/**
 * UI selectors for layout state consumption in components.
 */
export const selectUiState = createFeatureSelector<UiState>('ui');

export const selectSidebarOpen = createSelector(
  selectUiState,
  (state) => state.sidebarOpen
);

export const selectTheme = createSelector(
  selectUiState,
  (state) => state.theme
);

export const selectIsDarkTheme = createSelector(
  selectTheme,
  (theme) => theme === 'dark'
);

export const selectGlobalLoading = createSelector(
  selectUiState,
  (state) => state.globalLoading
);

export const selectToast = createSelector(
  selectUiState,
  (state) => state.toast
);
