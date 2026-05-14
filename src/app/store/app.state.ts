import { ActionReducerMap } from '@ngrx/store';
import { ProductState, productReducer } from './product/product.reducer';
import { AuthState, authReducer } from './auth/auth.reducer';
import { UiState, uiReducer } from './ui/ui.reducer';

/**
 * Root application state interface.
 * Every feature slice is typed here for full type safety across the app.
 */
export interface AppState {
  product: ProductState;
  auth: AuthState;
  ui: UiState;
}

/**
 * Root reducer map — maps each state key to its reducer.
 */
export const appReducers: ActionReducerMap<AppState> = {
  product: productReducer,
  auth: authReducer,
  ui: uiReducer,
};
