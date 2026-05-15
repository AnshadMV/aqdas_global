import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { CartActions } from './cart.actions';
import { AuthActions } from '../auth/auth.actions';
import { selectCartItems } from './cart.selectors';
import { selectCurrentUser } from '../auth/auth.selectors';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Injectable()
export class CartEffects {
  private readonly actions$ = inject(Actions);
  private readonly cartService = inject(CartService);
  private readonly store = inject(Store);
  private readonly toastService = inject(ToastService);

  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.loadCart),
      exhaustMap(({ uid }) =>
        this.cartService.loadCart(uid).pipe(
          map((items) => CartActions.loadCartSuccess({ items })),
          catchError((e: Error) => of(CartActions.loadCartFailure({ error: e.message })))
        )
      )
    )
  );

  readonly loadOnAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AuthActions.authStateChanged,
        AuthActions.loginSuccess,
        AuthActions.registerSuccess,
        AuthActions.googleLoginSuccess,
        AuthActions.logoutSuccess
      ),
      map((action) => {
        // user might be inside action.user (for login/register/authStateChanged)
        // or undefined for logoutSuccess
        const uid = 'user' in action && action.user ? action.user.uid : null;
        return CartActions.loadCart({ uid });
      })
    )
  );

  readonly remove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.removeFromCart),
      exhaustMap(({ productId, uid }) =>
        this.cartService.removeItem(uid, productId).pipe(
          map(() => CartActions.removeFromCartSuccess({ productId }))
        )
      )
    )
  );

  readonly saveOnChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CartActions.addToCart,
        CartActions.updateQuantity,
        CartActions.clearCart
      ),
      withLatestFrom(
        this.store.select(selectCartItems),
        this.store.select(selectCurrentUser)
      ),
      exhaustMap(([action, items, user]) =>
        this.cartService.saveCart(user?.uid ?? null, items).pipe(
          map(() => CartActions.saveCartSuccess())
        )
      )
    )
  );

  readonly saveExplicit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.saveCart),
      withLatestFrom(this.store.select(selectCartItems)),
      exhaustMap(([{ uid }, items]) =>
        this.cartService.saveCart(uid, items).pipe(
          map(() => CartActions.saveCartSuccess())
        )
      )
    )
  );

  readonly toastOnAdd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addToCart),
      tap(({ item }: any) => this.toastService.success(`Added ${item.name} to cart`))
    ),
    { dispatch: false }
  );
}
