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
  styles: `
    .auth-section {
      min-height: 85vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-cream) 50%, var(--theme-secondary) 100%);
      position: relative; overflow: hidden; padding: 4rem 1.5rem;
    }
    .auth-blob-1 { position: absolute; top: -15%; left: -10%; width: 50%; height: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 8%, transparent), transparent 70%); filter: blur(100px); pointer-events: none; }
    .auth-blob-2 { position: absolute; bottom: -15%; right: -10%; width: 45%; height: 45%; background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent) 6%, transparent), transparent 70%); filter: blur(120px); pointer-events: none; }

    .auth-card {
      width: 100%; max-width: 28rem; background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(24px);
      border: 1px solid color-mix(in srgb, var(--theme-cream) 90%, transparent); border-radius: 2rem; padding: 2.5rem;
      box-shadow: 0 24px 48px -12px color-mix(in srgb, var(--theme-dark) 12%, transparent); position: relative; z-index: 10;
      animation: cardEnter 0.6s cubic-bezier(0.22,1,0.36,1);
    }
    @media (min-width: 640px) { .auth-card { padding: 3rem; } }
    @keyframes cardEnter { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .auth-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent); border-radius: 2rem 2rem 0 0; }

    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-title { font-size: 1.875rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; margin-bottom: 0.5rem; font-family: var(--theme-font-headings); }
    .auth-subtitle { font-size: 0.9rem; color: var(--theme-dark-light); line-height: 1.5; }

    .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-label { font-size: 0.8rem; font-weight: 600; color: var(--theme-dark-light); }
    .form-input {
      width: 100%; padding: 0.9rem 1.125rem; background: color-mix(in srgb, var(--theme-cream) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-radius: 1rem;
      font-size: 0.9rem; color: var(--theme-dark); outline: none; transition: all 0.3s ease;
      font-family: var(--theme-font-base);
    }
    .form-input:focus { border-color: var(--theme-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 8%, transparent); background: var(--theme-cream); }
    .form-input::placeholder { color: color-mix(in srgb, var(--theme-dark-light) 60%, transparent); }

    .error-msg {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1rem; border-radius: 1rem;
      background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15);
      color: #ef4444; font-size: 0.8rem; font-weight: 500; animation: shake 0.4s ease;
    }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

    .btn-primary {
      width: 100%; padding: 1rem; background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light));
      color: var(--theme-white); font-weight: 700; font-size: 0.9rem; border: none; border-radius: 1rem;
      cursor: pointer; transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
      box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--theme-primary) 35%, transparent); position: relative; overflow: hidden;
      font-family: var(--theme-font-base);
    }
    .btn-primary::before { content: ''; position: absolute; top: -50%; left: -60%; width: 25%; height: 200%; background: color-mix(in srgb, var(--theme-white) 20%, transparent); transform: rotate(30deg); transition: none; }
    .btn-primary:hover:not(:disabled)::before { left: 150%; transition: left 1s; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px -8px color-mix(in srgb, var(--theme-primary) 45%, transparent); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-secondary {
      width: 100%; padding: 1rem; background: var(--theme-cream); border: 1px solid color-mix(in srgb, var(--theme-dark) 10%, transparent);
      border-radius: 1rem; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--theme-dark);
      transition: all 0.3s ease; text-align: center; text-decoration: none; display: block;
      font-family: var(--theme-font-base);
    }
    .btn-secondary:hover { background: var(--theme-cream-dark); border-color: color-mix(in srgb, var(--theme-dark) 20%, transparent); transform: translateY(-1px); }

    /* Success State */
    .success-state { text-align: center; animation: fadeIn 0.5s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    .success-icon-wrap {
      width: 5rem; height: 5rem; border-radius: 50%;
      background: linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 10%, transparent), color-mix(in srgb, var(--theme-primary-light) 15%, transparent));
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.5rem; color: var(--theme-primary);
      box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--theme-primary) 20%, transparent);
      animation: iconPop 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both;
    }
    @keyframes iconPop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .success-title { font-size: 1.5rem; font-weight: 800; color: var(--theme-dark); margin-bottom: 0.75rem; letter-spacing: -0.02em; font-family: var(--theme-font-headings); }
    .success-desc { font-size: 0.9rem; color: var(--theme-dark-light); line-height: 1.6; margin-bottom: 2rem; }
    .success-email { font-weight: 700; color: var(--theme-dark); }

    .auth-footer { text-align: center; margin-top: 1.75rem; font-size: 0.85rem; color: var(--theme-dark-light); }
    .auth-footer a { color: var(--theme-primary); font-weight: 700; text-decoration: none; transition: color 0.2s; }
    .auth-footer a:hover { color: var(--theme-primary-dark); text-decoration: underline; }
  `,
  template: `
    <section class="auth-section">
      <div class="auth-blob-1"></div>
      <div class="auth-blob-2"></div>

      <div class="auth-card">
        @if (isSuccess()) {
          <!-- Success State -->
          <div class="success-state">
            <div class="success-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 class="success-title">Check Your Email</h2>
            <p class="success-desc">
              We've sent a password reset link to <span class="success-email">{{ email }}</span>. Please check your inbox and follow the instructions.
            </p>
            <a routerLink="/login" class="btn-secondary">Back to Login</a>
          </div>
        } @else {
          <!-- Form State -->
          <div class="auth-header">
            <h1 class="auth-title">Reset Password</h1>
            <p class="auth-subtitle">Enter your email and we'll send you a link to reset your password</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label for="reset-email" class="form-label">Email Address</label>
              <input id="reset-email" type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com" class="form-input" />
            </div>

            @if (authError()) {
              <div class="error-msg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ authError()?.message }}
              </div>
            }

            <button type="submit" [disabled]="loading() || !email" class="btn-primary">
              {{ loading() ? 'Sending Link...' : 'Send Reset Link' }}
            </button>
          </form>

          <p class="auth-footer">
            Remember your password? <a routerLink="/login">Sign in</a>
          </p>
        }
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