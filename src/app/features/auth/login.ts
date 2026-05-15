import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  host: { 'class': 'block' },
  template: `
    <section class="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-secondary via-cream to-secondary px-6 py-16">
      <div class="w-full max-w-md">
        <div class="glass rounded-3xl p-10 shadow-2xl border border-white/30">
          <div class="text-center mb-8">
            <h1 class="font-heading text-3xl font-bold text-dark mb-2">Welcome Back</h1>
            <p class="font-body text-dark/50 text-sm">Sign in to your AQDAS account</p>
          </div>

          <form (ngSubmit)="onLogin()" class="space-y-5">
            <div>
              <label for="login-email" class="block font-body text-sm font-medium text-dark/70 mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="you&#64;example.com"
                class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white/50 font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="login-password" class="block font-body text-sm font-medium text-dark/70">Password</label>
                <a routerLink="/forgot-password" class="font-body text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <input
                id="login-password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••"
                class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white/50 font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            @if (authError()) {
              <p class="text-red-500 text-sm font-body bg-red-50 p-3 rounded-xl">{{ authError()?.message }}</p>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-primary hover:bg-primary-dark text-black font-body font-semibold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
            >
              {{ loading() ? 'Signing in...' : 'Sign In' }}
            </button>

            <div class="relative flex items-center py-2">
              <div class="flex-grow border-t border-dark/10"></div>
              <span class="flex-shrink-0 mx-4 font-body text-xs text-dark/40 uppercase tracking-wider">or</span>
              <div class="flex-grow border-t border-dark/10"></div>
            </div>

            <button
              type="button"
              (click)="onGoogleLogin()"
              [disabled]="loading()"
              class="w-full bg-white border border-dark/10 hover:bg-cream text-dark font-body font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </button>
          </form>

          <p class="text-center mt-6 font-body text-sm text-dark/50">
            Don't have an account?
            <a routerLink="/register" class="text-primary font-semibold hover:underline">Create one</a>
          </p>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  email = '';
  password = '';

  readonly loading = this.store.selectSignal(selectAuthLoading);
  readonly authError = this.store.selectSignal(selectAuthError);

  onLogin(): void {
    if (this.email && this.password) {
      this.store.dispatch(AuthActions.login({ email: this.email, password: this.password }));
    }
  }

  onGoogleLogin(): void {
    this.store.dispatch(AuthActions.googleLogin());
  }
}
