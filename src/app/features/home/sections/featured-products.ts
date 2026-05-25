import { Component, ChangeDetectionStrategy, signal, ElementRef, viewChild, inject, OnInit, computed, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgOptimizedImage } from '@angular/common';
import { ProductActions } from '../../../store/product/product.actions';
import { CartActions } from '../../../store/cart/cart.actions';
import { selectActiveProducts, selectProductLoading } from '../../../store/product/product.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { Product, CartItem } from '../../../shared/models';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOME_CONTENT } from '../../../../environments/constants';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-featured-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { class: 'block' },
  styles: `
    /* Modern Bento Grid Background - Consistent with Categories Section */
    .featured-bg {
      background: linear-gradient(135deg, var(--theme-cream-dark) 0%, var(--theme-cream) 50%, var(--theme-cream-dark) 100%);
      position: relative;
      min-height: 600px; /* Prevent collapse during load */
    }
    .featured-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(0, 168, 89, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(255, 193, 7, 0.05) 0%, transparent 40%);
      pointer-events: none;
    }

    /* Animated Gradient Mesh */
    .featured-gradient-mesh {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 30% 40%, rgba(0, 168, 89, 0.12), transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(255, 193, 7, 0.08), transparent 50%);
      filter: blur(80px);
      animation: mesh-flow 12s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes mesh-flow {
      0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
      50% { opacity: 0.5; transform: scale(1.05) rotate(2deg); }
    }

    /* Container */
    .aq-container {
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      padding-top: 2rem;
      padding-bottom: 2rem;
    }

    @media (min-width: 640px) {
      .aq-container {
        padding-left: 2rem;
        padding-right: 2rem;
        padding-top: 2.5rem;
        padding-bottom: 2.5rem;
      }
    }

    @media (min-width: 1024px) {
      .aq-container {
        padding-left: 2.5rem;
        padding-right: 2.5rem;
        padding-top: 3rem;
        padding-bottom: 3rem;
      }
    }

    /* Section Header */
    .section-header {
      text-align: center;
      margin-bottom: 40px;
      margin-top: 20px;
    }

    @media (min-width: 640px) {
      .section-header {
        margin-bottom: 48px;
        margin-top: 28px;
      }
    }

    @media (min-width: 1024px) {
      .section-header {
        margin-bottom: 56px;
        margin-top: 36px;
      }
    }

    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 168, 89, 0.08);
      border: 1px solid rgba(0, 168, 89, 0.15);
      border-radius: 40px;
      padding: 6px 16px;
      margin-bottom: 24px;
    }

    @media (min-width: 640px) {
      .eyebrow-badge {
        margin-bottom: 28px;
        padding: 7px 18px;
      }
    }

    @media (min-width: 1024px) {
      .eyebrow-badge {
        margin-bottom: 32px;
        padding: 8px 20px;
      }
    }

    .eyebrow-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: var(--theme-primary);
      text-transform: uppercase;
    }

    .main-title {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 14px;
      color: var(--theme-dark);
    }

    @media (min-width: 640px) {
      .main-title {
        font-size: 44px;
      }
    }

    @media (min-width: 1024px) {
      .main-title {
        font-size: 56px;
        margin-bottom: 18px;
      }
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--theme-dark), var(--theme-primary), #f59e0b);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .title-underline {
      position: absolute;
      bottom: -0.25rem;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--theme-primary), #f59e0b, transparent);
    }

    .subtitle {
      font-size: 13px;
      line-height: 1.5;
      color: var(--theme-dark-light);
      max-width: 560px;
      margin: 0 auto;
    }

    @media (min-width: 640px) {
      .subtitle {
        font-size: 14px;
      }
    }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-top: 0.5rem;
      min-height: 400px; /* Reserve space to prevent layout shift */
    }

    @media (min-width: 640px) {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.75rem;
      }
    }

    @media (min-width: 1024px) {
      .products-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }
    }

    /* Product Card - Enhanced with better internal spacing */
    .product-card {
      border-radius: 1.5rem;
      transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      overflow: hidden;
      opacity: 0; /* Start hidden for animation */
      transform: translateY(20px); /* Start slightly down for animation */
    }

    .product-card.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 1.5rem;
      padding: 1px;
      background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0));
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask-composite: xor;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .product-card:hover::before {
      opacity: 1;
    }

    .product-card:hover {
      transform: translateY(-6px);
    }

    /* Light Card Theme */
    .product-card--light {
      background: var(--theme-white);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(0, 168, 89, 0.1);
      box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.08);
    }

    .product-card--light:hover {
      box-shadow: 0 25px 40px -14px rgba(0, 168, 89, 0.15);
      border-color: rgba(0, 168, 89, 0.3);
    }

    /* Dark Card Theme - Fixed */
    .product-card--dark {
      background: linear-gradient(135deg, #0f172a, #1e293b); 
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.35);
    }

    .product-card--dark:hover {
      box-shadow: 0 25px 40px -14px rgba(0, 0, 0, 0.45);
      border-color: rgba(0, 168, 89, 0.3);
    }

    /* Image Container - Improved spacing around image */
    .image-wrapper {
      position: relative;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      border-radius: 1.25rem;
      margin: 1rem;
    }

    @media (min-width: 640px) {
      .image-wrapper {
        margin: 1.125rem;
      }
    }

    @media (min-width: 1024px) {
      .image-wrapper {
        margin: 1.25rem;
      }
    }

    .image-inner {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-blur-bg {
      position: absolute;
      width: 78%;
      height: 78%;
      border-radius: 50%;
      filter: blur(25px);
      transition: transform 0.5s ease;
    }

    /* Light card blur background */
    .image-blur-bg--light {
      background: var(--theme-primary);
      opacity: 0.15;
    }

    /* Dark card blur background */
    .image-blur-bg--dark {
      background: #ffffff;
      opacity: 0.08;
    }

    .product-card:hover .image-blur-bg {
      transform: scale(1.1);
    }

    .product-image {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    .product-card:hover .product-image {
      transform: scale(1.06);
    }

    /* Badges Container - Better positioning and spacing */
    .badges-container {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      right: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      z-index: 2;
    }

    @media (min-width: 640px) {
      .badges-container {
        top: 1rem;
        left: 1rem;
        right: 1rem;
      }
    }

    .weight-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: white;
      text-transform: uppercase;
    }

    /* Dark card weight badge */
    .product-card--dark .weight-badge {
      background: rgba(0, 0, 0, 0.7);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .promo-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 0.75rem;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #0f172a;
      text-transform: uppercase;
    }

    /* Content Section - Improved internal spacing */
    .product-content {
      padding: 0 1rem 1rem 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 640px) {
      .product-content {
        padding: 0 1.125rem 1.125rem 1.125rem;
      }
    }

    @media (min-width: 1024px) {
      .product-content {
        padding: 0 1.25rem 1.25rem 1.25rem;
      }
    }

    /* Rating Stars - Consistent spacing */
    .rating-stars {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.625rem;
    }

    .star-icon {
      width: 0.875rem;
      height: 0.875rem;
      color: #f59e0b;
      fill: #f59e0b;
    }

    .rating-count {
      margin-left: 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .text-white-60 {
      color: rgba(255, 255, 255, 0.6);
    }

    .text-dark-60 {
      color: var(--theme-dark-light);
    }

    /* Product Title - Proper margin spacing */
    .product-title {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.35;
      margin: 0 0 0.75rem 0;
    }

    @media (min-width: 640px) {
      .product-title {
        font-size: 1.2rem;
        margin-bottom: 0.875rem;
      }
    }

    @media (min-width: 1024px) {
      .product-title {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
    }

    .text-white {
      color: #ffffff;
    }

    .text-dark {
      color: var(--theme-dark);
    }

    /* Divider - Better visual separation */
    .product-divider {
      margin: 0.75rem 0 0.875rem 0;
      height: 1px;
      background: currentColor;
      opacity: 0.1;
    }

    /* Card Footer - Improved spacing and alignment */
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    /* Price Section - Better typography spacing */
    .price-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      opacity: 0.5;
      display: block;
      margin-bottom: 0.25rem;
    }

    .price-value {
      display: flex;
      align-items: baseline;
      gap: 0.125rem;
      font-size: 1.25rem;
      font-weight: 800;
    }

    @media (min-width: 640px) {
      .price-value {
        font-size: 1.35rem;
      }
    }

    .price-currency {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .price-primary {
      color: var(--theme-primary);
    }

    .price-white {
      color: #ffffff;
    }

    /* Add to Cart Button - Better sizing and spacing */
    .cart-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.875rem;
      border: 1px solid;
      backdrop-filter: blur(8px);
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      cursor: pointer;
      flex-shrink: 0;
    }

    @media (min-width: 640px) {
      .cart-button {
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
      }
    }

    .cart-button:hover {
      transform: scale(1.06);
    }

    /* Light card button */
    .cart-button-light {
      background: var(--theme-dark);
      border-color: rgba(255, 255, 255, 0.15);
      color: var(--theme-cream);
    }

    .cart-button-light:hover {
      background: var(--theme-primary);
      border-color: var(--theme-primary);
      color: white;
    }

    /* Dark card button */
    .cart-button-dark {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .cart-button-dark:hover {
      background: var(--theme-primary);
      border-color: var(--theme-primary);
      color: white;
    }

    .cart-icon {
      width: 1.125rem;
      height: 1.125rem;
      transition: transform 0.2s ease;
    }

    @media (min-width: 640px) {
      .cart-icon {
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .cart-button:hover .cart-icon {
      transform: scale(1.1);
    }

    /* Loading Spinner */
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem 0;
      min-height: 400px; /* Match grid min-height */
    }

    .spinner {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: 3px solid color-mix(in srgb, var(--theme-primary) 15%, transparent);
      border-top-color: var(--theme-primary);
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Catalog Button */
    .catalog-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: var(--theme-cream);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(0, 168, 89, 0.2);
      border-radius: 60px;
      padding: 0.875rem 1.75rem;
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.02em;
      color: var(--theme-dark);
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      cursor: pointer;
      text-decoration: none;
      margin-top: 32px;
    }

    .catalog-button:hover {
      background: var(--theme-dark);
      border-color: var(--theme-dark);
      color: var(--theme-cream);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -8px rgba(0, 168, 89, 0.3);
    }

    .catalog-button:hover .catalog-icon {
      transform: translateX(0.25rem);
    }

    .catalog-icon {
      width: 1rem;
      height: 1rem;
      transition: transform 0.3s ease;
    }

    /* Animation Classes */
    .fade-in-up {
      animation: fadeInUp 0.5s ease forwards;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  template: `
    <section class="featured-bg relative overflow-hidden">
      <div class="featured-gradient-mesh"></div>
      <div class="aq-container relative z-10">
        
        <!-- Section Header -->
        <div class="section-header">
          <div class="eyebrow-badge">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            </span>
            <span class="eyebrow-text">{{ content.eyebrow }}</span>
          </div>

          <h2 class="main-title">
            {{ content.title.main }} 
            <span class="relative inline-block">
              <span class="relative z-10 gradient-text">{{ content.title.accent }}</span>
              <span class="title-underline"></span>
            </span>
          </h2>

          <p class="subtitle">
            {{ content.subtitle }}
          </p>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
        } @else {
          <!-- Products Grid -->
          <div class="products-grid" #productsGrid>
            @for (product of displayProducts(); track product.id; let idx = $index) {
              <div
                class="product-card group cursor-pointer"
                [class.product-card--light]="idx !== 1 && idx !== 3"
                [class.product-card--dark]="idx === 1 || idx === 3"
                [routerLink]="['/shop', product.id]"
              >
                <!-- Image Section with margin spacing -->
                <div class="image-wrapper">
                  <div class="image-inner">
                    <!-- Blur Background -->
                    <div 
                      class="image-blur-bg"
                      [class.image-blur-bg--light]="idx !== 1 && idx !== 3"
                      [class.image-blur-bg--dark]="idx === 1 || idx === 3"
                    ></div>
                    
                    <!-- Product Image -->
                    <div class="product-image">
                      <img 
                        [ngSrc]="product.imageUrl" 
                        [alt]="product.name" 
                        fill 
                        class="rounded-2xl object-cover"
                        priority
                      />
                    </div>
                  </div>

                  <!-- Badges -->
                  <div class="badges-container">
                    <span class="weight-badge">
                      {{ isWholesale() ? '5kg Bulk Crate' : (product.weight || '100g') }}
                    </span>
                    @if (isWholesale()) {
                      <span class="promo-badge" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1e293b;">
                        B2B -20%
                      </span>
                    } @else if (product.badge) {
                      <span class="promo-badge">
                        {{ product.badge }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Product Content with proper padding -->
                <div class="product-content">
                  <!-- Rating Stars -->
                  <div class="rating-stars">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <svg class="star-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    }
                    <span 
                      class="rating-count"
                      [class.text-white-60]="idx === 1 || idx === 3"
                      [class.text-dark-60]="idx !== 1 && idx !== 3"
                    >
                      ({{ product.reviews || 24 }})
                    </span>
                  </div>

                  <!-- Product Title -->
                  <h3 
                    class="product-title"
                    [class.text-white]="idx === 1 || idx === 3"
                    [class.text-dark]="idx !== 1 && idx !== 3"
                  >
                    {{ product.name }}{{ isWholesale() ? ' (Bulk Box)' : '' }}
                  </h3>

                  <!-- Subtle Divider -->
                  <div class="product-divider"></div>

                  <!-- Footer with Price and Cart -->
                  <div class="card-footer">
                    <div>
                      <span 
                        class="price-label"
                        [class.text-white]="idx === 1 || idx === 3"
                        [class.text-dark]="idx !== 1 && idx !== 3"
                      >{{ isWholesale() ? 'B2B WHOLESALE PRICE' : 'PRICE' }}</span>
                      <div 
                        class="price-value"
                        [class.price-white]="idx === 1 || idx === 3"
                        [class.price-primary]="idx !== 1 && idx !== 3"
                      >
                        @if (isWholesale()) {
                          <span class="price-currency">&#8377;</span>{{ getWholesalePrice(product.price) }} <span style="font-size: 0.7rem; font-weight: 600; opacity: 0.85;">/ Crate</span>
                        } @else {
                          <span class="price-currency">&#8377;</span>{{ product.price }}
                        }
                      </div>
                      @if (isWholesale()) {
                        <div [style.color]="(idx === 1 || idx === 3) ? 'rgba(255,255,255,0.6)' : 'var(--theme-dark-light)'" style="font-size: 0.65rem; font-weight: 600; margin-top: 0.15rem;">
                          Retail: <span style="text-decoration: line-through;">&#8377;{{ product.price * 50 }}</span>
                        </div>
                      }
                    </div>

                    <button
                      (click)="addToCart($event, product)"
                      class="cart-button"
                      [class.cart-button-light]="idx !== 1 && idx !== 3"
                      [class.cart-button-dark]="idx === 1 || idx === 3"
                      aria-label="Add to cart"
                      type="button"
                    >
                      <svg class="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- View Catalog Button -->
          <div class="mt-50 text-center">
            <a [routerLink]="content.catalogBtnLink" class="catalog-button">
              <span>{{ isWholesale() ? 'View B2B Wholesale Shop' : content.catalogBtnText }}</span>
              <svg class="catalog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
          </div>
        }
      </div>
    </section>
  `,
})
export class FeaturedProductsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  
  readonly productsGrid = viewChild<ElementRef>('productsGrid');
  readonly content = HOME_CONTENT.featured;
  readonly products = this.store.selectSignal(selectActiveProducts);
  readonly loading = this.store.selectSignal(selectProductLoading);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  readonly isWholesale = computed(() => this.settingsService.settings().userType === 'wholesale');
  
  readonly displayProducts = computed(() => {
    return this.products().slice(0, 4);
  });

  getWholesalePrice(retailPrice: number): number {
    // 5kg Bulk Crate is 50x of retail 100g pack. Apply a flat 20% discount (0.8x)
    return Math.round(retailPrice * 50 * 0.8);
  }

  constructor() {
    // Trigger animation when products are loaded and displayed
    effect(() => {
      const items = this.displayProducts();
      // Only animate if we have items and we are not loading
      if (items.length > 0 && !this.loading()) {
        // Use setTimeout to ensure Angular has finished rendering the DOM nodes
        setTimeout(() => this.animateProducts(), 0);
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.user()) {
      this.toast.show('Please sign in to access your cart!', 'info');
      this.router.navigate(['/login']);
      return;
    }

    const price = this.isWholesale() ? this.getWholesalePrice(product.price) : product.price;
    const weight = this.isWholesale() ? '5kg Bulk Crate' : (product.weight || '100g');

    const item: CartItem = {
      productId: product.id,
      name: product.name + (this.isWholesale() ? ' (Bulk Box)' : ''),
      imageUrl: product.imageUrl,
      price: price,
      quantity: 1,
      weight: weight,
    };
    this.store.dispatch(CartActions.addToCart({ item, uid: this.user()?.uid ?? null }));
  }

  private animateProducts(): void {
    const grid = this.productsGrid()?.nativeElement;
    if (grid) {
      // Kill existing animations on these elements to prevent conflicts
      gsap.killTweensOf(grid.children);
      
      gsap.fromTo(grid.children, 
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          onComplete: () => {
            // Optional: Add a class to indicate animation is done if needed for CSS hooks
            grid.classList.add('animation-complete');
          }
        }
      );
    }
  }
}