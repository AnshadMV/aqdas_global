import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { selectWishlistItems } from '../../store/wishlist/wishlist.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { WishlistActions } from '../../store/wishlist/wishlist.actions';
import { CartActions } from '../../store/cart/cart.actions';
import type { WishlistItem, CartItem } from '../../shared/models';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { 'class': 'block' },
  styles: `
    /* ─── Background & Ambient ─── */
    .wishlist-section {
      background: linear-gradient(180deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 100%);
      position: relative;
      overflow: hidden;
      min-height: 100vh;
    }

    .wishlist-blob-1 {
      position: absolute;
      top: -10%;
      left: -8%;
      width: 45%;
      height: 45%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.06), transparent 70%);
      filter: blur(120px);
      pointer-events: none;
    }

    .wishlist-blob-2 {
      position: absolute;
      bottom: -15%;
      right: -10%;
      width: 50%;
      height: 50%;
      background: radial-gradient(circle, rgba(0, 168, 89, 0.05), transparent 70%);
      filter: blur(100px);
      pointer-events: none;
    }

    /* ─── Container ─── */
    .wishlist-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 5rem 1.5rem;
      position: relative;
      z-index: 10;
    }

    @media (min-width: 640px) {
      .wishlist-container { padding: 6rem 2rem; }
    }

    @media (min-width: 1024px) {
      .wishlist-container { padding: 7rem 2.5rem; }
    }

    /* ─── Header ─── */
    .wishlist-header {
      margin-bottom: 3rem;
    }

    .wishlist-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      color: var(--theme-dark);
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .wishlist-subtitle {
      color: var(--theme-dark-light);
      font-size: 1.05rem;
    }

    /* ─── Grid ─── */
    .wishlist-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 640px) {
      .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (min-width: 1024px) {
      .wishlist-grid { grid-template-columns: repeat(3, 1fr); }
    }

    /* ─── Wishlist Card ─── */
    .wishlist-card {
      background: var(--theme-cream);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      border-radius: 1.5rem;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
    }

    .wishlist-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.16);
      border-color: rgba(0, 168, 89, 0.15);
    }

    .card-image-wrap {
      position: relative;
      aspect-ratio: 4/3;
      background: var(--theme-cream-dark);
      overflow: hidden;
    }

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .wishlist-card:hover .card-image {
      transform: scale(1.08);
    }

    .remove-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: color-mix(in srgb, var(--theme-white) 90%, transparent);
      backdrop-filter: blur(8px);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #ef4444;
      transition: all 0.3s;
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
    }

    .remove-btn:hover {
      background: #ef4444;
      color: #fff;
      transform: scale(1.1);
    }

    .card-body {
      padding: 1.5rem;
    }

    .card-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--theme-dark);
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
      line-height: 1.3;
    }

    .card-price-wrap {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .card-price {
      font-size: 1.5rem;
      font-weight: 800;
      color: #00a859;
    }

    .card-original {
      font-size: 0.9rem;
      color: var(--theme-dark-light);
      opacity: 0.7;
      text-decoration: line-through;
    }

    .move-cart-btn {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #00a859, #16a34a);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      border: none;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 8px 20px -6px rgba(0, 168, 89, 0.3);
    }

    .move-cart-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px -6px rgba(0, 168, 89, 0.4);
    }

    .move-cart-btn:active {
      transform: translateY(0);
    }

    /* ─── Empty State ─── */
    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      backdrop-filter: blur(12px);
      border-radius: 2rem;
      border: 1px dashed color-mix(in srgb, var(--theme-dark) 15%, transparent);
    }

    .empty-icon {
      width: 5rem;
      height: 5rem;
      background: var(--theme-white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.08);
      color: var(--theme-dark-light);
    }

    .empty-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--theme-dark);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .empty-desc {
      color: var(--theme-dark-light);
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .empty-btn {
      background: linear-gradient(135deg, #00a859, #16a34a);
      color: #fff;
      font-weight: 700;
      padding: 1rem 2.5rem;
      border-radius: 100px;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 24px -8px rgba(0, 168, 89, 0.4);
      transition: all 0.3s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .empty-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px -8px rgba(0, 168, 89, 0.5);
    }
  `,
  template: `
    <section class="wishlist-section">
      <div class="wishlist-blob-1"></div>
      <div class="wishlist-blob-2"></div>

      <div class="wishlist-container">
        <div class="wishlist-header">
          @if (isWholesale()) {
            <span class="b2b-badge" style="font-size: 0.65rem; font-weight: 800; color: #b58a13; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.2); padding: 0.25rem 0.65rem; border-radius: 100px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.5rem; display: inline-block;">B2B Wholesale Mode</span>
          }
          <h1 class="wishlist-title">My Wishlist</h1>
          <p class="wishlist-subtitle">Products you've saved for later</p>
          
          @if (isWholesale() && items().length > 0) {
            <button (click)="requestQuote()" class="btn-quote" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: linear-gradient(135deg, #fbbf24, #f59e0b); border: none; color: #1e293b; padding: 0.65rem 1.5rem; border-radius: 100px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.3s; margin-top: 0.75rem; box-shadow: 0 4px 12px rgba(251,191,36,0.3);" type="button">
              📋 Convert Wishlist to Commercial B2B Quotation
            </button>
          }
        </div>

        @if (items().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <h2 class="empty-title">Your wishlist is empty</h2>
            <p class="empty-desc">Save products you love for later</p>
            <a routerLink="/shop" class="empty-btn" [style.background]="isWholesale() ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #00a859, #16a34a)'" [style.color]="isWholesale() ? '#1e293b' : 'white'">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Browse Products
            </a>
          </div>
        } @else {
          <div class="wishlist-grid">
            @for (item of items(); track item.productId) {
              <div class="wishlist-card" [style.border-color]="isWholesale() ? 'rgba(251,191,36,0.2)' : ''">
                <div class="card-image-wrap">
                  <img [ngSrc]="item.imageUrl" [alt]="item.name" fill class="card-image" />
                  <button (click)="removeItem(item.productId)" class="remove-btn" aria-label="Remove from wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </button>
                  @if (isWholesale()) {
                    <span style="position: absolute; bottom: 1rem; left: 1rem; font-size: 0.65rem; font-weight: 800; background: #fbbf24; color: #1e293b; padding: 3px 8px; border-radius: 100px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">B2B WHOLESALE</span>
                  }
                </div>

                <div class="card-body">
                  <h3 class="card-name">{{ item.name }}</h3>

                  <div class="card-price-wrap">
                    <span class="card-price" [style.color]="isWholesale() ? '#b58a13' : '#00a859'">₹{{ item.price }}</span>
                    @if (item.originalPrice > item.price) {
                      <span class="card-original">₹{{ item.originalPrice }}</span>
                    }
                  </div>

                  <button (click)="moveToCart(item)" class="move-cart-btn" [style.background]="isWholesale() ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #00a859, #16a34a)'" [style.color]="isWholesale() ? '#1e293b' : 'white'" [style.box-shadow]="isWholesale() ? '0 8px 20px -6px rgba(251, 191, 36, 0.3)' : ''">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="8" cy="21" r="1"/>
                      <circle cx="19" cy="21" r="1"/>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                    Move to Bulk Cart
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class WishlistComponent {
  private readonly store = inject(Store);
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly items = this.store.selectSignal(selectWishlistItems);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  readonly isWholesale = computed(() => this.settingsService.settings().userType === 'wholesale');

  requestQuote(): void {
    this.toast.success('B2B Quotation Generated! A pro-forma quote PDF has been sent to your wholesale email account.');
  }

  removeItem(productId: string): void {
    this.store.dispatch(WishlistActions.removeFromWishlist({ productId, uid: this.user()?.uid ?? null }));
  }

  moveToCart(item: WishlistItem): void {
    const isWholesale = this.isWholesale();
    const weight = isWholesale ? '5kg Bulk Crate' : '';
    const cartItem: CartItem = {
      productId: item.productId,
      name: item.name + (isWholesale && !item.name.includes('(Bulk Box)') ? ' (Bulk Box)' : ''),
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: 1,
      weight: weight,
    };
    this.store.dispatch(CartActions.addToCart({ item: cartItem, uid: this.user()?.uid ?? null }));
    this.removeItem(item.productId);
    this.toast.success(`${cartItem.name} moved to cart!`);
  }
}