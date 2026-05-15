import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { selectWishlistItems } from '../../store/wishlist/wishlist.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { WishlistActions } from '../../store/wishlist/wishlist.actions';
import { CartActions } from '../../store/cart/cart.actions';
import type { WishlistItem, CartItem } from '../../shared/models';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { 'class': 'block' },
  template: `
    <section class="py-10 bg-secondary min-h-screen">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-dark mb-8">My Wishlist</h1>

        @if (items().length === 0) {
          <div class="text-center py-20">
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-primary/40"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <h2 class="font-heading text-2xl font-semibold text-dark mb-2">Your wishlist is empty</h2>
            <p class="font-body text-dark/40 mb-8">Save products you love for later</p>
            <a routerLink="/shop" class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-body font-semibold px-8 py-3.5 rounded-full transition-all">
              Browse Products
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of items(); track item.productId) {
              <div class="bg-white rounded-2xl overflow-hidden shadow-sm group">
                <div class="relative overflow-hidden bg-cream h-52">
                  <img [ngSrc]="item.imageUrl" [alt]="item.name" fill class="object-cover" />
                  <button (click)="removeItem(item.productId)" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-all" aria-label="Remove from wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                </div>
                <div class="p-5">
                  <h3 class="font-heading text-base font-semibold text-dark mb-2">{{ item.name }}</h3>
                  <div class="flex items-center gap-2 mb-4">
                    <span class="font-heading text-lg font-bold text-primary">₹{{ item.price }}</span>
                    @if (item.originalPrice > item.price) {
                      <span class="font-body text-xs text-dark/30 line-through">₹{{ item.originalPrice }}</span>
                    }
                  </div>
                  <button (click)="moveToCart(item)" class="w-full bg-primary hover:bg-primary-dark text-white font-body text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    Move to Cart
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
  readonly items = this.store.selectSignal(selectWishlistItems);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  removeItem(productId: string): void {
    this.store.dispatch(WishlistActions.removeFromWishlist({ productId, uid: this.user()?.uid ?? null }));
  }

  moveToCart(item: WishlistItem): void {
    const cartItem: CartItem = { productId: item.productId, name: item.name, imageUrl: item.imageUrl, price: item.price, quantity: 1, weight: '' };
    this.store.dispatch(CartActions.addToCart({ item: cartItem, uid: this.user()?.uid ?? null }));
    this.removeItem(item.productId);
  }
}
