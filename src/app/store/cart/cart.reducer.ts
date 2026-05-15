import { createReducer, on } from '@ngrx/store';
import type { CartItem } from '../../shared/models';
import { CartActions } from './cart.actions';

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

export const initialCartState: CartState = { items: [], loading: false, error: null };

export const cartReducer = createReducer(
  initialCartState,

  on(CartActions.loadCart, (state) => ({ ...state, loading: true })),
  on(CartActions.loadCartSuccess, (state, { items }) => ({ ...state, items, loading: false })),
  on(CartActions.loadCartFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(CartActions.addToCart, (state, { item }) => {
    const existing = state.items.find((i) => i.productId === item.productId);
    if (existing) {
      return { ...state, items: state.items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i) };
    }
    return { ...state, items: [...state.items, item] };
  }),

  on(CartActions.updateQuantity, (state, { productId, quantity }) => ({
    ...state,
    items: quantity <= 0
      ? state.items.filter((i) => i.productId !== productId)
      : state.items.map((i) => i.productId === productId ? { ...i, quantity } : i),
  })),

  on(CartActions.removeFromCartSuccess, (state, { productId }) => ({
    ...state,
    items: state.items.filter((i) => i.productId !== productId),
  })),

  on(CartActions.clearCart, (state) => ({ ...state, items: [] })),
);
