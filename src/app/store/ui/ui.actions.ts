import { createActionGroup, emptyProps, props } from '@ngrx/store';

/**
 * UI actions for global layout state: sidebar, theme, loading overlays, toasts.
 */
export const UiActions = createActionGroup({
  source: 'UI',
  events: {
    'Toggle Sidebar': emptyProps(),
    'Set Sidebar Open': props<{ isOpen: boolean }>(),
    'Set Theme': props<{ theme: 'light' | 'dark' }>(),
    'Toggle Theme': emptyProps(),
    'Show Global Loading': emptyProps(),
    'Hide Global Loading': emptyProps(),
    'Show Toast': props<{ message: string; toastType: 'success' | 'error' | 'info' | 'warning' }>(),
    'Dismiss Toast': emptyProps(),
  },
});
