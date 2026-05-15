import { Component, ChangeDetectionStrategy, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAllProducts } from '../../store/product/product.selectors';
import { selectCartCount } from '../../store/cart/cart.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectWishlistCount } from '../../store/wishlist/wishlist.selectors';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  host: { 'class': 'block' },
  styles: `
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #D4A017; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    .hamburger-line { transition: all 0.3s ease; }
    .menu-open .hamburger-line:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .menu-open .hamburger-line:nth-child(2) { opacity: 0; }
    .menu-open .hamburger-line:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }
  `,
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500" [class]="scrolled() ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-primary/5' : 'bg-transparent'">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <a routerLink="/" class="flex items-center gap-2 group" aria-label="AQDAS Home">
            <span class="font-heading text-3xl font-bold text-primary tracking-tight">AQDAS</span>
            <span class="text-accent text-xs font-body font-medium tracking-widest uppercase opacity-70">Spices</span>
          </a>

          <div class="hidden lg:flex items-center gap-8">
            @for (link of navLinks; track link.label) {
              <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: link.exact }" class="nav-link relative text-dark/70 hover:text-primary transition-colors font-body text-sm font-medium tracking-wide">
                {{ link.label }}
              </a>
            }
          </div>

          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="relative hidden md:block mr-2" (focusout)="onSearchBlur($event)">
              <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                  (focus)="searchFocused.set(true)"
                  placeholder="Search products..." 
                  class="w-48 lg:w-64 pl-9 pr-4 py-2 rounded-full border border-dark/10 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm transition-all"
                />
              </div>
              
              <!-- Suggestions Dropdown -->
              @if (searchFocused() && searchQuery().length >= 2) {
                <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-dark/5 overflow-hidden z-50 max-h-80 overflow-y-auto animate-slideDown">
                  @if (suggestions().length > 0) {
                    @for (product of suggestions(); track product.id) {
                      <a [routerLink]="['/shop', product.id]" (click)="closeSearch()" class="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-dark/5 last:border-0">
                        <img [src]="product.imageUrl" [alt]="product.name" class="w-10 h-10 rounded-lg object-cover bg-cream flex-shrink-0" />
                        <div>
                          <p class="font-body text-sm font-semibold text-dark line-clamp-1">{{ product.name }}</p>
                          <p class="font-body text-xs text-primary font-bold">₹{{ product.price }}</p>
                        </div>
                      </a>
                    }
                  } @else {
                    <div class="p-4 text-center font-body text-sm text-dark/50">
                      No products found.
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Dark Mode Toggle -->
            <button (click)="toggleDarkMode()" class="relative p-2.5 rounded-full hover:bg-primary/5 transition-colors" aria-label="Toggle dark mode">
              @if (isDarkMode()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/60 hover:text-accent transition-colors"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/60 hover:text-dark transition-colors"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>

            <!-- Wishlist -->
            <a routerLink="/wishlist" class="relative p-2.5 rounded-full hover:bg-primary/5 transition-colors" aria-label="Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/60"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              @if (wishlistCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ wishlistCount() }}</span>
              }
            </a>

            <!-- Cart -->
            <a routerLink="/cart" class="relative p-2.5 rounded-full hover:bg-primary/5 transition-colors" aria-label="Shopping cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/60"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              @if (cartCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ cartCount() }}</span>
              }
            </a>

            <!-- User -->
            @if (user()) {
              <div class="relative">
                <button (click)="showUserMenu.set(!showUserMenu())" class="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-body text-sm font-bold" [attr.aria-label]="'User menu for ' + user()!.displayName">
                  {{ user()!.displayName?.charAt(0)?.toUpperCase() || 'U' }}
                </button>
                @if (showUserMenu()) {
                  <div class="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-dark/5 py-2 z-50">
                    <p class="px-4 py-2 font-body text-xs text-dark/40 truncate">{{ user()!.email }}</p>
                    <button (click)="logout()" class="w-full text-left px-4 py-2 font-body text-sm text-dark/70 hover:bg-primary/5 hover:text-primary transition-colors">
                      Sign Out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login" class="p-2.5 rounded-full hover:bg-primary/5 transition-colors" aria-label="Sign in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/60"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </a>
            }

            <button class="lg:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors" [class.menu-open]="mobileMenuOpen()" (click)="toggleMobileMenu()" [attr.aria-expanded]="mobileMenuOpen()" aria-label="Toggle navigation menu">
              <div class="w-6 h-5 flex flex-col justify-between">
                <span class="hamburger-line block w-full h-0.5 bg-dark rounded-full"></span>
                <span class="hamburger-line block w-full h-0.5 bg-dark rounded-full"></span>
                <span class="hamburger-line block w-full h-0.5 bg-dark rounded-full"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      @if (mobileMenuOpen()) {
        <div class="lg:hidden glass border-t border-white/20 animate-slideDown">
          <div class="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
            @for (link of navLinks; track link.label) {
              <a [routerLink]="link.path" routerLinkActive="text-primary font-semibold" [routerLinkActiveOptions]="{ exact: link.exact }" class="text-dark/80 hover:text-primary transition-colors font-body text-base py-2 border-b border-dark/5" (click)="closeMobileMenu()">{{ link.label }}</a>
            }
          </div>
        </div>
      }
    </nav>
    <div class="h-20"></div>
  `,
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly showUserMenu = signal(false);
  readonly isDarkMode = signal(false);
  
  readonly searchQuery = signal('');
  readonly searchFocused = signal(false);

  readonly cartCount = this.store.selectSignal(selectCartCount);
  readonly wishlistCount = this.store.selectSignal(selectWishlistCount);
  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly products = this.store.selectSignal(selectAllProducts);

  readonly suggestions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (query.length < 2) return [];
    return this.products()
      .filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
      .slice(0, 5); // top 5 results
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
        // Scroll listener
        window.addEventListener('scroll', () => {
          this.scrolled.set(window.scrollY > 50);
        }, { passive: true });

        // Initialize Dark Mode from localStorage or OS preference
        const savedTheme = localStorage.getItem('aqdas-theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          this.isDarkMode.set(true);
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  toggleDarkMode(): void {
    const isDark = !this.isDarkMode();
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aqdas-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aqdas-theme', 'light');
    }
  }

  toggleMobileMenu(): void { this.mobileMenuOpen.update((v) => !v); }
  closeMobileMenu(): void { this.mobileMenuOpen.set(false); }

  onSearchBlur(event: FocusEvent): void {
    // Delay closing so that click events on the dropdown items can fire
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('a')) {
      return;
    }
    setTimeout(() => this.searchFocused.set(false), 200);
  }

  closeSearch(): void {
    this.searchFocused.set(false);
    this.searchQuery.set('');
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.showUserMenu.set(false);
    this.router.navigate(['/']);
  }
}
