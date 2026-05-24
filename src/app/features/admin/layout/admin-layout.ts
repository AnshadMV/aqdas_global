import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { SettingsService } from '../../../core/services/settings.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NavItem {
  label: string;
  route: string;
  icon: string | SafeHtml;
}

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: { class: 'block min-h-screen' },
  styles: `
    /* ─── Base & Ambient ─── */
    .admin-shell {
      display: flex;
      height: 100vh;
      background: var(--theme-secondary);
      color: var(--theme-dark);
      overflow: hidden;
      position: relative;
      font-family: var(--theme-font-base);
    }

    .shell-blob {
      position: absolute;
      top: -10%; right: -5%; width: 40%; height: 40%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 4%, transparent), transparent 70%);
      filter: blur(120px); pointer-events: none; z-index: 0;
    }

    /* ─── Mobile Overlay ─── */
    .mobile-overlay {
      position: fixed; inset: 0; z-index: 30;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ─── Sidebar ─── */
    .sidebar {
      position: fixed; left: 0; top: 0; bottom: 0; z-index: 40;
      width: 17rem; display: flex; flex-direction: column;
      background: color-mix(in srgb, var(--theme-cream) 92%, transparent);
      backdrop-filter: blur(24px);
      border-right: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @media (min-width: 1024px) {
      .sidebar { position: relative; transform: translateX(0) !important; }
    }

    .sidebar.closed { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }

    /* Logo Area */
    .logo-area {
      padding: 1.5rem; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
    }

    .logo-link {
      display: flex; align-items: center; gap: 0.75rem; text-decoration: none;
    }

    .logo-text { font-size: 1.5rem; font-weight: 800; color: var(--theme-primary); letter-spacing: -0.02em; }
    .logo-badge {
      font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
      background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary);
      padding: 0.25rem 0.6rem; border-radius: 100px;
    }

    .close-sidebar-btn {
      display: flex; align-items: center; justify-content: center;
      width: 2rem; height: 2rem; border-radius: 0.5rem;
      border: none; background: transparent; color: var(--theme-dark-light); cursor: pointer;
      transition: all 0.2s;
    }
    .close-sidebar-btn:hover { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); color: var(--theme-dark); }
    @media (min-width: 1024px) { .close-sidebar-btn { display: none; } }

    /* Navigation */
    .nav-area {
      flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.25rem;
    }

    .nav-link {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.75rem 1rem; border-radius: 1rem;
      font-size: 0.875rem; font-weight: 600; color: var(--theme-dark-light);
      text-decoration: none; transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative; overflow: hidden;
    }

    .nav-link::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
      background: linear-gradient(to bottom, var(--theme-primary), var(--theme-primary-dark));
      border-radius: 0 3px 3px 0; opacity: 0; transform: scaleY(0);
      transition: all 0.3s ease;
    }

    .nav-link:hover { background: color-mix(in srgb, var(--theme-primary) 6%, transparent); color: var(--theme-primary); transform: translateX(2px); }
    .nav-link:hover .nav-icon-wrap { background: color-mix(in srgb, var(--theme-primary) 12%, transparent); color: var(--theme-primary); }

    .nav-link.active {
      background: linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 8%, transparent), color-mix(in srgb, var(--theme-primary) 12%, transparent));
      color: var(--theme-primary); font-weight: 700;
    }
    .nav-link.active::before { opacity: 1; transform: scaleY(1); }
    .nav-link.active .nav-icon-wrap { background: color-mix(in srgb, var(--theme-primary) 15%, transparent); color: var(--theme-primary); }

    .nav-icon-wrap {
      width: 2.25rem; height: 2.25rem; border-radius: 0.75rem;
      background: color-mix(in srgb, var(--theme-dark) 4%, transparent); display: flex; align-items: center; justify-content: center;
      color: var(--theme-dark-light); flex-shrink: 0; transition: all 0.25s ease;
    }

    .nav-divider {
      height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-dark) 6%, transparent), transparent);
      margin: 0.75rem 0;
    }

    .view-store-link {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.75rem 1rem; border-radius: 1rem;
      font-size: 0.875rem; font-weight: 600; color: var(--theme-dark-light);
      text-decoration: none; transition: all 0.25s ease;
    }
    .view-store-link:hover { background: rgba(245, 158, 11, 0.06); color: #d97706; }
    .view-store-link:hover .nav-icon-wrap { background: rgba(245, 158, 11, 0.12); color: #d97706; }

    /* User Footer */
    .user-footer { padding: 1rem; border-top: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); }

    .user-preview {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem; border-radius: 1rem; margin-bottom: 0.75rem;
      background: color-mix(in srgb, var(--theme-dark) 2%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
    }

    .user-avatar {
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.875rem; flex-shrink: 0;
    }

    .user-name { font-size: 0.8rem; font-weight: 700; color: var(--theme-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-email { font-size: 0.65rem; color: var(--theme-dark-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }

    .logout-btn {
      display: flex; align-items: center; gap: 0.875rem; width: 100%;
      padding: 0.75rem 1rem; border-radius: 1rem; border: none; background: transparent;
      font-size: 0.875rem; font-weight: 600; color: #ef4444; cursor: pointer;
      transition: all 0.25s ease;
    }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.06); transform: translateX(2px); }
    .logout-btn .nav-icon-wrap { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
    .logout-btn:hover .nav-icon-wrap { background: rgba(239, 68, 68, 0.15); }

    /* ─── Main Content ─── */
    .main-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; z-index: 1; }

    /* Top Bar */
    .top-bar {
      height: 4rem; display: flex; align-items: center; justify-content: space-between;
      padding: 0 1.5rem; background: color-mix(in srgb, var(--theme-cream) 85%, transparent);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      flex-shrink: 0;
      position: sticky; top: 0; z-index: 20;
    }
    @media (min-width: 1024px) { .top-bar { padding: 0 2rem; } }

    .top-bar-left { display: flex; align-items: center; gap: 1rem; }

    .hamburger-btn {
      display: flex; align-items: center; justify-content: center;
      width: 2.5rem; height: 2.5rem; border-radius: 0.75rem;
      border: none; background: transparent; color: var(--theme-dark-light); cursor: pointer;
      transition: all 0.2s;
    }
    .hamburger-btn:hover { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); color: var(--theme-dark); }
    @media (min-width: 1024px) { .hamburger-btn { display: none; } }

    .page-title { font-size: 1.125rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.01em; }

    .top-bar-avatar {
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.875rem;
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--theme-primary) 20%, transparent);
    }

    .theme-toggle-btn {
      width: 2.25rem; height: 2.25rem; border-radius: 0.75rem;
      display: flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--theme-dark) 4%, transparent);
      color: var(--theme-dark-light); cursor: pointer; transition: all 0.25s ease;
      border: none;
    }
    .theme-toggle-btn:hover {
      background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
      color: var(--theme-primary);
      transform: scale(1.05);
    }

    /* Page Content */
    .page-content { flex: 1; overflow-y: auto; padding: 1.5rem; }
    @media (min-width: 640px) { .page-content { padding: 2rem; } }
    @media (min-width: 1024px) { .page-content { padding: 2.5rem; } }
  `,
  template: `
    <div class="admin-shell">
      <div class="shell-blob"></div>

      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div class="mobile-overlay" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside class="sidebar" [class.closed]="!sidebarOpen()" [class.open]="sidebarOpen()" aria-label="Admin sidebar">
        
        <!-- Logo -->
        <div class="logo-area">
          <a routerLink="/" class="logo-link">
            <span class="logo-text">AQDAS</span>
            <span class="logo-badge">Admin</span>
          </a>
          <button (click)="sidebarOpen.set(false)" class="close-sidebar-btn" aria-label="Close sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="nav-area" aria-label="Admin navigation">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" 
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: false }"
               (click)="sidebarOpen.set(false)"
               class="nav-link">
              <span class="nav-icon-wrap" [innerHTML]="item.icon"></span>
              <span>{{ item.label }}</span>
            </a>
          }

          <div class="nav-divider"></div>

          <a routerLink="/" class="view-store-link">
            <span class="nav-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            <span>View Store</span>
          </a>
        </nav>

        <!-- User Footer -->
        <div class="user-footer">
          @if (user()) {
            <div class="user-preview">
              <div class="user-avatar">
                {{ (user()!.displayName || user()!.email || 'A').charAt(0).toUpperCase() }}
              </div>
              <div style="min-width:0;">
                <p class="user-name">{{ user()!.displayName ?? 'Admin' }}</p>
                <p class="user-email">{{ user()!.email }}</p>
              </div>
            </div>
          }
          
          <button (click)="logout()" class="logout-btn">
            <span class="nav-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-col">
        
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="top-bar-left">
            <button (click)="sidebarOpen.set(true)" class="hamburger-btn" aria-label="Open sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h2 class="page-title">Admin Portal</h2>
          </div>
          
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button (click)="toggleTheme()" class="theme-toggle-btn" [attr.aria-label]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'">
              @if (isDarkMode()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>

            <div class="top-bar-avatar">
              {{ (user()?.displayName || user()?.email || 'A').charAt(0).toUpperCase() }}
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly store = inject(Store);
  private readonly settingsService = inject(SettingsService);
  readonly sidebarOpen = signal(false);
  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly isDarkMode = computed(() => this.settingsService.settings().theme === 'dark');
  readonly navItems: NavItem[];

  constructor(private sanitizer: DomSanitizer) {
    this.navItems = [
      {
        label: 'Dashboard',
        route: '/admin/dashboard',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2">
        <rect x="3" y="3" width="7" height="9"/>
        <rect x="14" y="3" width="7" height="5"/>
        <rect x="14" y="12" width="7" height="9"/>
        <rect x="3" y="16" width="7" height="5"/>
      </svg>
    `),
      },
      {
        label: 'Products',
        route: '/admin/products',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
    <svg xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  `),
      },
      {
        label: 'Orders',
        route: '/admin/orders',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
    <svg xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
      <path d="M3 6h18"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  `),
      },
      {
        label: 'Customers',
        route: '/admin/customers',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
    <svg xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `),
      },
      {
        label: 'Settings',
        route: '/admin/settings',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
    <svg xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  `),
      },
    ];
  }

  toggleTheme(): void {
    const nextTheme = this.isDarkMode() ? 'light' : 'dark';
    this.settingsService.updateSettings({ theme: nextTheme });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}