import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { WishlistState } from './wishlist.reducer';

export const selectWishlistState = createFeatureSelector<WishlistState>('wishlist');
export const selectWishlistItems = createSelector(selectWishlistState, (s) => s.items);
export const selectWishlistCount = createSelector(selectWishlistItems, (items) => items.length);
export const selectIsInWishlist = (productId: string) =>
  createSelector(selectWishlistItems, (items) => items.some((i) => i.productId === productId));
