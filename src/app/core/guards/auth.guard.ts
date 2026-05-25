import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, filter } from 'rxjs/operators';
import { selectIsAuthenticated, selectAuthLoading } from '../../store/auth/auth.selectors';
import { ToastService } from '../../shared/components/toast/toast.service';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const toast = inject(ToastService);

  // We wait for authLoading to be false to ensure Firebase has initialized
  return store.select(selectAuthLoading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      const isAuthenticated = store.selectSignal(selectIsAuthenticated)();
      if (isAuthenticated) {
        return true;
      }
      toast.show('Please sign in to access your cart, wishlist, or checkout!', 'info');
      return router.createUrlTree(['/login']);
    })
  );
};
