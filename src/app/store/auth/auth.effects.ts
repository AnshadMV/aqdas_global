import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { AuthActions } from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import type { AuthError } from '../../shared/models';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from './auth.selectors';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly store = inject(Store);

  readonly login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((user) => AuthActions.loginSuccess({ user })),
          catchError((error: AuthError) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  readonly googleLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleLogin),
      exhaustMap(() =>
        this.authService.googleLogin().pipe(
          map((user) => AuthActions.googleLoginSuccess({ user })),
          catchError((error: AuthError) => of(AuthActions.googleLoginFailure({ error })))
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
          catchError((error: AuthError) => of(AuthActions.registerFailure({ error })))
        )
      )
    )
  );

  /** Navigate home and show toast on successful login/register */
  readonly loginRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess, AuthActions.googleLoginSuccess),
        tap(({ user }) => {
          if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
            this.toastService.success('Welcome back, Admin!');
          } else {
            this.router.navigate(['/']);
            this.toastService.success('Successfully signed in!');
          }
        })
      ),
    { dispatch: false }
  );

  readonly toastOnLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => this.toastService.info('You have been signed out'))
      ),
    { dispatch: false }
  );

  readonly toastOnAuthError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.googleLoginFailure),
        tap(({ error }) => this.toastService.error(error.message || 'Authentication failed'))
      ),
    { dispatch: false }
  );

  readonly logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error: AuthError) => of(AuthActions.logoutFailure({ error })))
        )
      )
    )
  );

  readonly forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      exhaustMap(({ email }) =>
        this.authService.forgotPassword(email).pipe(
          map(() => AuthActions.forgotPasswordSuccess()),
          catchError((error: AuthError) => of(AuthActions.forgotPasswordFailure({ error })))
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

  readonly updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      withLatestFrom(this.store.select(selectCurrentUser)),
      exhaustMap(([action, currentUser]) => {
        if (!currentUser) {
          return of(AuthActions.updateProfileFailure({ 
            error: { code: 'no-user', message: 'No authenticated user found' } 
          }));
        }
        
        const { displayName, photoURL, phoneNumber, shippingAddress } = action;
        
        return this.authService.updateUserProfile(currentUser.uid, {
          displayName,
          photoURL,
          phoneNumber,
          shippingAddress
        }).pipe(
          map(() => {
            const updatedUser = {
              ...currentUser,
              displayName: displayName !== undefined ? displayName : currentUser.displayName,
              photoURL: photoURL !== undefined ? photoURL : currentUser.photoURL,
              phoneNumber: phoneNumber !== undefined ? phoneNumber : currentUser.phoneNumber,
              shippingAddress: shippingAddress !== undefined ? shippingAddress : currentUser.shippingAddress
            };
            return AuthActions.updateProfileSuccess({ user: updatedUser });
          }),
          catchError((error: AuthError) => of(AuthActions.updateProfileFailure({ error })))
        );
      })
    )
  );

  readonly toastOnUpdateProfileSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.updateProfileSuccess),
        tap(() => this.toastService.success('Profile updated successfully!'))
      ),
    { dispatch: false }
  );

  readonly toastOnUpdateProfileFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.updateProfileFailure),
        tap(({ error }) => this.toastService.error(error.message || 'Failed to update profile'))
      ),
    { dispatch: false }
  );
}
