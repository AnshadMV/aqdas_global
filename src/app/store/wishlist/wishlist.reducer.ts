import { createReducer, on } from '@ngrx/store';
import type { WishlistItem } from '../../shared/models';
import { WishlistActions } from './wishlist.actions';

export interface WishlistState { items: WishlistItem[]; loading: boolean; }
export const initialWishlistState: WishlistState = { items: [], loading: false };

export const wishlistReducer = createReducer(
  initialWishlistState,
  on(WishlistActions.loadWishlist, (s) => ({ ...s, loading: true })),
  on(WishlistActions.loadWishlistSuccess, (s, { items }) => ({ ...s, items, loading: false })),
  on(WishlistActions.addToWishlistSuccess, (s, { item }) => {
    if (s.items.find((i) => i.productId === item.productId)) return s;
    return { ...s, items: [...s.items, item] };
  }),
  on(WishlistActions.removeFromWishlistSuccess, (s, { productId }) => ({
    ...s, items: s.items.filter((i) => i.productId !== productId),
  })),
);
