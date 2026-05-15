import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { ProductActions } from '../../store/product/product.actions';
import { selectAllProducts, selectProductLoading } from '../../store/product/product.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import { WishlistActions } from '../../store/wishlist/wishlist.actions';
import type { Product, CartItem, WishlistItem } from '../../shared/models';

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, FormsModule],
  host: { 'class': 'block' },
  styles: `
    .product-card { transition: all 0.4s cubic-bezier(0.23,1,0.32,1); }
    .product-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -12px rgba(53,94,59,0.12); }
    .product-card:hover .product-img { transform: scale(1.06); }
    .product-img { transition: transform 0.5s ease; }
  `,
  template: `
    <section class="py-10 bg-secondary min-h-screen">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 class="font-heading text-4xl font-bold text-dark mb-2">Shop All Spices</h1>
            <p class="font-body text-dark/50">Browse our complete collection of premium Kerala spices</p>
          </div>
          
          <div class="flex flex-wrap items-center gap-4">
            <div class="relative w-full sm:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search products..." class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" />
            </div>
            <select [(ngModel)]="sortOption" class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dark/10 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm text-dark cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          @for (cat of categories; track cat) {
            <button 
              (click)="selectedCategory.set(cat)"
              class="whitespace-nowrap px-5 py-2 rounded-full font-body text-sm font-semibold transition-all border"
              [class]="selectedCategory() === cat ? 'bg-primary border-primary text-white' : 'bg-white border-dark/10 text-dark/70 hover:border-primary/50'">
              {{ cat }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-dark/5 animate-pulse">
                <div class="bg-dark/10 h-56 w-full"></div>
                <div class="p-5 space-y-3">
                  <div class="h-4 bg-dark/10 rounded-full w-3/4"></div>
                  <div class="h-3 bg-dark/5 rounded-full w-full"></div>
                  <div class="h-3 bg-dark/5 rounded-full w-5/6"></div>
                  <div class="flex items-center gap-1 pt-1">
                    @for (s of [1,2,3,4,5]; track s) {
                      <div class="w-3 h-3 bg-dark/10 rounded-full"></div>
                    }
                  </div>
                  <div class="flex items-center justify-between pt-2">
                    <div class="h-5 bg-dark/10 rounded-full w-16"></div>
                    <div class="w-9 h-9 bg-dark/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (product of filteredProducts(); track product.id) {
              <div class="product-card bg-white rounded-2xl overflow-hidden shadow-sm group">
                <a [routerLink]="['/shop', product.id]" class="block relative overflow-hidden bg-cream h-56">
                  <img [ngSrc]="product.imageUrl" [alt]="product.name" class="product-img object-cover" fill />
                  @if (product.badge) {
                    <span class="absolute top-3 left-3 bg-accent text-dark text-[10px] font-body font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">{{ product.badge }}</span>
                  }
                </a>
                <div class="p-5">
                  <a [routerLink]="['/shop', product.id]">
                    <h3 class="font-heading text-base font-semibold text-dark mb-1 group-hover:text-primary transition-colors">{{ product.name }}</h3>
                  </a>
                  <p class="font-body text-dark/40 text-xs mb-3 line-clamp-1">{{ product.shortDescription }}</p>
                  <div class="flex items-center gap-1 mb-3">
                    @for (s of [1,2,3,4,5]; track s) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" [attr.fill]="s <= product.rating ? '#D4A017' : 'none'" [attr.stroke]="s <= product.rating ? '#D4A017' : '#ccc'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    }
                    <span class="text-[10px] text-dark/30 ml-1">({{ product.reviews }})</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-heading text-lg font-bold text-primary">₹{{ product.price }}</span>
                      @if (product.originalPrice > product.price) {
                        <span class="font-body text-xs text-dark/30 line-through ml-2">₹{{ product.originalPrice }}</span>
                      }
                    </div>
                    <button (click)="addToCart(product)" class="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all active:scale-90" [attr.aria-label]="'Add ' + product.name + ' to cart'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
          
          @if (filteredProducts().length === 0) {
            <div class="text-center py-20 bg-white/50 rounded-3xl border border-dark/5">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-dark/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 class="font-heading text-xl font-bold text-dark mb-2">No products found</h3>
              <p class="font-body text-dark/50 mb-6">We couldn't find anything matching your search criteria.</p>
              <button (click)="resetFilters()" class="bg-primary hover:bg-primary-dark text-white font-body font-semibold px-6 py-2.5 rounded-full transition-all">
                Clear Filters
              </button>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class ShopComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly products = this.store.selectSignal(selectAllProducts);
  readonly loading = this.store.selectSignal(selectProductLoading);
  private readonly user = this.store.selectSignal(selectCurrentUser);

  readonly categories = ['All', 'Spices', 'Masalas', 'Teas'];
  
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('All');
  readonly sortOption = signal('newest');

  readonly filteredProducts = computed(() => {
    let result = this.products();
    
    // Category Filter
    if (this.selectedCategory() !== 'All') {
      result = result.filter(p => p.category === this.selectedCategory());
    }
    
    // Search Filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query)
      );
    }
    
    // Sorting
    result = [...result].sort((a, b) => {
      switch (this.sortOption()) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'newest': default: 
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return result;
  });

  ngOnInit(): void {
    this.title.setTitle('Shop Premium Spices - AQDAS');
    this.meta.updateTag({ name: 'description', content: 'Browse our complete collection of premium authentic Kerala spices including cardamom, black pepper, and cinnamon.' });
    this.store.dispatch(ProductActions.loadProducts());
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('All');
    this.sortOption.set('newest');
  }

  addToCart(product: Product): void {
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
}
