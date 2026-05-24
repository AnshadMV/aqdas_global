import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  styles: `
    /* ─── Background & Ambient ─── */
    .checkout-section {
      background: linear-gradient(180deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 100%);
      position: relative;
      overflow: hidden;
      min-height: 100vh;
    }

    .checkout-blob-1 {
      position: absolute;
      top: -10%;
      left: -10%;
      width: 50%;
      height: 50%;
      background: radial-gradient(circle, rgba(0,168,89,0.05), transparent 70%);
      filter: blur(120px);
      pointer-events: none;
    }

    .checkout-blob-2 {
      position: absolute;
      bottom: -15%;
      right: -5%;
      width: 45%;
      height: 45%;
      background: radial-gradient(circle, rgba(245,158,11,0.04), transparent 70%);
      filter: blur(100px);
      pointer-events: none;
    }

    /* ─── Container ─── */
    .checkout-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 5rem 1.5rem;
      position: relative;
      z-index: 10;
    }

    @media (min-width: 640px) {
      .checkout-container { padding: 6rem 2rem; }
    }

    @media (min-width: 1024px) {
      .checkout-container { padding: 7rem 2.5rem; }
    }

    /* ─── Header ─── */
    .checkout-header { margin-bottom: 3rem; }
    .checkout-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      color: var(--theme-dark);
      letter-spacing: -0.02em;
    }

    /* ─── Success State ─── */
    .success-card {
      max-width: 640px;
      margin: 2rem auto;
      background: var(--theme-cream);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-radius: 2.5rem;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.05);
    }

    .success-icon-wrap {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(0, 168, 89, 0.1), rgba(22, 163, 74, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      color: #00a859;
      box-shadow: 0 8px 24px -8px rgba(0, 168, 89, 0.3);
    }

    .success-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--theme-dark);
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    .success-desc {
      color: var(--theme-dark-light);
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      max-width: 480px;
      margin-left: auto;
      margin-right: auto;
    }

    .order-id { font-weight: 800; color: #00a859; }

    .success-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2.5rem;
      background: linear-gradient(135deg, #00a859, #16a34a);
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      border-radius: 100px;
      text-decoration: none;
      box-shadow: 0 8px 24px -8px rgba(0, 168, 89, 0.4);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .success-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px -8px rgba(0, 168, 89, 0.5);
    }

    /* ─── Grid Layout ─── */
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    @media (min-width: 1024px) {
      .checkout-grid {
        grid-template-columns: 1.3fr 1fr;
        gap: 3rem;
        align-items: start;
      }
    }

    .checkout-form-col { display: flex; flex-direction: column; gap: 2rem; }

    /* ─── Form Cards ─── */
    .form-card {
      background: var(--theme-cream);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      border-radius: 2rem;
      padding: 2rem;
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.05);
    }

    @media (min-width: 640px) {
      .form-card { padding: 2.5rem; }
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .step-badge {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: rgba(0, 168, 89, 0.1);
      color: #00a859;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      border: 1px solid rgba(0, 168, 89, 0.2);
      flex-shrink: 0;
    }

    .card-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--theme-dark);
      letter-spacing: -0.01em;
    }

    /* ─── Inputs ─── */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    @media (min-width: 640px) {
      .form-grid { grid-template-columns: 1fr 1fr; }
      .col-span-2 { grid-column: span 2; }
    }

    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--theme-dark-light);
    }

    .form-input {
      width: 100%;
      padding: 0.95rem 1.25rem;
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 1rem;
      font-size: 0.95rem;
      color: var(--theme-dark);
      outline: none;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      border-color: #00a859;
      box-shadow: 0 0 0 4px rgba(0, 168, 89, 0.08);
      background: var(--theme-white);
    }

    .form-input::placeholder { color: var(--theme-dark-light); opacity: 0.6; }

    /* ─── Payment Options ─── */
    .payment-options { display: flex; flex-direction: column; gap: 1rem; }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 1.25rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background: color-mix(in srgb, var(--theme-white) 40%, transparent);
    }

    .payment-option:hover {
      border-color: rgba(0, 168, 89, 0.3);
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
    }

    .payment-option.active {
      border-color: #00a859;
      background: rgba(0, 168, 89, 0.04);
      box-shadow: 0 4px 12px -4px rgba(0, 168, 89, 0.15);
    }

    .payment-option.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .radio-input {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: #00a859;
      flex-shrink: 0;
    }

    .payment-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .payment-title { font-weight: 700; color: var(--theme-dark); font-size: 0.95rem; }
    .payment-desc { font-size: 0.8rem; color: var(--theme-dark-light); }

    /* ─── Summary Sidebar ─── */
    .summary-sidebar {
      background: var(--theme-cream);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-radius: 2rem;
      padding: 2rem;
      position: sticky;
      top: 2rem;
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.05);
    }

    .summary-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--theme-dark);
      margin-bottom: 1.5rem;
      letter-spacing: -0.01em;
    }

    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      max-height: 320px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .summary-items::-webkit-scrollbar { width: 4px; }
    .summary-items::-webkit-scrollbar-track { background: transparent; }
    .summary-items::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--theme-dark) 20%, transparent); border-radius: 4px; }

    .summary-item { display: flex; gap: 1rem; align-items: center; }

    .item-img-wrap {
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      overflow: hidden;
      background: var(--theme-cream-dark);
      flex-shrink: 0;
    }

    .item-img { width: 100%; height: 100%; object-fit: cover; }

    .item-info { flex: 1; min-width: 0; }
    .item-name {
      font-weight: 600;
      color: var(--theme-dark);
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-qty { font-size: 0.8rem; color: var(--theme-dark-light); margin-top: 0.15rem; }
    .item-price { font-size: 0.9rem; font-weight: 700; color: #00a859; margin-top: 0.35rem; }

    .summary-totals {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 1.5rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      margin-bottom: 2rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }

    .total-label { color: var(--theme-dark-light); }
    .total-value { font-weight: 600; color: var(--theme-dark); }
    .total-value.free { color: #00a859; font-weight: 700; }

    .total-row.grand {
      padding-top: 1rem;
      border-top: 1px dashed color-mix(in srgb, var(--theme-dark) 12%, transparent);
      margin-top: 0.5rem;
    }

    .total-row.grand .total-label {
      font-weight: 800;
      color: var(--theme-dark);
      font-size: 1.1rem;
    }

    .total-row.grand .total-value {
      font-weight: 800;
      color: #00a859;
      font-size: 1.5rem;
      letter-spacing: -0.02em;
    }

    /* ─── Place Order Button ─── */
    .place-order-btn {
      width: 100%;
      padding: 1.125rem;
      background: linear-gradient(135deg, #00a859, #16a34a);
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      border: none;
      border-radius: 1.25rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 8px 24px -8px rgba(0, 168, 89, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      position: relative;
      overflow: hidden;
    }

    .place-order-btn::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 20%;
      height: 200%;
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(30deg);
      transition: none;
    }

    .place-order-btn:hover:not(:disabled)::before {
      left: 150%;
      transition: left 0.8s;
    }

    .place-order-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -8px rgba(0, 168, 89, 0.5);
    }

    .place-order-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  template: `
    <section class="checkout-section">
      <div class="checkout-blob-1"></div>
      <div class="checkout-blob-2"></div>

      <div class="checkout-container">
        <div class="checkout-header">
          <h1 class="checkout-title">Checkout</h1>
        </div>

        @if (isSuccess()) {
          <div class="success-card">
            <div class="success-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 class="success-title">Order Confirmed!</h2>
            <p class="success-desc">
              Thank you for your purchase. Your premium Kerala spices are on their way. 
              Your order ID is <span class="order-id">#{{ orderId() }}</span>.
            </p>
            <a routerLink="/shop" class="success-btn">
              Continue Shopping
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        } @else {
          <div class="checkout-grid">
            
            <!-- Checkout Form -->
            <div class="checkout-form-col">
              
              <!-- Shipping Details -->
              <div class="form-card">
                <div class="card-header">
                  <span class="step-badge">1</span>
                  <h2 class="card-title">Shipping Details</h2>
                </div>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input type="text" [(ngModel)]="firstName" class="form-input" placeholder="John" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input type="text" [(ngModel)]="lastName" class="form-input" placeholder="Doe" />
                  </div>
                  <div class="form-group col-span-2">
                    <label class="form-label">Email Address</label>
                    <input type="email" [(ngModel)]="email" class="form-input" placeholder="john@example.com" />
                  </div>
                  <div class="form-group col-span-2">
                    <label class="form-label">Address</label>
                    <input type="text" [(ngModel)]="address" class="form-input" placeholder="Street address, P.O. box, etc." />
                  </div>
                  <div class="form-group">
                    <label class="form-label">City</label>
                    <input type="text" [(ngModel)]="city" class="form-input" placeholder="Kochi" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Postal Code</label>
                    <input type="text" [(ngModel)]="postalCode" class="form-input" placeholder="682001" />
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="form-card">
                <div class="card-header">
                  <span class="step-badge">2</span>
                  <h2 class="card-title">Payment Method</h2>
                </div>

                <div class="payment-options">
                  <label class="payment-option active">
                    <input type="radio" name="payment" value="cod" checked class="radio-input" />
                    <div class="payment-info">
                      <span class="payment-title">Cash on Delivery (COD)</span>
                      <span class="payment-desc">Pay when your order arrives</span>
                    </div>
                  </label>
                  <label class="payment-option disabled">
                    <input type="radio" name="payment" value="card" disabled class="radio-input" />
                    <div class="payment-info">
                      <span class="payment-title">Credit / Debit Card</span>
                      <span class="payment-desc">Coming soon</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Order Summary Sidebar -->
            <div class="checkout-summary-col">
              <div class="summary-sidebar">
                <h2 class="summary-title">Order Summary</h2>

                <div class="summary-items">
                  @for (item of cartItems(); track item.productId) {
                    <div class="summary-item">
                      <div class="item-img-wrap">
                        <img [src]="item.imageUrl" [alt]="item.name" class="item-img" />
                      </div>
                      <div class="item-info">
                        <p class="item-name">{{ item.name }}</p>
                        <p class="item-qty">Qty: {{ item.quantity }}</p>
                        <p class="item-price">{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</p>
                      </div>
                    </div>
                  }
                </div>

                <div class="summary-totals">
                  <div class="total-row">
                    <span class="total-label">Subtotal</span>
                    <span class="total-value">{{ cartTotal() | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="total-row">
                    <span class="total-label">Shipping</span>
                    <span class="total-value free">Free</span>
                  </div>
                  <div class="total-row grand">
                    <span class="total-label">Total</span>
                    <span class="total-value">{{ cartTotal() | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                </div>

                <button 
                  (click)="placeOrder()" 
                  [disabled]="isPlacingOrder() || !isFormValid() || cartItems().length === 0"
                  class="place-order-btn">
                  @if (isPlacingOrder()) {
                    <app-spinner size="sm" />
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
  email = '';
  address = '';
  city = '';
  postalCode = '';

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.email = u.email || '';
        if (u.displayName) {
          const parts = u.displayName.split(' ');
          this.firstName = parts[0] || '';
          this.lastName = parts.slice(1).join(' ') || '';
        }
        if (u.shippingAddress) {
          this.address = u.shippingAddress.address || '';
          this.city = u.shippingAddress.city || '';
          this.postalCode = u.shippingAddress.postalCode || '';
        }
      }
    });
  }
  
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