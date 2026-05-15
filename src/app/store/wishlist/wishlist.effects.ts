import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { WishlistActions } from './wishlist.actions';
import { AuthActions } from '../auth/auth.actions';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class WishlistEffects {
  private readonly actions$ = inject(Actions);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastService = inject(ToastService);

  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.loadWishlist),
      exhaustMap(({ uid }) =>
        this.wishlistService.loadWishlist(uid).pipe(
          map((items) => WishlistActions.loadWishlistSuccess({ items }))
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
        const uid = 'user' in action && action.user ? action.user.uid : null;
        return WishlistActions.loadWishlist({ uid });
      })
    )
  );

  readonly add$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.addToWishlist),
      exhaustMap(({ item, uid }) =>
        this.wishlistService.addItem(uid, item).pipe(
          map(() => WishlistActions.addToWishlistSuccess({ item }))
        )
      )
    )
  );

  readonly remove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.removeFromWishlist),
      exhaustMap(({ productId, uid }) =>
        this.wishlistService.removeItem(uid, productId).pipe(
          map(() => WishlistActions.removeFromWishlistSuccess({ productId }))
        )
      )
    )
  );

  readonly toastOnAdd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.addToWishlist),
      tap(({ item }: any) => this.toastService.success(`Added ${item.name} to wishlist`))
    ),
    { dispatch: false }
  );
}
