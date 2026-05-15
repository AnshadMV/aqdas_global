import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, filter } from 'rxjs/operators';
import { selectIsAuthenticated, selectAuthLoading } from '../../store/auth/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  // We wait for authLoading to be false to ensure Firebase has initialized
  return store.select(selectAuthLoading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      const isAuthenticated = store.selectSignal(selectIsAuthenticated)();
      if (isAuthenticated) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};
