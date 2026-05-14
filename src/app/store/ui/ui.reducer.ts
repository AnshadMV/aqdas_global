import { createReducer, on } from '@ngrx/store';
import { UiActions } from './ui.actions';

/**
 * UI state for global layout concerns.
 */
export interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  globalLoading: boolean;
  toast: { message: string; toastType: 'success' | 'error' | 'info' | 'warning' } | null;
}

export const initialUiState: UiState = {
  sidebarOpen: false,
  theme: 'light',
  globalLoading: false,
  toast: null,
};

export const uiReducer = createReducer(
  initialUiState,

  on(UiActions.toggleSidebar, (state) => ({
    ...state,
    sidebarOpen: !state.sidebarOpen,
  })),

  on(UiActions.setSidebarOpen, (state, { isOpen }) => ({
    ...state,
    sidebarOpen: isOpen,
  })),

  on(UiActions.setTheme, (state, { theme }) => ({
    ...state,
    theme,
  })),

  on(UiActions.toggleTheme, (state) => ({
    ...state,
    theme: state.theme === 'light' ? 'dark' : 'light',
  })),

  on(UiActions.showGlobalLoading, (state) => ({
    ...state,
    globalLoading: true,
  })),

  on(UiActions.hideGlobalLoading, (state) => ({
    ...state,
    globalLoading: false,
  })),

  on(UiActions.showToast, (state, { message, toastType }) => ({
    ...state,
    toast: { message, toastType },
  })),

  on(UiActions.dismissToast, (state) => ({
    ...state,
    toast: null,
  }))
);
