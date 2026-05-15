import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  host: { 'class': 'block' },
  template: `
    <section class="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-secondary via-cream to-secondary px-6 py-16">
      <div class="w-full max-w-md">
        <div class="glass rounded-3xl p-10 shadow-2xl border border-white/30">
          <div class="text-center mb-8">
            <h1 class="font-heading text-3xl font-bold text-dark mb-2">Reset Password</h1>
            <p class="font-body text-dark/50 text-sm">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          @if (isSuccess()) {
            <div class="bg-green-50 border border-green-200 rounded-xl p-5 text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" class="mx-auto mb-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <h3 class="font-heading font-bold text-dark mb-1">Check your email</h3>
              <p class="font-body text-sm text-dark/60">We've sent a password reset link to <span class="font-semibold">{{ email }}</span>.</p>
            </div>
            <a routerLink="/login" class="block w-full text-center bg-white border border-dark/10 hover:bg-cream text-dark font-body font-semibold py-3.5 rounded-xl transition-all duration-300">
              Back to Login
            </a>
          } @else {
            <form (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label for="reset-email" class="block font-body text-sm font-medium text-dark/70 mb-1.5">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="you&#64;example.com"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 bg-white/50 font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              @if (authError()) {
                <p class="text-red-500 text-sm font-body bg-red-50 p-3 rounded-xl">{{ authError()?.message }}</p>
              }

              <button
                type="submit"
                [disabled]="loading() || !email"
                class="w-full bg-primary hover:bg-primary-dark text-white font-body font-semibold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
              >
                {{ loading() ? 'Sending link...' : 'Send Reset Link' }}
              </button>
            </form>

            <p class="text-center mt-6 font-body text-sm text-dark/50">
              Remember your password?
              <a routerLink="/login" class="text-primary font-semibold hover:underline">Sign in</a>
            </p>
          }
        </div>
      </div>
    </section>
  `,
})
export class ForgotPasswordComponent {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  email = '';
  readonly loading = this.store.selectSignal(selectAuthLoading);
  readonly authError = this.store.selectSignal(selectAuthError);
  readonly isSuccess = signal(false);

  constructor() {
    this.actions$.pipe(
      ofType(AuthActions.forgotPasswordSuccess),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isSuccess.set(true);
    });
  }

  onSubmit(): void {
    if (this.email) {
      this.isSuccess.set(false);
      this.store.dispatch(AuthActions.forgotPassword({ email: this.email }));
    }
  }
}
