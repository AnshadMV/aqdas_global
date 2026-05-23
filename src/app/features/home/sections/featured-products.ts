import { Component, ChangeDetectionStrategy, afterNextRender, signal, ElementRef, viewChild, inject, OnInit, DoCheck } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgOptimizedImage } from '@angular/common';
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
  host: { class: 'block' },
  styles: `
    .bg-grid {
      background-size: 50px 50px;
      background-image: linear-gradient(to right, rgba(0, 168, 89, 0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 168, 89, 0.04) 1px, transparent 1px);
    }
    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
    .mask-image-gradient {
      mask-image: radial-gradient(circle at center, black, transparent 85%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 85%);
    }
    .product-card {
      border-radius: 2rem;
      transition: transform 0.35s ease, box-shadow 0.35s ease, background-color 0.35s ease, border-color 0.35s ease;
    }
    .product-card:hover {
      transform: translateY(-6px);
    }
    .product-card--light {
      background: rgba(255, 255, 255, 0.68);
      border: 1px solid rgba(255, 255, 255, 0.88);
      box-shadow: 0 16px 35px rgba(15, 23, 42, 0.05);
    }
    .product-card--dark {
      background: rgba(15, 23, 42, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 18px 36px rgba(2, 6, 23, 0.24);
      color: white;
    }
    .btn-add {
      transition: transform 0.25s ease, background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
    }
    .btn-add:hover {
      transform: scale(1.05);
    }
  `,
  template: `
    <section class="home-section relative bg-[#F1F5F9]">
      <div class="absolute inset-0 bg-noise opacity-[0.035] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient opacity-60"></div>
      <div class="absolute top-[-10%] right-[10%] h-[55%] w-[55%] rounded-full bg-accent/10 blur-[160px] pointer-events-none mix-blend-multiply"></div>
      <div class="absolute bottom-[-10%] left-[10%] h-[55%] w-[55%] rounded-full bg-primary/10 blur-[160px] pointer-events-none mix-blend-multiply"></div>

      <div class="aq-container relative z-10">
        <div class="home-section__header">
          <div class="home-section__eyebrow">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            <span class="text-xs font-semibold uppercase tracking-[0.15em] text-primary sm:text-sm">Pure Premium Quality</span>
          </div>
          <h2 class="home-section__title">
            Featured <span class="relative inline-block mt-2">
              <span class="relative z-10 bg-gradient-to-r from-primary-dark via-primary to-accent-dark bg-clip-text text-transparent">Best Sellers</span>
              <svg class="absolute bottom-[-0.25rem] left-0 -z-10 h-3 w-full text-primary/20" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" fill="currentColor"/></svg>
            </span>
          </h2>
          <p class="home-section__copy">
            Handpicked, graded, and packed to lock in freshness. Discover a cleaner, more balanced showcase of AQDAS favorites.
          </p>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-20">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8" #productsGrid>
            @for (product of displayProducts(); track product.id; let idx = $index) {
              <div
                class="product-card group flex cursor-pointer flex-col justify-between p-5 sm:p-6"
                [class.product-card--light]="idx !== 1 && idx !== 3"
                [class.product-card--dark]="idx === 1 || idx === 3"
                [routerLink]="['/shop', product.id]"
              >
                <div>
                  <div class="relative aspect-square overflow-hidden rounded-[1.5rem] border border-white/50 bg-white/70 p-4">
                    <div class="absolute inset-0 flex items-center justify-center opacity-30">
                      <div class="h-[78%] w-[78%] rounded-full blur-[25px]" [class.bg-primary]="idx !== 1 && idx !== 3" [class.bg-white]="idx === 1 || idx === 3"></div>
                    </div>
                    <div class="relative h-full w-full">
                      <img [ngSrc]="product.imageUrl" [alt]="product.name" fill class="rounded-[1.25rem] object-cover transition-transform duration-700 ease-out group-hover:scale-105" priority />
                    </div>

                    <div class="absolute top-4 right-4 left-4 flex items-center justify-between gap-3">
                      <span class="rounded-lg border border-white/10 bg-[#0f172a]/80 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        {{ product.weight || '100g' }}
                      </span>
                      @if (product.badge) {
                        <span class="rounded-lg bg-accent px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-dark">
                          {{ product.badge }}
                        </span>
                      }
                    </div>
                  </div>

                  <div class="mt-6">
                    <div class="mb-2 flex items-center gap-1">
                      <div class="flex text-accent">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        }
                      </div>
                      <span class="ml-1 text-[10px] font-semibold opacity-60" [class.text-white/60]="idx === 1 || idx === 3" [class.text-dark/60]="idx !== 1 && idx !== 3">
                        ({{ product.reviews || 24 }})
                      </span>
                    </div>

                    <h3 class="font-heading text-xl font-bold tracking-wide sm:text-2xl" [class.text-white]="idx === 1 || idx === 3" [class.text-dark]="idx !== 1 && idx !== 3">
                      {{ product.name }}
                    </h3>
                  </div>
                </div>

                <div class="mt-8 flex items-center justify-between gap-4 border-t border-slate-200/50 pt-4" [class.border-white/10]="idx === 1 || idx === 3">
                  <div class="flex flex-col">
                    <span class="text-[9px] font-bold uppercase tracking-[0.24em] opacity-45" [class.text-white]="idx === 1 || idx === 3" [class.text-dark]="idx !== 1 && idx !== 3">Price</span>
                    <p class="flex items-baseline gap-1 font-body text-xl font-black" [class.text-white]="idx === 1 || idx === 3" [class.text-primary]="idx !== 1 && idx !== 3">
                      <span class="text-xs font-semibold">&#8377;</span>{{ product.price }}
                    </p>
                  </div>

                  <button
                    (click)="addToCart($event, product)"
                    class="btn-add flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-md backdrop-blur-md"
                    [class.bg-dark]="idx !== 1 && idx !== 3"
                    [class.text-white]="idx !== 1 && idx !== 3"
                    [class.border-dark/10]="idx !== 1 && idx !== 3"
                    [class.bg-white/10]="idx === 1 || idx === 3"
                    [class.text-white]="idx === 1 || idx === 3"
                    [class.border-white/15]="idx === 1 || idx === 3"
                    aria-label="Add to cart"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="mt-14 text-center">
            <a routerLink="/shop" class="home-button-secondary group mx-auto gap-4 bg-white/90 px-8">
              <span class="text-base font-bold tracking-wide">View Full Catalog</span>
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-dark/5 transition-all duration-300 group-hover:bg-dark group-hover:text-white">
                <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
            </a>
          </div>
        }
      </div>
    </section>
  `,
})
export class FeaturedProductsComponent implements OnInit, DoCheck {
  private readonly store = inject(Store);
  readonly productsGrid = viewChild<ElementRef>('productsGrid');

  readonly products = this.store.selectSignal(selectAllProducts);
  readonly loading = this.store.selectSignal(selectProductLoading);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  readonly displayProducts = signal<Product[]>([]);

  constructor() {
    afterNextRender(() => this.animateProducts());
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  ngDoCheck(): void {
    const all = this.products();
    if (all.length && this.displayProducts().length === 0) {
      this.displayProducts.set(all.slice(0, 4));
    }
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: 1,
      weight: product.weight,
    };
    this.store.dispatch(CartActions.addToCart({ item, uid: this.user()?.uid ?? null }));
  }

  private animateProducts(): void {
    const grid = this.productsGrid()?.nativeElement;
    if (grid) {
      gsap.from(grid.children, {
        opacity: 0,
        y: 50,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
        },
      });
    }
  }
}
