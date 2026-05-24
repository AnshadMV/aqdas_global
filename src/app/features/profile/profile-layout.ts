import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { AuthActions } from '../../store/auth/auth.actions';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-profile-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UpperCasePipe],
  host: { 'class': 'block' },
  styles: `
    /* ─── Background & Ambient ─── */
    .profile-section {
      background: linear-gradient(180deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 100%);
      position: relative;
      overflow: hidden;
      min-height: 100vh;
    }

    .profile-blob-1 {
      position: absolute;
      top: -10%;
      left: -8%;
      width: 45%;
      height: 45%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 5%, transparent), transparent 70%);
      filter: blur(120px);
      pointer-events: none;
    }

    .profile-blob-2 {
      position: absolute;
      bottom: -15%;
      right: -10%;
      width: 50%;
      height: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent) 4%, transparent), transparent 70%);
      filter: blur(100px);
      pointer-events: none;
    }

    /* ─── Container ─── */
    .profile-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 5rem 1.5rem;
      position: relative;
    }

    @media (min-width: 640px) {
      .profile-container { padding: 6rem 2rem; }
    }

    @media (min-width: 1024px) {
      .profile-container { padding: 7rem 2.5rem; }
    }

    /* ─── Header ─── */
    .profile-header {
      margin-bottom: 3rem;
    }

    .profile-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      color: var(--theme-dark);
      letter-spacing: -0.02em;
    }

    /* ─── Grid Layout ─── */
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      align-items: start;
    }

    @media (min-width: 1024px) {
      .profile-grid {
        grid-template-columns: 320px 1fr;
        gap: 3rem;
      }
    }

    /* ─── Sidebar ─── */
    .profile-sidebar {
      position: sticky;
      top: 6rem;
    }

    .sidebar-card {
      background: var(--theme-cream);
      backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-radius: 2rem;
      padding: 2rem;
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    .sidebar-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent);
    }

    .sidebar-ambient {
      position: absolute;
      top: -30%;
      right: -30%;
      width: 60%;
      height: 60%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 6%, transparent), transparent 70%);
      filter: blur(40px);
      pointer-events: none;
      transition: opacity 0.5s ease;
    }

    .sidebar-card:hover .sidebar-ambient {
      opacity: 1.5;
    }

    /* ─── User Profile Header ─── */
    .user-profile-header {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      position: relative;
      z-index: 1;
    }

    @media (min-width: 1024px) {
      .user-profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
    }

    .avatar-wrap {
      position: relative;
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background: linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 10%, transparent), color-mix(in srgb, var(--theme-primary-light) 15%, transparent));
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 3px solid color-mix(in srgb, var(--theme-primary) 15%, transparent);
      flex-shrink: 0;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    @media (min-width: 1024px) {
      .avatar-wrap {
        width: 5.5rem;
        height: 5.5rem;
      }
    }

    .avatar-wrap:hover {
      transform: scale(1.05);
      border-color: color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }

    .avatar-initial {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--theme-primary);
      user-select: none;
    }

    @media (min-width: 1024px) {
      .avatar-initial {
        font-size: 2rem;
      }
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .user-info {
      min-width: 0;
      flex: 1;
    }

    @media (min-width: 1024px) {
      .user-info {
        text-align: center;
      }
    }

    .user-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--theme-dark);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.8rem;
      color: var(--theme-dark-light);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    @media (min-width: 1024px) {
      .user-email {
        max-width: 100%;
      }
    }

    /* ─── Navigation ─── */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      position: relative;
      z-index: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      border-radius: 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
      overflow: hidden;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, var(--theme-primary), var(--theme-primary-light));
      border-radius: 0 3px 3px 0;
      opacity: 0;
      transform: scaleY(0);
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: color-mix(in srgb, var(--theme-primary) 4%, transparent);
      color: var(--theme-primary);
      transform: translateX(4px);
    }

    .nav-link:hover::before {
      opacity: 1;
      transform: scaleY(1);
    }

    .nav-link.active {
      background: linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 8%, transparent), color-mix(in srgb, var(--theme-primary-light) 12%, transparent));
      color: var(--theme-primary);
      font-weight: 700;
    }

    .nav-link.active::before {
      opacity: 1;
      transform: scaleY(1);
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--theme-dark) 6%, transparent);
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .nav-link:hover .nav-icon,
    .nav-link.active .nav-icon {
      background: color-mix(in srgb, var(--theme-primary) 12%, transparent);
    }

    .nav-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-dark) 8%, transparent), transparent);
      margin: 0.75rem 0;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      border-radius: 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #ef4444;
      background: transparent;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.06);
      transform: translateX(4px);
    }

    .logout-btn .nav-icon {
      background: rgba(239, 68, 68, 0.08);
    }

    .logout-btn:hover .nav-icon {
      background: rgba(239, 68, 68, 0.15);
    }

    /* ─── Main Content ─── */
    .profile-main {
      min-width: 0;
    }
  `,
  template: `
    <section class="profile-section">
      <div class="profile-blob-1"></div>
      <div class="profile-blob-2"></div>

      <div class="profile-container">
        <div class="profile-header">
          <h1 class="profile-title">My Account</h1>
        </div>

        <div class="profile-grid">
          <!-- Sidebar -->
          <aside class="profile-sidebar">
            <div class="sidebar-card">
              <div class="sidebar-ambient"></div>

              <!-- User Profile Header -->
              <div class="user-profile-header">
                <div class="avatar-wrap">
                  @if (user()?.photoURL) {
                    @if (user()!.photoURL!.startsWith('<svg')) {
                      <div [innerHTML]="user()!.photoURL" style="width:100%;height:100%;"></div>
                    } @else {
                      <img [src]="user()?.photoURL" alt="Profile" class="avatar-img" />
                    }
                  } @else {
                    <span class="avatar-initial">
                      {{ user()?.displayName?.charAt(0) || user()?.email?.charAt(0) || 'U' | uppercase }}
                    </span>
                  }
                </div>

                <div class="user-info">
                  <p class="user-name">{{ user()?.displayName || 'Cardamom Enthusiast' }}</p>
                  <p class="user-email">{{ user()?.email }}</p>
                </div>
              </div>

              <!-- Navigation -->
              <nav class="sidebar-nav">
                <a routerLink="/profile" 
                   [routerLinkActiveOptions]="{ exact: true }"
                   routerLinkActive="active"
                   class="nav-link">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <span>Personal Info</span>
                </a>

                <a routerLink="/profile/orders" 
                   routerLinkActive="active"
                   class="nav-link">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="8" cy="21" r="1"/>
                      <circle cx="19" cy="21" r="1"/>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                  </span>
                  <span>My Orders</span>
                </a>

                <a routerLink="/profile/settings" 
                   routerLinkActive="active"
                   class="nav-link">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </span>
                  <span>Settings</span>
                </a>

                <a routerLink="/wishlist" class="nav-link">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </span>
                  <span>Wishlist</span>
                </a>

                <div class="nav-divider"></div>

                <button (click)="logout()" class="logout-btn">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </span>
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="profile-main">
            <router-outlet />
          </main>
        </div>
      </div>
    </section>
  `,
})
export class ProfileLayoutComponent {
  private readonly store = inject(Store);
  readonly user = this.store.selectSignal(selectCurrentUser);

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}