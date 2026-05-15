import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, filter } from 'rxjs/operators';
import { selectCurrentUser, selectAuthLoading } from '../../store/auth/auth.selectors';

export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthLoading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      const user = store.selectSignal(selectCurrentUser)();
      
      if (user?.role === 'admin') {
        return true;
      }
      
      if (user) {
        // Logged in but not an admin
        return router.createUrlTree(['/']);
      }
      
      return router.createUrlTree(['/login']);
    })
  );
};
