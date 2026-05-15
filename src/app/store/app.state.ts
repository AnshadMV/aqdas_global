import { ActionReducerMap } from '@ngrx/store';
import type { ProductState } from './product/product.reducer';
import { productReducer } from './product/product.reducer';
import type { AuthState } from './auth/auth.reducer';
import { authReducer } from './auth/auth.reducer';
import type { UiState } from './ui/ui.reducer';
import { uiReducer } from './ui/ui.reducer';
import type { CartState } from './cart/cart.reducer';
import { cartReducer } from './cart/cart.reducer';
import type { WishlistState } from './wishlist/wishlist.reducer';
import { wishlistReducer } from './wishlist/wishlist.reducer';
import type { AdminState } from './admin/admin.reducer';
import { adminReducer } from './admin/admin.reducer';

export interface AppState {
  product: ProductState;
  auth: AuthState;
  ui: UiState;
  cart: CartState;
  wishlist: WishlistState;
  admin: AdminState;
}

export const appReducers: ActionReducerMap<AppState> = {
  product: productReducer,
  auth: authReducer,
  ui: uiReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  admin: adminReducer,
};
