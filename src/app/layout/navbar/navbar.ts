import { Component, ChangeDetectionStrategy, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
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
  imports: [RouterLink, RouterLinkActive, FormsModule, NgOptimizedImage],
  host: { 'class': 'block' },
  styles: `
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #D4A017; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    .hamburger-line { transition: all 0.3s ease; }
    .menu-open .hamburger-line:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .menu-open .hamburger-line:nth-child(2) { opacity: 0; }
    .menu-open .hamburger-line:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }
    .search-input { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .premium-search-box { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .premium-search-box:focus-within { transform: translateY(-1px); }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-slideLeft { animation: slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `,
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500" [class]="scrolled() ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-primary/5' : 'bg-transparent'">
      <div class="w-full px-8 lg:px-16">
        <div class="flex items-center justify-between h-20 p-16">
          <a routerLink="/" class="flex items-center gap-2 group" aria-label="AQDAS Home">
            <img ngSrc="assets/logo.png" alt="AQDAS Logo" width="50" height="50" priority class="w-20 h-20 object-contain">
            <span class="text-accent text-xs font-body font-medium tracking-widest uppercase opacity-70">Spices</span>
          </a>

          <div class="hidden lg:flex items-center gap-8">
            @for (link of navLinks; track link.label) {
              <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: link.exact }" class="nav-link relative text-dark/70 hover:text-primary transition-colors font-body text-sm font-medium tracking-wide">
                {{ link.label }}
              </a>
            }
          </div>

          <div class="flex items-center gap-3 pl-16">
            <!-- Premium SaaS Search -->
            <div class="relative hidden md:block mr-2 premium-search-box group" (focusout)="onSearchBlur($event)">
              <div class="relative flex items-center">
                
                @if (!isSearchExpanded()) {
                  <button (click)="toggleSearch()" class="p-2.5 rounded-full hover:bg-primary/5 transition-all duration-300 text-dark/60 hover:text-primary animate-fadeIn" aria-label="Open search">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                } @else {
                  <!-- Advanced Glow -->
                  <div class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/30 to-secondary/30 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>

                  <!-- Input Container -->
                  <div class="relative z-10 flex items-center w-72 lg:w-96 h-14 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl overflow-hidden transition-all duration-500 group-focus-within:bg-white group-focus-within:border-primary/40 group-focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.12)] animate-slideLeft">
                    
                    <div class="w-16 h-full flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white/40 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>

                    <input 
                      #searchInput
                      type="text" 
                      [ngModel]="searchQuery()"
                      (ngModelChange)="searchQuery.set($event)"
                      (focus)="searchFocused.set(true)"
                      placeholder="Search premium collections..." 
                      class="search-input flex-1 h-full bg-transparent outline-none text-white group-focus-within:text-dark placeholder:text-white/30 group-focus-within:placeholder:text-dark/30 font-body text-sm font-medium tracking-wide transition-all"
                    />

                    <!-- Clear Button -->
                    @if (searchQuery().length > 0) {
                      <button (click)="searchQuery.set(''); closeSearch()" class="w-14 h-full flex items-center justify-center flex-shrink-0 text-red-500 hover:text-red-600 ransition-colors" aria-label="Clear">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    }
                  </div>
                }
              </div>
              
              <!-- Refined Dropdown -->
              @if (isSearchExpanded() && searchFocused() && searchQuery().length >= 2) {
                <div class="absolute top-full left-0 right-0 w-fullmt-5 bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/60 overflow-hidden z-50 max-h-[550px] overflow-y-auto animate-slideDown">
                  <div class="px-8 py-5 border-b border-dark/5 dark:border-white/5 bg-secondary/5 dark:bg-white/5 flex justify-between items-center">
                    <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-dark/40 dark:text-white/50">Available in Shop</span>
                    <span class="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg">{{ suggestions().length }} Results</span>
                  </div>

                  <div class="py-3">
                    @if (suggestions().length > 0) {
                    @for (product of suggestions(); track product.id) {
                      <a [routerLink]="['/shop', product.id]" (click)="closeSearch()" class="group/item flex items-center gap-5 p-4 mx-4 my-2 rounded-2xl hover:bg-secondary/10 dark:hover:bg-white/5 transition-all">
                        <div class="relative w-16 h-16 rounded-2xl overflow-hidden bg-cream flex-shrink-0 shadow-sm group-hover/item:shadow-md transition-all duration-500 group-hover/item:scale-105">
                          <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-body text-base font-bold text-primary truncate group-hover/item:text-primary transition-colors">{{ product.name }}</p>
                          <div class="flex items-center gap-3 mt-1.5">
                             <p class="font-body text-sm font-bold text-primary">₹{{ product.price }}</p>
                             <div class="w-1 h-1 rounded-full bg-dark/10 dark:bg-white/20"></div>
                             <span class="text-[10px] font-bold text-dark/40 dark:text-white/40 uppercase tracking-widest group-hover/item:text-primary transition-colors">In Stock</span>
                          </div>
                        </div>
                        <div class="w-10 h-10 rounded-xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all -translate-x-4 group-hover/item:translate-x-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-primary"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                        </div>
                      </a>
                    }
                  } @else {
                    <div class="p-16 text-center">
                      <div class="w-20 h-20 bg-secondary/20 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-dark/20 dark:text-white/20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <p class="font-body text-base font-semibold text-slate-800 dark:text-white/60 italic">Nothing found for "{{ searchQuery() }}"</p>
                      <button (click)="searchQuery.set('')" class="mt-4 text-primary font-bold text-xs uppercase tracking-widest hover:underline">Clear Search</button>
                    </div>
                  }
                  </div>
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
                <button (click)="showUserMenu.set(!showUserMenu())" class="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-body text-sm font-bold" [attr.aria-label]="'User menu for ' + user()!.displayName">
                  {{ user()!.displayName?.charAt(0)?.toUpperCase() || 'U' }}
                </button>
                @if (showUserMenu()) {
                  <div class="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-dark/10 py-2 z-50">
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
  readonly isSearchExpanded = signal(false);

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
    const relatedTarget = event.relatedTarget as HTMLElement;
    // Don't close if we're clicking inside the search box or its children
    if (relatedTarget?.closest('.premium-search-box')) {
      return;
    }

    setTimeout(() => {
      // Check if focus was regained within the search box (e.g. after toggle)
      if (document.activeElement?.closest('.premium-search-box')) {
        return;
      }

      this.searchFocused.set(false);
      if (this.searchQuery().length === 0) {
        this.isSearchExpanded.set(false);
      }
    }, 200);
  }

  toggleSearch(): void {
    this.isSearchExpanded.set(true);
    // Focus the input after it's rendered
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
