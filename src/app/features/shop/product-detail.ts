import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartActions } from '../../store/cart/cart.actions';
import { WishlistActions } from '../../store/wishlist/wishlist.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import type { Product, CartItem, WishlistItem } from '../../shared/models';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { 'class': 'block' },
  styles: `
    /* ─── Background ─── */
    .pdp-section {
      background: linear-gradient(180deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 100%);
      position: relative; overflow: hidden; min-height: 100vh;
    }
    .pdp-blob {
      position: absolute; top: 10%; right: -10%; width: 60%; height: 60%;
      background: radial-gradient(circle, rgba(0,168,89,0.05), transparent 70%);
      filter: blur(120px); pointer-events: none;
    }

    /* ─── Container ─── */
    .pdp-container {
      max-width: 1280px; margin: 0 auto; padding: 4rem 1.5rem; position: relative; z-index: 10;
    }
    @media (min-width: 640px) { .pdp-container { padding: 5rem 2rem; } }
    @media (min-width: 1024px) { .pdp-container { padding: 6rem 2.5rem; } }

    /* ─── Breadcrumb ─── */
    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--theme-dark-light); margin-bottom: 3rem; }
    .breadcrumb a { color: var(--theme-dark-light); text-decoration: none; transition: color 0.2s; }
    .breadcrumb a:hover { color: #00a859; }
    .breadcrumb-sep { color: color-mix(in srgb, var(--theme-dark) 15%, transparent); }
    .breadcrumb-current { color: var(--theme-dark); font-weight: 600; }

    /* ─── Grid Layout ─── */
    .pdp-grid { display: grid; grid-template-columns: 1fr; gap: 3rem; }
    @media (min-width: 1024px) { .pdp-grid { grid-template-columns: 1.1fr 1fr; gap: 5rem; align-items: start; } }

    /* ─── Image ─── */
    .pdp-image-wrap {
      position: relative; aspect-ratio: 4/5; border-radius: 2.5rem; overflow: hidden;
      background: var(--theme-cream-dark); box-shadow: 0 32px 64px -16px rgba(0,0,0,0.15);
      border: 8px solid color-mix(in srgb, var(--theme-white) 80%, transparent);
    }
    .pdp-image { width: 100%; height: 100%; object-fit: cover; }

    /* ─── Info ─── */
    .pdp-info { padding-top: 1rem; }
    .pdp-badge {
      display: inline-block; background: rgba(245,158,11,0.1); color: #d97706;
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      padding: 0.4rem 1rem; border-radius: 100px; margin-bottom: 1.25rem;
    }
    .pdp-title {
      font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 800; color: var(--theme-dark);
      letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 1rem;
    }

    .pdp-rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
    .stars-wrap { display: flex; gap: 0.15rem; }
    .star-icon { color: #f59e0b; }
    .star-empty { color: color-mix(in srgb, var(--theme-dark) 10%, transparent); }
    .rating-text { font-size: 0.875rem; color: var(--theme-dark-light); }

    .pdp-price-wrap {
      display: flex; align-items: baseline; gap: 1rem; margin-bottom: 2rem;
      padding-bottom: 2rem; border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
    }
    .pdp-price { font-size: 2.25rem; font-weight: 800; color: #00a859; }
    .pdp-original { font-size: 1.25rem; color: var(--theme-dark-light); opacity: 0.7; text-decoration: line-through; }
    .pdp-discount {
      background: rgba(0,168,89,0.1); color: #00a859; font-size: 0.8rem;
      font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 100px;
    }

    .pdp-desc { font-size: 1rem; line-height: 1.75; color: var(--theme-dark-light); margin-bottom: 2.5rem; max-width: 540px; }

    .pdp-weight-label { font-size: 0.85rem; font-weight: 600; color: var(--theme-dark); margin-bottom: 0.75rem; }
    .pdp-weight-val {
      display: inline-block; padding: 0.6rem 1.25rem; background: rgba(0,168,89,0.05);
      border: 1px solid rgba(0,168,89,0.2); color: #00a859; font-weight: 700;
      border-radius: 0.75rem; margin-bottom: 2rem;
    }

    .pdp-qty-row { display: flex; align-items: center; gap: 2rem; margin-bottom: 2.5rem; }
    .pdp-qty-label { font-size: 0.85rem; font-weight: 600; color: var(--theme-dark); }
    .qty-control { display: flex; align-items: center; border: 1px solid color-mix(in srgb, var(--theme-dark) 10%, transparent); border-radius: 1rem; overflow: hidden; background: var(--theme-white); }
    .qty-btn {
      width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; cursor: pointer; font-size: 1.25rem; color: var(--theme-dark-light); transition: all 0.2s;
    }
    .qty-btn:hover { background: rgba(0,168,89,0.05); color: #00a859; }
    .qty-val {
      width: 3rem; text-align: center; font-weight: 700; font-size: 1.1rem; color: var(--theme-dark);
      border-left: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-right: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      height: 3rem; display: flex; align-items: center; justify-content: center;
    }

    .pdp-actions { display: flex; gap: 1rem; margin-bottom: 2.5rem; }
    .btn-add-cart {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      padding: 1.125rem 2rem; background: linear-gradient(135deg, #00a859, #16a34a);
      color: #fff; font-weight: 700; font-size: 1rem; border: none; border-radius: 1.25rem;
      cursor: pointer; transition: all 0.3s; box-shadow: 0 12px 24px -8px rgba(0,168,89,0.4);
      position: relative; overflow: hidden;
    }
    .btn-add-cart::before {
      content: ''; position: absolute; top: -50%; left: -50%; width: 20%; height: 200%;
      background: rgba(255,255,255,0.2); transform: rotate(30deg); transition: none;
    }
    .btn-add-cart:hover::before { left: 150%; transition: left 0.8s; }
    .btn-add-cart:hover { transform: translateY(-3px); box-shadow: 0 16px 32px -8px rgba(0,168,89,0.5); }

    .btn-wishlist {
      width: 3.5rem; height: 3.5rem; display: flex; align-items: center; justify-content: center;
      background: var(--theme-white); border: 1px solid color-mix(in srgb, var(--theme-dark) 10%, transparent); border-radius: 1.25rem;
      cursor: pointer; color: var(--theme-dark-light); transition: all 0.3s;
    }
    .btn-wishlist:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.05); transform: translateY(-3px); }

    .pdp-stock {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem;
      background: rgba(0,168,89,0.05); border: 1px solid rgba(0,168,89,0.15);
      border-radius: 1rem; font-size: 0.875rem; font-weight: 600; color: #00a859;
    }
    .pdp-stock.out { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.15); color: #ef4444; }

    /* ─── Skeleton ─── */
    .pdp-skel-grid { display: grid; grid-template-columns: 1fr; gap: 3rem; margin-top: 2rem; }
    @media (min-width: 1024px) { .pdp-skel-grid { grid-template-columns: 1.1fr 1fr; gap: 5rem; } }
    .pdp-skel-img { aspect-ratio: 4/5; border-radius: 2.5rem; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .pdp-skel-info { display: flex; flex-direction: column; gap: 1.5rem; padding-top: 1rem; }
    .skel-line { height: 16px; border-radius: 8px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-line.w-25 { width: 25%; height: 12px; }
    .skel-line.w-75 { width: 75%; height: 28px; }
    .skel-line.w-50 { width: 50%; }
    .skel-line.w-full { width: 100%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `,
  template: `
    <section class="pdp-section">
      <div class="pdp-blob"></div>
      
      <div class="pdp-container">
        @if (loading()) {
          <div class="pdp-skel-grid">
            <div class="pdp-skel-img"></div>
            <div class="pdp-skel-info">
              <div class="skel-line w-25"></div>
              <div class="skel-line w-75"></div>
              <div class="skel-line w-50"></div>
              <div class="skel-line w-full"></div>
              <div class="skel-line w-full"></div>
              <div class="skel-line w-25" style="margin-top: 2rem;"></div>
            </div>
          </div>
        } @else if (product()) {
          
          <nav class="breadcrumb">
            <a routerLink="/">Home</a>
            <span class="breadcrumb-sep">/</span>
            <a routerLink="/shop">Shop</a>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">{{ product()!.name }}</span>
          </nav>

          <div class="pdp-grid">
            <!-- Image -->
            <div class="pdp-image-wrap">
              <img [ngSrc]="product()!.imageUrl" [alt]="product()!.name" fill priority class="pdp-image" />
            </div>

            <!-- Info -->
            <div class="pdp-info">
              @if (product()!.badge) {
                <span class="pdp-badge">{{ product()!.badge }}</span>
              }
              
              <h1 class="pdp-title">{{ product()!.name }}</h1>

              <div class="pdp-rating">
                <div class="stars-wrap">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" [attr.fill]="s <= product()!.rating ? 'currentColor' : 'none'" [attr.stroke]="s <= product()!.rating ? 'currentColor' : 'color-mix(in srgb, var(--theme-dark) 15%, transparent)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  }
                </div>
                <span class="rating-text">({{ product()!.reviews }} reviews)</span>
              </div>

              <div class="pdp-price-wrap">
                <span class="pdp-price">₹{{ product()!.price }}</span>
                @if (product()!.originalPrice > product()!.price) {
                  <span class="pdp-original">₹{{ product()!.originalPrice }}</span>
                  <span class="pdp-discount">{{ getDiscount() }}% OFF</span>
                }
              </div>

              <p class="pdp-desc">{{ product()!.description }}</p>

              <div class="pdp-weight-label">Weight / Volume</div>
              <div class="pdp-weight-val">{{ product()!.weight }}</div>

              <div class="pdp-qty-row">
                <span class="pdp-qty-label">Quantity</span>
                <div class="qty-control">
                  <button (click)="qty.set(Math.max(1, qty() - 1))" class="qty-btn" aria-label="Decrease">−</button>
                  <span class="qty-val">{{ qty() }}</span>
                  <button (click)="qty.set(qty() + 1)" class="qty-btn" aria-label="Increase">+</button>
                </div>
              </div>

              <div class="pdp-actions">
                <button (click)="addToCart()" class="btn-add-cart">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  Add to Cart
                </button>
                <button (click)="addToWishlist()" class="btn-wishlist" aria-label="Add to wishlist">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
              </div>

              <div class="pdp-stock" [class.out]="product()!.stock <= 0">
                @if (product()!.stock > 0) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  In Stock ({{ product()!.stock }} available)
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Out of Stock
                }
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class ProductDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  
  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly qty = signal(1);
  
  private readonly user = this.store.selectSignal(selectCurrentUser);
  protected readonly Math = Math;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getById(id).subscribe({
        next: (p) => {
          this.product.set(p);
          this.loading.set(false);
          if (p) {
            this.title.setTitle(`${p.name} - AQDAS Premium Spices`);
            this.meta.updateTag({ name: 'description', content: p.shortDescription || p.description });
            this.meta.updateTag({ property: 'og:title', content: p.name });
            this.meta.updateTag({ property: 'og:description', content: p.shortDescription || p.description });
            this.meta.updateTag({ property: 'og:image', content: p.imageUrl });
          }
        },
        error: () => this.loading.set(false),
      });
    }
  }

  getDiscount(): number {
    const p = this.product();
    if (!p || p.originalPrice <= p.price) return 0;
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    const item: CartItem = { productId: p.id, name: p.name, imageUrl: p.imageUrl, price: p.price, quantity: this.qty(), weight: p.weight };
    this.store.dispatch(CartActions.addToCart({ item, uid: this.user()?.uid ?? null }));
  }

  addToWishlist(): void {
    const p = this.product();
    if (!p) return;
    const item: WishlistItem = { productId: p.id, name: p.name, imageUrl: p.imageUrl, price: p.price, originalPrice: p.originalPrice, addedAt: new Date().toISOString() };
    this.store.dispatch(WishlistActions.addToWishlist({ item, uid: this.user()?.uid ?? null }));
  }
}