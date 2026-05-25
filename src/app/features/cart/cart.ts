import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { selectCartItems, selectCartTotal, selectCartCount } from '../../store/cart/cart.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { 'class': 'block' },
  styles: `
    /* ─── Background & Ambient ─── */
    .cart-section {
      background: linear-gradient(180deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 100%);
      position: relative;
      overflow: hidden;
      min-height: 100vh;
    }

    .cart-blob-1 {
      position: absolute;
      top: -15%;
      right: -10%;
      width: 50%;
      height: 50%;
      background: radial-gradient(circle, rgba(0,168,89,0.06), transparent 70%);
      filter: blur(120px);
      pointer-events: none;
    }

    .cart-blob-2 {
      position: absolute;
      bottom: -10%;
      left: -5%;
      width: 40%;
      height: 40%;
      background: radial-gradient(circle, rgba(245,158,11,0.05), transparent 70%);
      filter: blur(100px);
      pointer-events: none;
    }

    /* ─── Container ─── */
    .cart-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 5rem 1.5rem;
      position: relative;
      z-index: 10;
    }

    @media (min-width: 640px) {
      .cart-container { padding: 6rem 2rem; }
    }

    @media (min-width: 1024px) {
      .cart-container { padding: 7rem 2.5rem; }
    }

    /* ─── Header ─── */
    .cart-header {
      margin-bottom: 3rem;
    }

    .cart-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      color: var(--theme-dark);
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .cart-subtitle {
      color: var(--theme-dark-light);
      font-size: 1.05rem;
    }

    /* ─── Grid Layout ─── */
    .cart-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 1024px) {
      .cart-grid {
        grid-template-columns: 2fr 1fr;
        gap: 3rem;
        align-items: start;
      }
    }

    /* ─── Cart Items ─── */
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cart-item {
      background: var(--theme-cream);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      border-radius: 1.5rem;
      padding: 1.5rem;
      display: flex;
      gap: 1.25rem;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.05);
    }

    .cart-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 168, 89, 0.15);
    }

    .item-image-wrap {
      position: relative;
      width: 5rem;
      height: 5rem;
      border-radius: 1rem;
      overflow: hidden;
      background: var(--theme-cream-dark);
      flex-shrink: 0;
    }

    .item-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--theme-dark);
      letter-spacing: -0.01em;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-weight {
      font-size: 0.8rem;
      color: var(--theme-dark-light);
    }

    .item-price {
      font-size: 1.125rem;
      font-weight: 800;
      color: #00a859;
      margin-top: auto;
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
    }

    .qty-control {
      display: flex;
      align-items: center;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 0.75rem;
      overflow: hidden;
      background: var(--theme-white);
    }

    .qty-btn {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      color: var(--theme-dark-light);
      transition: all 0.2s;
    }

    .qty-btn:hover {
      background: rgba(0, 168, 89, 0.05);
      color: #00a859;
    }

    .qty-val {
      width: 2rem;
      text-align: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--theme-dark);
      border-left: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-right: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-total-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .item-total {
      font-size: 1rem;
      font-weight: 800;
      color: var(--theme-dark);
    }

    .remove-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--theme-dark-light);
      transition: all 0.2s;
    }

    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
    }

    /* ─── Order Summary ─── */
    .order-summary {
      background: var(--theme-cream);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-radius: 2rem;
      padding: 2rem;
      position: sticky;
      top: 2rem;
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.05);
    }

    .summary-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--theme-dark);
      margin-bottom: 1.75rem;
      letter-spacing: -0.02em;
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }

    .summary-label {
      color: var(--theme-dark-light);
    }

    .summary-value {
      font-weight: 600;
      color: var(--theme-dark);
    }

    .summary-value.free {
      color: #00a859;
      font-weight: 700;
    }

    .summary-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-dark) 8%, transparent), transparent);
      margin: 1.5rem 0;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2rem;
    }

    .total-label {
      font-size: 1rem;
      font-weight: 700;
      color: var(--theme-dark);
    }

    .total-value {
      font-size: 2rem;
      font-weight: 800;
      color: #00a859;
      letter-spacing: -0.02em;
    }

    .checkout-btn {
      display: block;
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
      text-align: center;
      text-decoration: none;
      position: relative;
      overflow: hidden;
    }

    .checkout-btn::before {
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

    .checkout-btn:hover::before {
      left: 150%;
      transition: left 0.8s;
    }

    .checkout-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -8px rgba(0, 168, 89, 0.5);
    }

    .continue-link {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: var(--theme-dark-light);
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }

    .continue-link:hover {
      color: #00a859;
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

    /* B2B Wholesale Specific CSS */
    .b2b-badge {
      font-size: 0.65rem;
      font-weight: 800;
      color: #b58a13;
      background: rgba(251, 191, 36, 0.12);
      border: 1px solid rgba(251, 191, 36, 0.2);
      padding: 0.25rem 0.65rem;
      border-radius: 100px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    .b2b-moq-alert {
      border: 1px solid rgba(251, 191, 36, 0.35);
      background: rgba(251, 191, 36, 0.05);
      border-radius: 1rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
      color: #b58a13;
      line-height: 1.5;
    }

    .b2b-moq-title {
      font-weight: 800;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .b2b-metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--theme-dark-light);
      margin-top: 0.5rem;
      border-top: 1px dashed color-mix(in srgb, var(--theme-dark) 8%, transparent);
      padding-top: 0.5rem;
    }

    .b2b-metric-val {
      font-weight: 700;
      color: var(--theme-dark);
    }

    .btn-invoice {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      border: 1px dashed rgba(251, 191, 36, 0.5);
      background: rgba(251, 191, 36, 0.03);
      color: #b58a13;
      border-radius: 1rem;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 1rem;
      transition: all 0.2s;
    }

    .btn-invoice:hover {
      background: rgba(251, 191, 36, 0.08);
      transform: translateY(-1px);
    }

    /* Invoice Modal Styles */
    .invoice-modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .invoice-content {
      width: min(100%, 42rem);
      max-height: calc(100vh - 4rem);
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: #1e293b;
    }

    .invoice-header {
      padding: 1.5rem;
      background: #0f172a;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .invoice-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    .invoice-table th, .invoice-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .invoice-table th {
      background: #f8fafc;
      font-weight: 700;
      color: #475569;
    }

    .invoice-footer-actions {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background: #f8fafc;
    }

    .invoice-btn-print {
      background: #0f172a;
      color: white;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .invoice-btn-close {
      border: 1px solid #cbd5e1;
      background: white;
      color: #475569;
      padding: 0.65rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.85rem;
    }

    @media print {
      body * {
        visibility: hidden;
      }
      .invoice-modal, .invoice-modal * {
        visibility: visible;
      }
      .invoice-modal {
        position: absolute;
        left: 0; top: 0;
        width: 100%;
        background: white;
        padding: 0;
      }
      .invoice-footer-actions {
        display: none;
      }
    }
  `,
  template: `
    <section class="cart-section">
      <div class="cart-blob-1"></div>
      <div class="cart-blob-2"></div>

      <div class="cart-container">
        <div class="cart-header">
          @if (isWholesale()) {
            <span class="b2b-badge">B2B Wholesale Account Active</span>
          }
          <h1 class="cart-title">Shopping Cart</h1>
          <p class="cart-subtitle">Review your selected premium spices before checkout</p>
        </div>

        @if (items().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </div>
            <h2 class="empty-title">Your cart is empty</h2>
            <p class="empty-desc">Explore our collection of premium Kerala spices</p>
            <a routerLink="/shop" class="empty-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Continue Shopping
            </a>
          </div>
        } @else {
          <div class="cart-grid">
            <!-- Cart Items -->
            <div class="cart-items">
              @for (item of items(); track item.productId) {
                <div class="cart-item">
                  <div class="item-image-wrap">
                    <img [ngSrc]="item.imageUrl" [alt]="item.name" fill class="item-image" />
                  </div>

                  <div class="item-details">
                    <h3 class="item-name">{{ item.name }}</h3>
                    <p class="item-weight">{{ item.weight }}</p>
                    <p class="item-price">₹{{ item.price }}</p>
                  </div>

                  <div class="item-actions">
                    <div class="qty-control">
                      <button (click)="updateQty(item.productId, item.quantity - 1)" class="qty-btn" aria-label="Decrease quantity">−</button>
                      <span class="qty-val">{{ item.quantity }}</span>
                      <button (click)="updateQty(item.productId, item.quantity + 1)" class="qty-btn" aria-label="Increase quantity">+</button>
                    </div>

                    <div class="item-total-wrap">
                      <p class="item-total">₹{{ item.price * item.quantity }}</p>
                      <button (click)="removeItem(item.productId)" class="remove-btn" aria-label="Remove item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <h3 class="summary-title">{{ isWholesale() ? 'B2B Wholesale Summary' : 'Order Summary' }}</h3>

              @if (isWholesale() && !isMoqSatisfied()) {
                <div class="b2b-moq-alert">
                  <div class="b2b-moq-title">
                    ⚠️ Minimum Order Not Met
                  </div>
                  Wholesale accounts require a minimum order value of <strong>₹5,000</strong> or total weight of <strong>10 kg</strong>. Current: ₹{{ total() }} / {{ totalWeight() }} kg.
                </div>
              }

              <div class="summary-rows">
                <div class="summary-row">
                  <span class="summary-label">Items ({{ count() }})</span>
                  <span class="summary-value">₹{{ total() }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Shipping</span>
                  <span class="summary-value free">Free Freight Cargo</span>
                </div>
                
                @if (isWholesale()) {
                  <div class="b2b-metric-row">
                    <span>Total Order Weight</span>
                    <span class="b2b-metric-val">{{ totalWeight() }} kg</span>
                  </div>
                  <div class="b2b-metric-row">
                    <span>Estimated Shipping Crates</span>
                    <span class="b2b-metric-val">{{ crateCount() }} Crate(s)</span>
                  </div>
                  <div class="b2b-metric-row">
                    <span>GST (5% Inclusive)</span>
                    <span class="b2b-metric-val">₹{{ getGstAmount() }}</span>
                  </div>
                }
              </div>

              <div class="summary-divider"></div>

              <div class="summary-total">
                <span class="total-label">Total</span>
                <span class="total-value" [style.color]="isWholesale() ? '#b58a13' : '#00a859'">₹{{ total() }}</span>
              </div>

              @if (isMoqSatisfied()) {
                <a routerLink="/checkout" class="checkout-btn" [style.background]="isWholesale() ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #00a859, #16a34a)'" [style.color]="isWholesale() ? '#1e293b' : 'white'">
                  Proceed to Checkout
                </a>
              } @else {
                <button class="checkout-btn" disabled style="opacity: 0.5; cursor: not-allowed; background: #64748b; color: white;" type="button">
                  Proceed to Checkout
                </button>
              }

              <a routerLink="/shop" class="continue-link">
                Continue Shopping
              </a>

              @if (isWholesale()) {
                <button (click)="showInvoiceModal.set(true)" class="btn-invoice" type="button">
                  📋 Generate Commercial Pro Forma Invoice
                </button>
              }
            </div>
          </div>
        }
      </div>
    </section>

    <!-- Commercial Invoice Modal Overlay -->
    @if (showInvoiceModal() && isWholesale()) {
      <div class="invoice-modal" role="dialog" aria-modal="true">
        <div class="invoice-content">
          <div class="invoice-header">
            <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0;">B2B Commercial Pro Forma Invoice</h3>
            <span style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">AQDAS GLOBAL SPICES CO.</span>
          </div>
          <div class="invoice-body">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
              <div>
                <h4 style="font-weight: 800; font-size: 0.9rem; color: #0f172a; margin-bottom: 0.25rem;">Seller Details</h4>
                <p style="font-size: 0.75rem; color: #475569; line-height: 1.4;">
                  AQDAS Premium Spices Ltd.<br>
                  Cochin Port Terminal, Spices Zone Area<br>
                  Ernakulam, Kerala - 682003
                </p>
              </div>
              <div style="text-align: right;">
                <h4 style="font-weight: 800; font-size: 0.9rem; color: #0f172a; margin-bottom: 0.25rem;">Buyer Details</h4>
                <p style="font-size: 0.75rem; color: #475569; line-height: 1.4;">
                  B2B Wholesale Account<br>
                  Client ID: {{ user()?.uid?.substring(0,8) || 'GUEST' }}<br>
                  Email: {{ user()?.email }}
                </p>
              </div>
            </div>

            <div>
              <h4 style="font-weight: 800; font-size: 0.9rem; color: #0f172a; margin-bottom: 0.75rem;">Itemized Spices (Bulk Shipments)</h4>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Packaging Crate</th>
                    <th>Unit Wholesale Rate</th>
                    <th>Crate Qty</th>
                    <th style="text-align: right;">Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of items(); track item.productId) {
                    <tr>
                      <td style="font-weight: 700; color: #0f172a;">{{ item.name }}</td>
                      <td>{{ item.weight }}</td>
                      <td>₹{{ item.price }}</td>
                      <td style="font-weight: 700;">{{ item.quantity }}</td>
                      <td style="text-align: right; font-weight: 700; color: #0f172a;">₹{{ item.price * item.quantity }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; width: 100%; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
              <div style="display: flex; width: 16rem; justify-content: space-between; font-size: 0.8rem; color: #475569;">
                <span>Total Shipping Weight:</span>
                <span style="font-weight: 700; color: #0f172a;">{{ totalWeight() }} kg</span>
              </div>
              <div style="display: flex; width: 16rem; justify-content: space-between; font-size: 0.8rem; color: #475569;">
                <span>Estimated Cargo Volumes:</span>
                <span style="font-weight: 700; color: #0f172a;">{{ crateCount() }} Crate(s)</span>
              </div>
              <div style="display: flex; width: 16rem; justify-content: space-between; font-size: 0.8rem; color: #475569;">
                <span>GST (5% Inclusive):</span>
                <span style="font-weight: 700; color: #0f172a;">₹{{ getGstAmount() }}</span>
              </div>
              <div style="display: flex; width: 16rem; justify-content: space-between; font-size: 1.1rem; color: #0f172a; font-weight: 800; border-top: 1px solid #cbd5e1; padding-top: 0.5rem; margin-top: 0.25rem;">
                <span>Invoice Total:</span>
                <span style="color: #b58a13;">₹{{ total() }}</span>
              </div>
            </div>

            <div style="background: #f8fafc; border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.7rem; color: #64748b; line-height: 1.5; border: 1px dashed #cbd5e1;">
              <strong>B2B Terms Notice</strong>: This is a system-generated commercial invoice estimate for custom freight clearance. Payment terms: Spices will be dispatched upon payment realization (Direct bank transfer or checkout authorization).
            </div>
          </div>
          <div class="invoice-footer-actions">
            <button (click)="showInvoiceModal.set(false)" class="invoice-btn-close" type="button">Close</button>
            <button (click)="printInvoice()" class="invoice-btn-print" type="button">
              🖨️ Print / Save PDF Invoice
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CartComponent {
  private readonly store = inject(Store);
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly items = this.store.selectSignal(selectCartItems);
  readonly total = this.store.selectSignal(selectCartTotal);
  readonly count = this.store.selectSignal(selectCartCount);
  readonly user = this.store.selectSignal(selectCurrentUser);

  // B2B Wholesale signals and computations
  readonly isWholesale = computed(() => this.settingsService.settings().userType === 'wholesale');
  readonly showInvoiceModal = signal(false);

  readonly totalWeight = computed(() => {
    let wt = 0;
    for (const item of this.items()) {
      if (item.weight?.includes('5kg') || this.isWholesale()) {
        wt += item.quantity * 5;
      } else if (item.weight?.includes('10kg')) {
        wt += item.quantity * 10;
      } else {
        wt += item.quantity * 0.1; // 100g = 0.1kg
      }
    }
    return parseFloat(wt.toFixed(2));
  });

  readonly crateCount = computed(() => {
    return Math.ceil(this.totalWeight() / 5);
  });

  readonly isMoqSatisfied = computed(() => {
    if (!this.isWholesale()) return true;
    // Wholesale MOQ: Minimum ₹5,000 OR 10 kg total
    return this.total() >= 5000 || this.totalWeight() >= 10;
  });

  getGstAmount(): string {
    // 5% GST is included in spices pricing
    const price = this.total();
    const gst = price - (price / 1.05);
    return gst.toFixed(2);
  }

  printInvoice(): void {
    window.print();
  }

  updateQty(productId: string, quantity: number): void {
    this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
  }

  removeItem(productId: string): void {
    this.store.dispatch(CartActions.removeFromCart({ productId, uid: this.user()?.uid ?? null }));
  }
}