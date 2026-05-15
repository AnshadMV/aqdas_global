import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { signal } from '@angular/core';
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
  template: `
    <section class="py-10 bg-secondary min-h-screen">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        @if (loading()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse mt-8">
            <div class="bg-dark/10 rounded-3xl h-[500px] w-full"></div>
            <div class="py-4 space-y-6">
              <div class="h-6 bg-dark/10 rounded-full w-24"></div>
              <div class="h-10 bg-dark/10 rounded-full w-3/4"></div>
              <div class="flex items-center gap-2">
                <div class="h-4 bg-dark/10 rounded-full w-32"></div>
              </div>
              <div class="h-12 bg-dark/10 rounded-full w-1/3"></div>
              <div class="space-y-3">
                <div class="h-4 bg-dark/5 rounded-full w-full"></div>
                <div class="h-4 bg-dark/5 rounded-full w-full"></div>
                <div class="h-4 bg-dark/5 rounded-full w-5/6"></div>
              </div>
              <div class="flex gap-4 pt-4">
                <div class="h-14 bg-dark/10 rounded-xl w-2/3"></div>
                <div class="h-14 bg-dark/10 rounded-xl w-1/3"></div>
              </div>
            </div>
          </div>
        } @else if (product()) {
          <nav class="mb-8 font-body text-sm text-dark/40">
            <a routerLink="/" class="hover:text-primary">Home</a> /
            <a routerLink="/shop" class="hover:text-primary">Shop</a> /
            <span class="text-dark">{{ product()!.name }}</span>
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Image -->
            <div class="relative bg-white rounded-3xl overflow-hidden shadow-sm h-[500px]">
              <img [ngSrc]="product()!.imageUrl" [alt]="product()!.name" fill priority class="object-cover" />
            </div>

            <!-- Info -->
            <div class="py-4">
              @if (product()!.badge) {
                <span class="inline-block bg-accent/10 text-accent text-xs font-body font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">{{ product()!.badge }}</span>
              }
              <h1 class="font-heading text-3xl lg:text-4xl font-bold text-dark mb-3">{{ product()!.name }}</h1>

              <div class="flex items-center gap-2 mb-4">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" [attr.fill]="s <= product()!.rating ? '#D4A017' : 'none'" [attr.stroke]="s <= product()!.rating ? '#D4A017' : '#ccc'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                }
                <span class="font-body text-sm text-dark/40">({{ product()!.reviews }} reviews)</span>
              </div>

              <div class="flex items-baseline gap-3 mb-6">
                <span class="font-heading text-3xl font-bold text-primary">₹{{ product()!.price }}</span>
                @if (product()!.originalPrice > product()!.price) {
                  <span class="font-body text-lg text-dark/30 line-through">₹{{ product()!.originalPrice }}</span>
                  <span class="font-body text-sm text-green-600 font-semibold">{{ getDiscount() }}% OFF</span>
                }
              </div>

              <p class="font-body text-dark/60 leading-relaxed mb-8">{{ product()!.description }}</p>

              <div class="flex items-center gap-3 mb-6">
                <span class="font-body text-sm text-dark/50">Weight:</span>
                <span class="px-4 py-1.5 rounded-lg border-2 border-primary bg-primary/5 font-body text-sm font-semibold text-primary">{{ product()!.weight }}</span>
              </div>

              <div class="flex items-center gap-3 mb-8">
                <div class="flex items-center gap-2 border border-dark/10 rounded-xl">
                  <button (click)="qty.set(Math.max(1, qty() - 1))" class="w-10 h-10 flex items-center justify-center hover:bg-dark/5 rounded-l-xl font-body" aria-label="Decrease">−</button>
                  <span class="w-10 text-center font-body font-semibold">{{ qty() }}</span>
                  <button (click)="qty.set(qty() + 1)" class="w-10 h-10 flex items-center justify-center hover:bg-dark/5 rounded-r-xl font-body" aria-label="Increase">+</button>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <button (click)="addToCart()" class="flex-1 bg-primary hover:bg-primary-dark text-white font-body font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  Add to Cart
                </button>
                <button (click)="addToWishlist()" class="w-14 h-14 rounded-xl border-2 border-dark/10 hover:border-red-400 hover:bg-red-50 flex items-center justify-center transition-all active:scale-95" aria-label="Add to wishlist">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/40 hover:text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
              </div>

              <div class="mt-8 p-4 bg-primary/5 rounded-xl">
                <p class="font-body text-sm text-primary font-medium">
                  @if (product()!.stock > 0) {
                    ✓ In Stock ({{ product()!.stock }} available)
                  } @else {
                    ✗ Out of Stock
                  }
                </p>
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
