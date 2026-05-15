import { Component, ChangeDetectionStrategy, afterNextRender, signal, ElementRef, viewChild, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { ProductActions } from '../../../store/product/product.actions';
import { CartActions } from '../../../store/cart/cart.actions';
import { selectAllProducts, selectProductLoading } from '../../../store/product/product.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { Product, CartItem } from '../../../shared/models';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-featured-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { 'class': 'block' },
  styles: `
    .product-card { transition: all 0.4s cubic-bezier(0.23,1,0.32,1); }
    .product-card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(53,94,59,0.15); }
    .product-card:hover .product-img { transform: scale(1.08); }
    .product-img { transition: transform 0.6s cubic-bezier(0.23,1,0.32,1); }
    .add-btn { transform: translateY(10px); opacity: 0; transition: all 0.3s ease; }
    .product-card:hover .add-btn { transform: translateY(0); opacity: 1; }
  `,
  template: `
    <section class="py-24 bg-secondary">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block font-body text-accent text-sm font-semibold tracking-widest uppercase mb-4">Our Collection</span>
          <h2 class="font-heading text-4xl sm:text-5xl font-bold text-dark mb-4">Featured Products</h2>
          <p class="font-body text-dark/50 text-lg max-w-2xl mx-auto">Discover our handpicked selection of premium Kerala spices, sourced directly from organic farms.</p>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" #productsGrid>
            @for (product of products(); track product.id) {
              <div class="product-card bg-white rounded-3xl overflow-hidden shadow-sm cursor-pointer group">
                <a [routerLink]="['/shop', product.id]" class="block relative overflow-hidden bg-cream h-64">
                  <img [ngSrc]="product.imageUrl" [alt]="product.name" class="product-img object-cover" fill />
                  @if (product.badge) {
                    <span class="absolute top-4 left-4 bg-accent text-dark text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1 rounded-full">{{ product.badge }}</span>
                  }
                </a>
                <div class="absolute top-4 right-4">
                  <button class="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-red-500 transition-all shadow-sm" aria-label="Add to wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                </div>
                <div class="p-6">
                  <p class="font-body text-xs text-accent font-semibold uppercase tracking-wider mb-1">{{ product.category }}</p>
                  <h3 class="font-heading text-lg font-semibold text-dark mb-2 group-hover:text-primary transition-colors">{{ product.name }}</h3>
                  <p class="font-body text-dark/40 text-sm mb-4 line-clamp-2">{{ product.shortDescription }}</p>
                  <div class="flex items-center gap-1 mb-3">
                    @for (star of [1,2,3,4,5]; track star) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" [attr.fill]="star <= product.rating ? '#D4A017' : 'none'" [attr.stroke]="star <= product.rating ? '#D4A017' : '#ccc'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    }
                    <span class="font-body text-xs text-dark/40 ml-1">({{ product.reviews }})</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-heading text-xl font-bold text-primary">₹{{ product.price }}</span>
                      @if (product.originalPrice > product.price) {
                        <span class="font-body text-sm text-dark/30 line-through ml-2">₹{{ product.originalPrice }}</span>
                      }
                    </div>
                    <button (click)="addToCart($event, product)" class="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all active:scale-90" [attr.aria-label]="'Add ' + product.name + ' to cart'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <div class="text-center mt-16">
          <a routerLink="/shop" class="inline-flex items-center gap-2 border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white text-primary font-body font-semibold px-10 py-4 rounded-full transition-all duration-300 active:scale-[0.98]">
            View All Products
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  `,
})
export class FeaturedProductsComponent implements OnInit {
  private readonly store = inject(Store);
  readonly productsGrid = viewChild<ElementRef>('productsGrid');

  readonly products = this.store.selectSignal(selectAllProducts);
  readonly loading = this.store.selectSignal(selectProductLoading);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  constructor() {
    afterNextRender(() => this.animateProducts());
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();
    const item: CartItem = { productId: product.id, name: product.name, imageUrl: product.imageUrl, price: product.price, quantity: 1, weight: product.weight };
    this.store.dispatch(CartActions.addToCart({ item, uid: this.user()?.uid ?? null }));
  }

  private animateProducts(): void {
    const grid = this.productsGrid()?.nativeElement;
    if (grid) {
      gsap.from(grid.children, { 
        opacity: 0, 
        y: 60, 
        duration: 0.7, 
        stagger: 0.1, 
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
        }
      });
    }
  }
}
