import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { CartItem } from '../../shared/models';

export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    'Load Cart': props<{ uid: string | null }>(),
    'Load Cart Success': props<{ items: CartItem[] }>(),
    'Load Cart Failure': props<{ error: string }>(),
    'Add To Cart': props<{ item: CartItem; uid: string | null }>(),
    'Update Quantity': props<{ productId: string; quantity: number }>(),
    'Remove From Cart': props<{ productId: string; uid: string | null }>(),
    'Remove From Cart Success': props<{ productId: string }>(),
    'Clear Cart': emptyProps(),
    'Save Cart': props<{ uid: string | null }>(),
    'Save Cart Success': emptyProps(),
  },
});
