import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  host: { 'class': 'block' },
  template: `
    <section class="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-secondary via-cream to-secondary px-6 py-16">
      <div class="w-full max-w-md">
        <div class="glass rounded-3xl p-10 shadow-2xl border border-white/30">
          <div class="text-center mb-8">
            <h1 class="font-heading text-3xl font-bold text-dark mb-2">Create Account</h1>
            <p class="font-body text-dark/50 text-sm">Join AQDAS for premium Kerala spices</p>
          </div>

          <form (ngSubmit)="onRegister()" class="space-y-5">
            <div>
              <label for="reg-name" class="block font-body text-sm font-medium text-dark/70 mb-1.5">Full Name</label>
              <input id="reg-name" type="text" [(ngModel)]="displayName" name="displayName" required
                placeholder="Your name"
                class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white/50 font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div>
              <label for="reg-email" class="block font-body text-sm font-medium text-dark/70 mb-1.5">Email</label>
              <input id="reg-email" type="email" [(ngModel)]="email" name="email" required
                placeholder="you&#64;example.com"
                class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white/50 font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div>
              <label for="reg-password" class="block font-body text-sm font-medium text-dark/70 mb-1.5">Password</label>
              <input id="reg-password" type="password" [(ngModel)]="password" name="password" required minlength="6"
                placeholder="Min 6 characters"
                class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white/50 font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>

            @if (authError()) {
              <p class="text-red-500 text-sm font-body bg-red-50 p-3 rounded-xl">{{ authError()?.message }}</p>
            }

            <button type="submit" [disabled]="loading()"
              class="w-full bg-primary hover:bg-primary-dark text-black font-body font-semibold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50">
              {{ loading() ? 'Creating...' : 'Create Account' }}
            </button>
          </form>

          <p class="text-center mt-6 font-body text-sm text-dark/50">
            Already have an account?
            <a routerLink="/login" class="text-primary font-semibold hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  private readonly store = inject(Store);

  displayName = '';
  email = '';
  password = '';

  readonly loading = this.store.selectSignal(selectAuthLoading);
  readonly authError = this.store.selectSignal(selectAuthError);

  onRegister(): void {
    if (this.email && this.password && this.displayName) {
      this.store.dispatch(AuthActions.register({ email: this.email, password: this.password, displayName: this.displayName }));
    }
  }
}
