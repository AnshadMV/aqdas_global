import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  host: { 'class': 'block' },
  styles: `
    /* ─── Background & Ambient ─── */
    .auth-section {
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-cream-dark) 50%, var(--theme-secondary) 100%);
      position: relative;
      overflow: hidden;
      padding: 4rem 1.5rem;
    }

    .auth-blob-1 {
      position: absolute; top: -15%; left: -10%; width: 50%; height: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 8%, transparent), transparent 70%);
      filter: blur(100px); pointer-events: none;
    }

    .auth-blob-2 {
      position: absolute; bottom: -15%; right: -10%; width: 45%; height: 45%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent) 6%, transparent), transparent 70%);
      filter: blur(120px); pointer-events: none;
    }

    /* ─── Glass Card ─── */
    .auth-card {
      width: 100%; max-width: 28rem;
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid color-mix(in srgb, var(--theme-cream) 90%, transparent);
      border-radius: 2rem;
      padding: 2.5rem;
      box-shadow: 0 24px 48px -12px color-mix(in srgb, var(--theme-dark) 12%, transparent);
      position: relative;
      z-index: 10;
      animation: cardEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @media (min-width: 640px) { .auth-card { padding: 3rem; } }

    @keyframes cardEnter {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .auth-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent);
      border-radius: 2rem 2rem 0 0;
    }

    /* ─── Header ─── */
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-title { font-size: 1.875rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .auth-subtitle { font-size: 0.9rem; color: var(--theme-dark-light); line-height: 1.5; }

    /* ─── Form ─── */
    .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-label-row { display: flex; justify-content: space-between; align-items: center; }
    .form-label { font-size: 0.8rem; font-weight: 600; color: var(--theme-dark-light); }
    .forgot-link { font-size: 0.75rem; font-weight: 600; color: var(--theme-primary); text-decoration: none; transition: color 0.2s; }
    .forgot-link:hover { color: var(--theme-primary-dark); text-decoration: underline; }

    .form-input {
      width: 100%; padding: 0.9rem 1.125rem;
      background: color-mix(in srgb, var(--theme-cream) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 1rem;
      font-size: 0.9rem; color: var(--theme-dark);
      outline: none; transition: all 0.3s ease;
    }
    .form-input:focus {
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 8%, transparent);
      background: var(--theme-cream);
    }
    .form-input::placeholder { color: color-mix(in srgb, var(--theme-dark-light) 60%, transparent); }

    /* ─── Error ─── */
    .error-msg {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.875rem 1rem; border-radius: 1rem;
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: #ef4444; font-size: 0.8rem; font-weight: 500;
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    /* ─── Buttons ─── */
    .btn-primary {
      width: 100%; padding: 1rem;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff; font-weight: 700; font-size: 0.9rem;
      border: none; border-radius: 1rem; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--theme-primary) 35%, transparent);
      position: relative; overflow: hidden;
    }
    .btn-primary::before {
      content: ''; position: absolute; top: -50%; left: -60%; width: 25%; height: 200%;
      background: rgba(255,255,255,0.2); transform: rotate(30deg); transition: none;
    }
    .btn-primary:hover:not(:disabled)::before { left: 150%; transition: left 1s; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px -8px color-mix(in srgb, var(--theme-primary) 45%, transparent); }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ─── Divider ─── */
    .divider { display: flex; align-items: center; gap: 1rem; margin: 0.5rem 0; }
    .divider-line { flex: 1; height: 1px; background: color-mix(in srgb, var(--theme-dark) 8%, transparent); }
    .divider-text { font-size: 0.7rem; font-weight: 600; color: color-mix(in srgb, var(--theme-dark-light) 60%, transparent); text-transform: uppercase; letter-spacing: 0.1em; }

    /* ─── Google Button ─── */
    .btn-google {
      width: 100%; padding: 0.9rem;
      background: var(--theme-cream); border: 1px solid color-mix(in srgb, var(--theme-dark) 10%, transparent);
      border-radius: 1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      font-weight: 600; font-size: 0.9rem; color: var(--theme-dark);
      transition: all 0.3s ease;
    }
    .btn-google:hover:not(:disabled) { background: var(--theme-cream-dark); border-color: color-mix(in srgb, var(--theme-dark) 20%, transparent); transform: translateY(-1px); box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--theme-dark) 8%, transparent); }
    .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ─── Footer Link ─── */
    .auth-footer { text-align: center; margin-top: 1.75rem; font-size: 0.85rem; color: var(--theme-dark-light); }
    .auth-footer a { color: var(--theme-primary); font-weight: 700; text-decoration: none; transition: color 0.2s; }
    .auth-footer a:hover { color: var(--theme-primary-dark); text-decoration: underline; }
  `,
  template: `
    <section class="auth-section">
      <div class="auth-blob-1"></div>
      <div class="auth-blob-2"></div>

      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to access your premium spice collection</p>
        </div>

        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="login-email" class="form-label">Email Address</label>
            <input id="login-email" type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com" class="form-input" />
          </div>

          <div class="form-group">
            <div class="form-label-row">
              <label for="login-password" class="form-label">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>
            <input id="login-password" type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" class="form-input" />
          </div>

          @if (authError()) {
            <div class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ authError()?.message }}
            </div>
          }

          <button type="submit" [disabled]="loading()" class="btn-primary">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">or</span>
          <span class="divider-line"></span>
        </div>

        <button type="button" (click)="onGoogleLogin()" [disabled]="loading()" class="btn-google">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/register">Create one</a>
        </p>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private readonly store = inject(Store);
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