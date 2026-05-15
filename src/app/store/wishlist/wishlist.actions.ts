import { createActionGroup, props } from '@ngrx/store';
import type { WishlistItem } from '../../shared/models';

export const WishlistActions = createActionGroup({
  source: 'Wishlist',
  events: {
    'Load Wishlist': props<{ uid: string | null }>(),
    'Load Wishlist Success': props<{ items: WishlistItem[] }>(),
    'Add To Wishlist': props<{ item: WishlistItem; uid: string | null }>(),
    'Add To Wishlist Success': props<{ item: WishlistItem }>(),
    'Remove From Wishlist': props<{ productId: string; uid: string | null }>(),
    'Remove From Wishlist Success': props<{ productId: string }>(),
  },
});
