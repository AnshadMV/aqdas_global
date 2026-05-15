import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal } from '../../store/cart/cart.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../core/firebase/firebase.config';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { ToastService } from '../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, FormsModule, SpinnerComponent],
  host: { 'class': 'block' },
  template: `
    <section class="py-12 bg-secondary/30 min-h-screen">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-dark mb-8">Checkout</h1>

        @if (isSuccess()) {
          <div class="bg-white rounded-3xl p-12 shadow-sm border border-dark/5 text-center max-w-2xl mx-auto mt-10">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 class="font-heading text-3xl font-bold text-dark mb-4">Order Confirmed!</h2>
            <p class="font-body text-dark/70 mb-8">Thank you for your purchase. Your premium Kerala spices are on their way. Your order ID is <span class="font-bold text-dark">#{{ orderId() }}</span>.</p>
            <a routerLink="/shop" class="inline-block bg-primary hover:bg-primary-dark text-white font-body font-semibold px-8 py-4 rounded-xl transition-all">
              Continue Shopping
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <!-- Checkout Form -->
            <div class="lg:col-span-7 space-y-8">
              <!-- Shipping Details -->
              <div class="bg-white rounded-3xl p-8 shadow-sm border border-dark/5">
                <h2 class="font-heading text-xl font-bold text-dark mb-6 flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                  Shipping Details
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block font-body text-sm font-medium text-dark/70 mb-1.5">First Name</label>
                    <input type="text" [(ngModel)]="firstName" class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" />
                  </div>
                  <div>
                    <label class="block font-body text-sm font-medium text-dark/70 mb-1.5">Last Name</label>
                    <input type="text" [(ngModel)]="lastName" class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block font-body text-sm font-medium text-dark/70 mb-1.5">Email Address</label>
                    <input type="email" [(ngModel)]="email" class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block font-body text-sm font-medium text-dark/70 mb-1.5">Address</label>
                    <input type="text" [(ngModel)]="address" class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" placeholder="Street address, P.O. box, etc." />
                  </div>
                  <div>
                    <label class="block font-body text-sm font-medium text-dark/70 mb-1.5">City</label>
                    <input type="text" [(ngModel)]="city" class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" />
                  </div>
                  <div>
                    <label class="block font-body text-sm font-medium text-dark/70 mb-1.5">Postal Code</label>
                    <input type="text" [(ngModel)]="postalCode" class="w-full px-4 py-3.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" />
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="bg-white rounded-3xl p-8 shadow-sm border border-dark/5">
                <h2 class="font-heading text-xl font-bold text-dark mb-6 flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                  Payment Method
                </h2>

                <div class="space-y-4">
                  <label class="flex items-center gap-4 p-4 border border-primary bg-primary/5 rounded-xl cursor-pointer">
                    <input type="radio" name="payment" value="cod" checked class="w-5 h-5 text-primary focus:ring-primary" />
                    <div>
                      <p class="font-body font-semibold text-dark">Cash on Delivery (COD)</p>
                      <p class="font-body text-xs text-dark/50">Pay when your order arrives</p>
                    </div>
                  </label>
                  <label class="flex items-center gap-4 p-4 border border-dark/10 rounded-xl cursor-pointer opacity-50 hover:bg-secondary/50">
                    <input type="radio" name="payment" value="card" disabled class="w-5 h-5" />
                    <div>
                      <p class="font-body font-semibold text-dark">Credit / Debit Card</p>
                      <p class="font-body text-xs text-dark/50">Coming soon</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Order Summary Sidebar -->
            <div class="lg:col-span-5">
              <div class="bg-white rounded-3xl p-8 shadow-sm border border-dark/5 sticky top-24">
                <h2 class="font-heading text-xl font-bold text-dark mb-6">Order Summary</h2>

                <div class="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                  @for (item of cartItems(); track item.productId) {
                    <div class="flex gap-4">
                      <div class="w-16 h-16 rounded-xl bg-cream overflow-hidden flex-shrink-0">
                        <img [src]="item.imageUrl" [alt]="item.name" class="w-full h-full object-cover" />
                      </div>
                      <div class="flex-1">
                        <p class="font-body font-semibold text-dark text-sm line-clamp-1">{{ item.name }}</p>
                        <p class="font-body text-xs text-dark/50">Qty: {{ item.quantity }}</p>
                        <p class="font-body text-sm font-semibold text-primary mt-1">{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</p>
                      </div>
                    </div>
                  }
                </div>

                <div class="space-y-3 pt-6 border-t border-dark/5 mb-6">
                  <div class="flex justify-between font-body text-dark/70 text-sm">
                    <span>Subtotal</span>
                    <span>{{ cartTotal() | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between font-body text-dark/70 text-sm">
                    <span>Shipping</span>
                    <span class="text-green-600 font-semibold">Free</span>
                  </div>
                  <div class="flex justify-between font-heading font-bold text-xl text-dark pt-3 border-t border-dark/5">
                    <span>Total</span>
                    <span class="text-primary">{{ cartTotal() | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                </div>

                <button 
                  (click)="placeOrder()" 
                  [disabled]="isPlacingOrder() || !isFormValid() || cartItems().length === 0"
                  class="w-full bg-primary hover:bg-primary-dark text-white font-body font-semibold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2">
                  @if (isPlacingOrder()) {
                    <app-spinner size="sm" class="scale-50 -ml-4" />
                    Processing...
                  } @else {
                    Place Order ({{ cartTotal() | currency:'INR':'symbol':'1.0-0' }})
                  }
                </button>
              </div>
            </div>

          </div>
        }
      </div>
    </section>
  `,
})
export class CheckoutComponent {
  private readonly store = inject(Store);
  private readonly toastService = inject(ToastService);
  
  readonly cartItems = this.store.selectSignal(selectCartItems);
  readonly cartTotal = this.store.selectSignal(selectCartTotal);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  firstName = '';
  lastName = '';
  email = this.user()?.email || '';
  address = '';
  city = '';
  postalCode = '';

  isPlacingOrder = signal(false);
  isSuccess = signal(false);
  orderId = signal('');

  isFormValid(): boolean {
    return !!(this.firstName && this.lastName && this.email && this.address && this.city && this.postalCode);
  }

  async placeOrder() {
    if (!this.isFormValid() || this.cartItems().length === 0) return;

    this.isPlacingOrder.set(true);

    try {
      const newOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const order = {
        id: newOrderId,
        uid: this.user()?.uid || 'guest',
        customerName: `${this.firstName} ${this.lastName}`,
        customerEmail: this.email,
        shippingAddress: {
          address: this.address,
          city: this.city,
          postalCode: this.postalCode
        },
        items: this.cartItems(),
        total: this.cartTotal(),
        status: 'Pending',
        paymentMethod: 'COD',
        createdAt: new Date().toISOString()
      };

      // Save order to Firestore
      await setDoc(doc(collection(firestore, 'orders'), newOrderId), order);

      // Clear cart
      this.store.dispatch(CartActions.clearCart());

      // Show success screen
      this.orderId.set(newOrderId);
      this.isSuccess.set(true);
      this.toastService.success('Order placed successfully!');
    } catch (e) {
      console.error('Failed to place order', e);
      this.toastService.error('Failed to place order. Please try again.');
    } finally {
      this.isPlacingOrder.set(false);
    }
  }
}
