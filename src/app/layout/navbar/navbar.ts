import { Component, ChangeDetectionStrategy, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { afterNextRender, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { selectActiveProducts } from '../../store/product/product.selectors';
import { selectCartCount } from '../../store/cart/cart.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectWishlistCount } from '../../store/wishlist/wishlist.selectors';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule, NgOptimizedImage],
  host: { 'class': 'block', '(document:click)': 'onDocumentClick($event)' },
  styles: `
    /* ─── Base & Container ─── */
    .aq-navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 50;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      background: transparent;
    }

    .aq-navbar.scrolled {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px -8px color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    @media (min-width: 640px) { .nav-container { padding: 0 2rem; } }
    @media (min-width: 1024px) { .nav-container { padding: 0 2.5rem; } }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 5rem;
    }

    /* ─── Logo ─── */
    .logo-link { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .logo-img { width: 7.5rem; height: 7.5rem; object-fit: contain; }
    .logo-text { font-size: 1.35rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; }
    .logo-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--theme-primary); opacity: 0.9; margin-top: 2px; }

    /* ─── Desktop Links ─── */
    .desktop-nav { display: none; align-items: center; gap: 2.5rem; }
    @media (min-width: 1024px) { .desktop-nav { display: flex; } }

    .nav-link {
      position: relative;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      text-decoration: none;
      padding: 0.5rem 0;
      transition: color 0.3s ease;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0;
      width: 0; height: 2px;
      background: linear-gradient(90deg, var(--theme-primary), var(--theme-accent-dark));
      border-radius: 2px;
      transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .nav-link:hover, .nav-link.active { color: var(--theme-primary); }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }

    /* ─── Action Buttons ─── */
    .nav-actions { display: flex; align-items: center; gap: 0.5rem; }

    .action-btn {
      position: relative;
      width: 2.5rem; height: 2.5rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: transparent;
      border: none;
      color: var(--theme-dark-light);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .action-btn:hover { background: color-mix(in srgb, var(--theme-primary) 8%, transparent); color: var(--theme-primary); }

    .action-badge {
      position: absolute;
      top: 2px; right: 2px;
      min-width: 1.125rem; height: 1.125rem;
      padding: 0 0.3rem;
      background: #ef4444;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      border-radius: 100px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--theme-cream);
      line-height: 1;
    }
    .aq-navbar.scrolled .action-badge { border-color: var(--theme-cream); }
    .action-badge.cart { background: var(--theme-primary); }

    /* ─── User Avatar Button ─── */
    .user-avatar-btn {
      width: 2.5rem; height: 2.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 10%, transparent), color-mix(in srgb, var(--theme-primary-dark) 15%, transparent));
      border: 2px solid color-mix(in srgb, var(--theme-primary) 20%, transparent);
      padding: 2px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex; align-items: center; justify-content: center;
    }
    .user-avatar-btn:hover { border-color: var(--theme-primary); transform: scale(1.05); box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--theme-primary) 20%, transparent); }
    .user-avatar-btn img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .user-avatar-initial { font-size: 0.9rem; font-weight: 800; color: var(--theme-primary); }

    /* ─── User Dropdown Menu (Premium Focus) ─── */
    .user-menu-wrap { position: relative; }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 288px;
      background: color-mix(in srgb, var(--theme-cream) 98%, transparent);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 20px;
      box-shadow: 
        0 24px 48px -12px color-mix(in srgb, var(--theme-dark) 15%, transparent),
        0 0 0 1px color-mix(in srgb, var(--theme-dark) 2%, transparent);
      padding: 8px;
      z-index: 60;
      opacity: 0;
      transform: translateY(-12px) scale(0.96);
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      overflow: hidden;
    }

    .user-dropdown.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .user-dropdown::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent);
    }

    .user-info-header {
      padding: 16px 14px;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      margin-bottom: 6px;
    }
    .user-info-name { font-size: 0.95rem; font-weight: 700; color: var(--theme-dark); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-info-email { font-size: 0.75rem; color: var(--theme-dark-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .dropdown-nav { display: flex; flex-direction: column; gap: 4px; padding: 4px 0; }

    .dropdown-link, .dropdown-logout {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      text-decoration: none;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .dropdown-link:hover { background: color-mix(in srgb, var(--theme-primary) 6%, transparent); color: var(--theme-primary); }

    .dropdown-icon-wrap {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px;
      background: color-mix(in srgb, var(--theme-dark) 4%, transparent);
      color: var(--theme-dark-light);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .dropdown-link:hover .dropdown-icon-wrap { background: color-mix(in srgb, var(--theme-primary) 12%, transparent); color: var(--theme-primary); }

    .dropdown-divider { height: 1px; background: color-mix(in srgb, var(--theme-dark) 6%, transparent); margin: 4px 8px; }

    .dropdown-logout { color: #ef4444; }
    .dropdown-logout:hover { background: color-mix(in srgb, #ef4444 6%, transparent); color: #ef4444; }
    .dropdown-logout .dropdown-icon-wrap { background: color-mix(in srgb, #ef4444 8%, transparent); color: #ef4444; }
    .dropdown-logout:hover .dropdown-icon-wrap { background: color-mix(in srgb, #ef4444 15%, transparent); }

    /* ─── Mobile Visibility ─── */
    .mobile-hidden { display: flex; }
    @media (max-width: 767px) { .mobile-hidden { display: none !important; } }

    /* ─── Search Box ─── */
    .search-wrap { position: relative; display: none; }
    @media (min-width: 768px) { .search-wrap { display: block; } }

    .search-expanded {
      position: relative;
      display: flex;
      align-items: center;
      width: 20rem;
      height: 3rem;
      background: color-mix(in srgb, var(--theme-white) 90%, transparent);
      backdrop-filter: blur(12px);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent);
      border-radius: 100px;
      padding: 0 0.5rem 0 1.25rem;
      box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--theme-primary) 10%, transparent);
      animation: slideLeft 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

    .search-input {
      flex: 1;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--theme-dark);
      padding: 0 0.75rem;
    }
    .search-input::placeholder { color: var(--theme-dark-light); }

    .search-clear {
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: color-mix(in srgb, #ef4444 10%, transparent);
      color: #ef4444;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .search-clear:hover { background: #ef4444; color: #fff; }

    /* Search Dropdown */
    .search-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 380px;
      background: color-mix(in srgb, var(--theme-cream) 98%, transparent);
      backdrop-filter: blur(24px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 20px;
      box-shadow: 0 24px 48px -12px color-mix(in srgb, var(--theme-dark) 15%, transparent);
      max-height: 420px;
      overflow-y: auto;
      z-index: 60;
      animation: slideDown 0.3s ease-out;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .search-dropdown-header {
      padding: 14px 18px;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      display: flex; justify-content: space-between; align-items: center;
    }
    .search-dropdown-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--theme-dark-light); }
    .search-dropdown-count { font-size: 0.65rem; font-weight: 700; color: var(--theme-primary); background: color-mix(in srgb, var(--theme-primary) 10%, transparent); padding: 4px 8px; border-radius: 100px; }

    .search-suggestion {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 18px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .search-suggestion:hover { background: color-mix(in srgb, var(--theme-primary) 4%, transparent); }

    .suggestion-img { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; background: var(--theme-cream-dark); flex-shrink: 0; }
    .suggestion-info { flex: 1; min-width: 0; }
    .suggestion-name { font-size: 0.875rem; font-weight: 600; color: var(--theme-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .suggestion-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .suggestion-price { font-size: 0.8rem; font-weight: 700; color: var(--theme-primary); }
    .suggestion-dot { width: 3px; height: 3px; border-radius: 50%; background: color-mix(in srgb, var(--theme-dark) 20%, transparent); }
    .suggestion-stock { font-size: 0.65rem; font-weight: 600; color: var(--theme-dark-light); text-transform: uppercase; letter-spacing: 0.05em; }

    .search-empty { padding: 40px 24px; text-align: center; }
    .search-empty-icon { width: 56px; height: 56px; background: color-mix(in srgb, var(--theme-dark) 4%, transparent); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--theme-dark-light); }
    .search-empty-text { font-size: 0.9rem; font-weight: 600; color: var(--theme-dark-light); margin-bottom: 8px; }
    .search-empty-btn { background: none; border: none; color: var(--theme-primary); font-size: 0.8rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; }
    .search-empty-btn:hover { text-decoration: underline; }

    /* ─── Mobile Menu ─── */
    .mobile-toggle { display: flex; }
    @media (min-width: 1024px) { .mobile-toggle { display: none; } }

    .hamburger { width: 1.5rem; height: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; }
    .hamburger-line { width: 100%; height: 2px; background: var(--theme-dark); border-radius: 2px; transition: all 0.3s ease; transform-origin: center; }
    .menu-open .hamburger-line:nth-child(1) { transform: translateY(9px) rotate(45deg); }
    .menu-open .hamburger-line:nth-child(2) { opacity: 0; }
    .menu-open .hamburger-line:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }

    .mobile-menu {
      position: absolute;
      top: 100%; left: 0; right: 0;
      background: color-mix(in srgb, var(--theme-cream) 98%, transparent);
      backdrop-filter: blur(24px);
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      box-shadow: 0 16px 32px -8px color-mix(in srgb, var(--theme-dark) 10%, transparent);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: slideDown 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .mobile-link {
      display: block;
      padding: 14px 16px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      text-decoration: none;
      border-radius: 14px;
      transition: all 0.2s;
    }
    .mobile-link:hover, .mobile-link.active { background: color-mix(in srgb, var(--theme-primary) 6%, transparent); color: var(--theme-primary); }

    .nav-spacer { height: 5rem; }
  `,
  template: `
    <nav class="aq-navbar" [class.scrolled]="scrolled()">
      <div class="nav-container">
        <div class="nav-inner">
          
          <!-- Logo -->
          <a routerLink="/" class="logo-link" aria-label="AQDAS Home">
            <img ngSrc="assets/logo.png" alt="AQDAS Logo" width="40" height="40" priority class="logo-img" />
            <div style="display: flex; flex-direction: column; line-height: 1;">
              <span class="logo-text">AQDAS</span>
              <span class="logo-tag">Global</span>
            </div>
            @if (isWholesale()) {
              <span style="font-size: 0.65rem; font-weight: 800; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1e293b; padding: 3px 8px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.25); letter-spacing: 0.05em; margin-left: 0.25rem; box-shadow: 0 4px 8px rgba(251,191,36,0.15); display: inline-block;">B2B WHOLESALE</span>
            }
          </a>

          <!-- Desktop Navigation -->
          <div class="desktop-nav">
            @for (link of navLinks; track link.label) {
              <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: link.exact }" class="nav-link">
                {{ link.label }}
              </a>
            }
          </div>

          <!-- Action Buttons -->
          <div class="nav-actions">
            
            <!-- Search -->
            <div class="search-wrap" (focusout)="onSearchBlur($event)">
              @if (!isSearchExpanded()) {
                <button (click)="toggleSearch()" class="action-btn" aria-label="Open search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
              } @else {
                <div class="search-expanded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--theme-dark-light); flex-shrink: 0;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input 
                    #searchInput
                    type="text" 
                    [ngModel]="searchQuery()"
                    (ngModelChange)="searchQuery.set($event)"
                    (focus)="searchFocused.set(true)"
                    placeholder="Search premium collections..." 
                    class="search-input"
                  />
                  @if (searchQuery().length > 0) {
                    <button (click)="searchQuery.set(''); closeSearch()" class="search-clear" aria-label="Clear">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  }
                </div>

                <!-- Search Dropdown -->
                @if (isSearchExpanded() && searchFocused() && searchQuery().length >= 2) {
                  <div class="search-dropdown">
                    <div class="search-dropdown-header">
                      <span class="search-dropdown-label">Available in Shop</span>
                      <span class="search-dropdown-count">{{ suggestions().length }} Results</span>
                    </div>
                    
                    @if (suggestions().length > 0) {
                      @for (product of suggestions(); track product.id) {
                        <a [routerLink]="['/shop', product.id]" (click)="closeSearch()" class="search-suggestion">
                          <img [src]="product.imageUrl" [alt]="product.name" class="suggestion-img" />
                          <div class="suggestion-info">
                            <p class="suggestion-name">{{ product.name }}</p>
                            <div class="suggestion-meta">
                              <span class="suggestion-price">₹{{ product.price }}</span>
                              <span class="suggestion-dot"></span>
                              <span class="suggestion-stock">In Stock</span>
                            </div>
                          </div>
                        </a>
                      }
                    } @else {
                      <div class="search-empty">
                        <div class="search-empty-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <p class="search-empty-text">Nothing found for "{{ searchQuery() }}"</p>
                        <button (click)="searchQuery.set('')" class="search-empty-btn">Clear Search</button>
                      </div>
                    }
                  </div>
                }
              }
            </div>

            <!-- Dark Mode Toggle -->
            <button (click)="toggleDarkMode()" class="action-btn" aria-label="Toggle dark mode">
              @if (isDarkMode()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>

            <!-- Wishlist (hidden on mobile) -->
            <a routerLink="/wishlist" class="action-btn mobile-hidden" aria-label="Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              @if (wishlistCount() > 0) {
                <span class="action-badge">{{ wishlistCount() }}</span>
              }
            </a>

            <!-- Cart (hidden on mobile) -->
            <a routerLink="/cart" class="action-btn mobile-hidden" aria-label="Shopping cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              @if (cartCount() > 0) {
                <span class="action-badge cart">{{ cartCount() }}</span>
              }
            </a>

            <!-- User Menu -->
            @if (user()) {
              <div class="user-menu-wrap">
                <button (click)="showUserMenu.set(!showUserMenu())" class="user-avatar-btn" [attr.aria-label]="'User menu for ' + user()!.displayName">
                  @if (user()?.photoURL) {
                    @if (user()!.photoURL!.startsWith('<svg')) {
                      <div style="width: 100%; height: 100%; color: var(--theme-primary);" [innerHTML]="getSafeSvg(user()!.photoURL!)"></div>
                    } @else {
                      <img [src]="user()?.photoURL" alt="Profile" />
                    }
                  } @else {
                    <span class="user-avatar-initial">{{ user()!.displayName?.charAt(0)?.toUpperCase() || user()!.email.charAt(0).toUpperCase() || 'U' }}</span>
                  }
                </button>

                <div class="user-dropdown" [class.open]="showUserMenu()">
                  <div class="user-info-header">
                    <p class="user-info-name">{{ user()!.displayName || 'User' }}</p>
                    <p class="user-info-email">{{ user()!.email }}</p>
                  </div>
                  
                  <nav class="dropdown-nav">
                    <a routerLink="/profile" (click)="showUserMenu.set(false)" class="dropdown-link">
                      <span class="dropdown-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      <span>My Profile</span>
                    </a>
                    <a routerLink="/profile/orders" (click)="showUserMenu.set(false)" class="dropdown-link">
                      <span class="dropdown-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                      </span>
                      <span>Track Orders</span>
                    </a>
                    <a routerLink="/profile/settings" (click)="showUserMenu.set(false)" class="dropdown-link">
                      <span class="dropdown-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      </span>
                      <span>Settings</span>
                    </a>
                  </nav>

                  <div class="dropdown-divider"></div>

                  <div class="dropdown-nav" style="padding-top: 4px;">
                    <button (click)="logout()" class="dropdown-logout">
                      <span class="dropdown-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      </span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            } @else {
              <a routerLink="/login" class="action-btn" aria-label="Sign in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </a>
            }

            <!-- Mobile Toggle -->
            <button class="mobile-toggle action-btn" [class.menu-open]="mobileMenuOpen()" (click)="toggleMobileMenu()" [attr.aria-expanded]="mobileMenuOpen()" aria-label="Toggle navigation menu">
              <div class="hamburger">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="mobile-menu">
          @for (link of navLinks; track link.label) {
            <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: link.exact }" class="mobile-link" (click)="closeMobileMenu()">
              {{ link.label }}
            </a>
          }
        </div>
      }
    </nav>
    <div class="nav-spacer"></div>
  `,
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  getSafeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  private readonly settingsService = inject(SettingsService);
  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly showUserMenu = signal(false);
  readonly isDarkMode = computed(() => this.settingsService.settings().theme === 'dark');
  readonly isWholesale = computed(() => this.settingsService.settings().userType === 'wholesale');
  readonly searchQuery = signal('');
  readonly searchFocused = signal(false);
  readonly isSearchExpanded = signal(false);
  
  readonly cartCount = this.store.selectSignal(selectCartCount);
  readonly wishlistCount = this.store.selectSignal(selectWishlistCount);
  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly products = this.store.selectSignal(selectActiveProducts);

  readonly suggestions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (query.length < 2) return [];
    return this.products()
      .filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
      .slice(0, 5);
  });

  readonly navLinks = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Shop', path: '/shop', exact: false },
    { label: 'Cart', path: '/cart', exact: false },
    { label: 'Wishlist', path: '/wishlist', exact: false },
  ];

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        window.addEventListener('scroll', () => {
          this.scrolled.set(window.scrollY > 50);
        }, { passive: true });
      }
    });
  }

  toggleDarkMode(): void {
    const nextTheme = this.isDarkMode() ? 'light' : 'dark';
    this.settingsService.updateSettings({ theme: nextTheme });
  }

  toggleMobileMenu(): void { this.mobileMenuOpen.update((v) => !v); }
  closeMobileMenu(): void { this.mobileMenuOpen.set(false); }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrap')) {
      this.showUserMenu.set(false);
    }
  }

  onSearchBlur(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('.search-wrap')) return;
    
    setTimeout(() => {
      if (document.activeElement?.closest('.search-wrap')) return;
      this.searchFocused.set(false);
      if (this.searchQuery().length === 0) {
        this.isSearchExpanded.set(false);
      }
    }, 200);
  }

  toggleSearch(): void {
    this.isSearchExpanded.set(true);
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement;
      input?.focus();
    }, 100);
  }

  closeSearch(): void {
    this.searchFocused.set(false);
    this.isSearchExpanded.set(false);
    this.searchQuery.set('');
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.showUserMenu.set(false);
    this.router.navigate(['/']);
  }
}