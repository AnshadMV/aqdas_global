import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { selectCartItems, selectCartTotal, selectCartCount } from '../../store/cart/cart.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { CartActions } from '../../store/cart/cart.actions';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { 'class': 'block' },
  template: `
    <section class="py-10 bg-secondary min-h-screen">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-dark mb-8">Shopping Cart</h1>

        @if (items().length === 0) {
          <div class="text-center py-20">
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-primary/40"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <h2 class="font-heading text-2xl font-semibold text-dark mb-2">Your cart is empty</h2>
            <p class="font-body text-dark/40 mb-8">Explore our collection of premium spices</p>
            <a routerLink="/shop" class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-body font-semibold px-8 py-3.5 rounded-full transition-all">
              Continue Shopping
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Cart Items -->
            <div class="lg:col-span-2 space-y-4">
              @for (item of items(); track item.productId) {
                <div class="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 shadow-sm">
                  <div class="flex gap-4 w-full sm:w-auto flex-1">
                    <div class="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-cream">
                      <img [ngSrc]="item.imageUrl" [alt]="item.name" fill class="object-cover" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-heading text-base font-semibold text-dark line-clamp-2">{{ item.name }}</h3>
                      <p class="font-body text-xs text-dark/40">{{ item.weight }}</p>
                      <p class="font-heading text-lg font-bold text-primary mt-1">₹{{ item.price }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between w-full sm:w-auto border-t border-dark/5 sm:border-0 pt-4 sm:pt-0">
                    <div class="flex items-center gap-2">
                      <button (click)="updateQty(item.productId, item.quantity - 1)" class="w-8 h-8 rounded-lg border border-dark/10 flex items-center justify-center hover:bg-dark/5 transition-colors font-body text-sm" aria-label="Decrease quantity">−</button>
                      <span class="w-8 text-center font-body text-sm font-semibold">{{ item.quantity }}</span>
                      <button (click)="updateQty(item.productId, item.quantity + 1)" class="w-8 h-8 rounded-lg border border-dark/10 flex items-center justify-center hover:bg-dark/5 transition-colors font-body text-sm" aria-label="Increase quantity">+</button>
                    </div>
                    <div class="flex items-center gap-3 sm:ml-4">
                      <p class="font-heading text-base font-bold text-dark w-20 text-right sm:mr-2">₹{{ item.price * item.quantity }}</p>
                      <button (click)="removeItem(item.productId)" class="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-dark/30 hover:text-red-500 transition-colors" aria-label="Remove item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Order Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
                <h3 class="font-heading text-xl font-bold text-dark mb-6">Order Summary</h3>
                <div class="space-y-3 mb-6">
                  <div class="flex justify-between font-body text-sm"><span class="text-dark/50">Items ({{ count() }})</span><span class="text-dark">₹{{ total() }}</span></div>
                  <div class="flex justify-between font-body text-sm"><span class="text-dark/50">Shipping</span><span class="text-primary font-medium">Free</span></div>
                </div>
                <div class="border-t border-dark/5 pt-4 mb-6">
                  <div class="flex justify-between"><span class="font-body font-semibold text-dark">Total</span><span class="font-heading text-2xl font-bold text-primary">₹{{ total() }}</span></div>
                </div>
                <a 
                  routerLink="/checkout"
                  class="block text-center w-full bg-primary hover:bg-primary-dark text-white font-body font-semibold py-4 rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95">
                  Proceed to Checkout
                </a>
                <a routerLink="/shop" class="block w-full text-center mt-3 font-body text-sm text-dark/50 hover:text-primary transition-colors">
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class CartComponent {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(selectCartItems);
  readonly total = this.store.selectSignal(selectCartTotal);
  readonly count = this.store.selectSignal(selectCartCount);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  updateQty(productId: string, quantity: number): void {
    this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
  }

  removeItem(productId: string): void {
    this.store.dispatch(CartActions.removeFromCart({ productId, uid: this.user()?.uid ?? null }));
  }
}
