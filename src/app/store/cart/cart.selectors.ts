import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>('cart');
export const selectCartItems = createSelector(selectCartState, (s) => s.items);
export const selectCartLoading = createSelector(selectCartState, (s) => s.loading);
export const selectCartCount = createSelector(selectCartItems, (items) => items.reduce((sum, i) => sum + i.quantity, 0));
export const selectCartTotal = createSelector(selectCartItems, (items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0));
