import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: { class: 'block min-h-screen' },
  template: `
    <div class="flex h-screen bg-secondary/20 overflow-hidden">

      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 bg-dark/50 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside
        class="fixed lg:relative z-40 flex flex-col h-full w-64 bg-white border-r border-dark/10 transition-transform duration-300 ease-in-out"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
        [class.lg:translate-x-0]="true"
        aria-label="Admin sidebar">

        <!-- Logo -->
        <div class="p-6 border-b border-dark/10 flex items-center justify-between">
          <a routerLink="/" class="font-heading text-2xl font-bold text-primary flex items-center gap-2">
            AQDAS
            <span class="text-xs font-body font-bold bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wide">Admin</span>
          </a>
          <button (click)="sidebarOpen.set(false)" class="lg:hidden p-1.5 rounded-lg text-dark/40 hover:bg-secondary" aria-label="Close sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Admin navigation">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="bg-primary/10 text-primary font-semibold"
              [routerLinkActiveOptions]="{ exact: false }"
              (click)="sidebarOpen.set(false)"
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body text-sm font-medium text-dark/60 hover:bg-secondary hover:text-dark">
              <span class="w-5 h-5 flex-shrink-0" [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          }

          <div class="pt-4 border-t border-dark/10 mt-4">
            <a routerLink="/" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body text-sm font-medium text-dark/60 hover:bg-secondary hover:text-dark">
              <span class="w-5 h-5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              View Store
            </a>
          </div>
        </nav>

        <!-- User + Logout -->
        <div class="p-4 border-t border-dark/10">
          @if (user()) {
            <div class="flex items-center gap-3 px-2 mb-3">
              <div class="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold font-heading text-sm flex-shrink-0">
                {{ (user()!.displayName || user()!.email || 'A').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="font-body font-semibold text-dark text-sm truncate">{{ user()!.displayName ?? 'Admin' }}</p>
                <p class="font-body text-xs text-dark/50 truncate">{{ user()!.email }}</p>
              </div>
            </div>
          }
          <button (click)="logout()"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-body text-sm font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="bg-white border-b border-dark/10 h-16 px-6 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
          <div class="flex items-center gap-4">
            <!-- Hamburger for mobile -->
            <button (click)="sidebarOpen.set(true)" class="lg:hidden p-2 rounded-xl text-dark/50 hover:bg-secondary transition-all" aria-label="Open sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h2 class="font-heading text-lg font-bold text-dark">Admin Portal</h2>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold font-heading text-sm">
              {{ (user()?.displayName || user()?.email || 'A').charAt(0).toUpperCase() }}
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-y-auto p-6 lg:p-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly store = inject(Store);
  readonly sidebarOpen = signal(false);
  readonly user = this.store.selectSignal(selectCurrentUser);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    },
    {
      label: 'Products',
      route: '/admin/products',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    },
    {
      label: 'Orders',
      route: '/admin/orders',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    },
    {
      label: 'Customers',
      route: '/admin/customers',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
  ];

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
