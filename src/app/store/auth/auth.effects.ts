import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { AuthActions } from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { AuthError } from '../../shared/models';

/**
 * Auth effects handle Firebase Authentication side-effects.
 */
@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);

  readonly login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((user) => AuthActions.loginSuccess({ user })),
          catchError((error: AuthError) =>
            of(AuthActions.loginFailure({ error }))
          )
        )
      )
    )
  );

  readonly register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ email, password, displayName }) =>
        this.authService.register(email, password, displayName).pipe(
          map((user) => AuthActions.registerSuccess({ user })),
          catchError((error: AuthError) =>
            of(AuthActions.registerFailure({ error }))
          )
        )
      )
    )
  );

  readonly logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error: AuthError) =>
            of(AuthActions.logoutFailure({ error }))
          )
        )
      )
    )
  );

  readonly checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      exhaustMap(() =>
        this.authService.getAuthState().pipe(
          map((user) => AuthActions.authStateChanged({ user }))
        )
      )
    )
  );
}
