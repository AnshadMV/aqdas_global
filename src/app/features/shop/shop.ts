import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { ProductActions } from '../../store/product/product.actions';
import { selectActiveProducts, selectProductLoading } from '../../store/product/product.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import type { Product, CartItem } from '../../shared/models';

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, FormsModule],
  host: { 'class': 'block' },
  styles: `
    /* ─── Background & Ambient ─── */
    .shop-section {
      background: linear-gradient(180deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 100%);
      position: relative;
      overflow: hidden;
      min-height: 100vh;
    }

    .shop-blob-1 {
      position: absolute; top: -10%; right: -5%; width: 50%; height: 50%;
      background: radial-gradient(circle, rgba(0,168,89,0.06), transparent 70%);
      filter: blur(100px); pointer-events: none;
    }

    .shop-blob-2 {
      position: absolute; bottom: -10%; left: -5%; width: 40%; height: 40%;
      background: radial-gradient(circle, rgba(245,158,11,0.05), transparent 70%);
      filter: blur(120px); pointer-events: none;
    }

    /* ─── Container ─── */
    .shop-container {
      max-width: 1280px; margin: 0 auto; padding: 5rem 1.5rem; position: relative; z-index: 10;
    }
    @media (min-width: 640px) { .shop-container { padding: 6rem 2rem; } }
    @media (min-width: 1024px) { .shop-container { padding: 8rem 2.5rem; } }

    /* ─── Header & Controls ─── */
    .shop-header { margin-bottom: 3rem; }
    .shop-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .shop-subtitle { color: var(--theme-dark-light); font-size: 1.05rem; margin-bottom: 2rem; }

    .shop-controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
    
    .search-wrap { position: relative; flex: 1; min-width: 240px; max-width: 320px; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--theme-dark-light); pointer-events: none; }
    .search-input {
      width: 100%; padding: 0.85rem 1rem 0.85rem 2.75rem;
      background: color-mix(in srgb, var(--theme-white) 80%, transparent); backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-radius: 1rem;
      font-size: 0.9rem; color: var(--theme-dark); outline: none; transition: all 0.3s;
    }
    .search-input:focus { border-color: #00a859; box-shadow: 0 0 0 4px rgba(0,168,89,0.1); background: var(--theme-white); }
    .search-input::placeholder { color: var(--theme-dark-light); opacity: 0.6; }

    .sort-select {
      padding: 0.85rem 2.5rem 0.85rem 1.25rem;
      background: color-mix(in srgb, var(--theme-white) 80%, transparent); backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-radius: 1rem;
      font-size: 0.9rem; color: var(--theme-dark); outline: none; cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 1rem center;
      transition: all 0.3s;
    }
    .sort-select:focus { border-color: #00a859; box-shadow: 0 0 0 4px rgba(0,168,89,0.1); background-color: var(--theme-white); }

    /* ─── Categories ─── */
    .categories-wrap { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 3rem; scrollbar-width: none; }
    .categories-wrap::-webkit-scrollbar { display: none; }
    .cat-btn {
      padding: 0.65rem 1.5rem; border-radius: 100px; font-size: 0.875rem; font-weight: 600;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); background: color-mix(in srgb, var(--theme-white) 60%, transparent); color: var(--theme-dark-light);
      cursor: pointer; transition: all 0.3s; white-space: nowrap;
    }
    .cat-btn:hover { border-color: #00a859; color: #00a859; background: rgba(0,168,89,0.05); }
    .cat-btn.active {
      background: linear-gradient(135deg, #00a859, #16a34a); color: #fff;
      border-color: transparent; box-shadow: 0 8px 20px -6px rgba(0,168,89,0.3);
    }

    /* ─── Grid & Cards ─── */
    .products-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
    @media (min-width: 640px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

    .product-card {
      background: var(--theme-cream); border-radius: 1.5rem; overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
      transition: all 0.4s cubic-bezier(0.22,1,0.36,1); display: flex; flex-direction: column;
    }
    .product-card:hover { transform: translateY(-8px); box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.16); border-color: rgba(0,168,89,0.15); }

    .card-img-wrap { position: relative; aspect-ratio: 1/1; background: var(--theme-cream-dark); overflow: hidden; }
    .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1); }
    .product-card:hover .card-img { transform: scale(1.08); }

    .card-badge {
      position: absolute; top: 1rem; left: 1rem;
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
      padding: 0.35rem 0.85rem; border-radius: 100px; box-shadow: 0 4px 12px -2px rgba(245,158,11,0.4);
    }

    .card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
    .card-title { font-size: 1.05rem; font-weight: 700; color: var(--theme-dark); margin-bottom: 0.35rem; letter-spacing: -0.01em; transition: color 0.2s; text-decoration: none; display: block; }
    .product-card:hover .card-title { color: #00a859; }
    .card-desc { font-size: 0.8rem; color: var(--theme-dark-light); line-height: 1.5; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .card-rating { display: flex; align-items: center; gap: 0.25rem; margin-bottom: 1.25rem; }
    .star-icon { color: #f59e0b; }
    .star-empty { color: color-mix(in srgb, var(--theme-dark) 15%, transparent); }
    .rating-count { font-size: 0.75rem; color: var(--theme-dark-light); margin-left: 0.25rem; opacity: 0.8; }

    .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
    .price-wrap { display: flex; flex-direction: column; }
    .price-current { font-size: 1.25rem; font-weight: 800; color: #00a859; line-height: 1; }
    .price-original { font-size: 0.8rem; color: var(--theme-dark-light); opacity: 0.7; text-decoration: line-through; margin-top: 0.25rem; }

    .add-cart-btn {
      width: 2.75rem; height: 2.75rem; border-radius: 50%;
      background: rgba(0,168,89,0.08); border: 1px solid rgba(0,168,89,0.15); color: #00a859;
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s;
    }
    .add-cart-btn:hover { background: #00a859; color: #fff; transform: scale(1.1); box-shadow: 0 8px 20px -4px rgba(0,168,89,0.4); }
    .add-cart-btn:active { transform: scale(0.95); }

    /* ─── Empty State ─── */
    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 5rem 2rem;
      background: color-mix(in srgb, var(--theme-white) 60%, transparent); backdrop-filter: blur(12px);
      border-radius: 2rem; border: 1px dashed color-mix(in srgb, var(--theme-dark) 15%, transparent);
    }
    .empty-icon { width: 4rem; height: 4rem; background: var(--theme-white); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); color: var(--theme-dark-light); }
    .empty-title { font-size: 1.5rem; font-weight: 800; color: var(--theme-dark); margin-bottom: 0.5rem; }
    .empty-desc { color: var(--theme-dark-light); margin-bottom: 2rem; }
    .empty-btn {
      background: linear-gradient(135deg, #00a859, #16a34a); color: #fff; font-weight: 600;
      padding: 0.85rem 2rem; border-radius: 100px; border: none; cursor: pointer;
      box-shadow: 0 8px 20px -6px rgba(0,168,89,0.3); transition: all 0.3s;
    }
    .empty-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -6px rgba(0,168,89,0.4); }

    /* ─── Skeleton Loader ─── */
    .skel-card { background: var(--theme-cream); border-radius: 1.5rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); }
    .skel-img { aspect-ratio: 1/1; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-line.w-75 { width: 75%; }
    .skel-line.w-50 { width: 50%; }
    .skel-line.w-full { width: 100%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `,
  template: `
    <section class="shop-section">
      <div class="shop-blob-1"></div>
      <div class="shop-blob-2"></div>
      
      <div class="shop-container">
        <div class="shop-header">
          <h1 class="shop-title">Shop Premium Spices</h1>
          <p class="shop-subtitle">Browse our complete collection of authentic, estate-sourced Kerala spices.</p>
          
          <div class="shop-controls">
            <div class="search-wrap">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search premium spices..." class="search-input" />
            </div>
            <select [(ngModel)]="sortOption" class="sort-select">
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div class="categories-wrap">
          @for (cat of categories; track cat) {
            <button 
              (click)="selectedCategory.set(cat)"
              class="cat-btn"
              [class.active]="selectedCategory() === cat">
              {{ cat }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="products-grid">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="skel-card">
                <div class="skel-img"></div>
                <div class="skel-body">
                  <div class="skel-line w-75"></div>
                  <div class="skel-line w-full"></div>
                  <div class="skel-line w-50"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="products-grid">
            @for (product of filteredProducts(); track product.id) {
              <div class="product-card">
                <a [routerLink]="['/shop', product.id]" class="card-img-wrap">
                  <img [ngSrc]="product.imageUrl" [alt]="product.name" class="card-img" fill />
                  @if (product.badge) {
                    <span class="card-badge">{{ product.badge }}</span>
                  }
                </a>
                <div class="card-body">
                  <a [routerLink]="['/shop', product.id]" class="card-title">{{ product.name }}</a>
                  <p class="card-desc">{{ product.shortDescription }}</p>
                  
                  <div class="card-rating">
                    @for (s of [1,2,3,4,5]; track s) {
                      <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" [attr.fill]="s <= product.rating ? 'currentColor' : 'none'" [attr.stroke]="s <= product.rating ? 'currentColor' : 'color-mix(in srgb, var(--theme-dark) 15%, transparent)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    }
                    <span class="rating-count">({{ product.reviews }})</span>
                  </div>

                  <div class="card-footer">
                    <div class="price-wrap">
                      <span class="price-current">₹{{ product.price }}</span>
                      @if (product.originalPrice > product.price) {
                        <span class="price-original">₹{{ product.originalPrice }}</span>
                      }
                    </div>
                    <button (click)="addToCart(product)" class="add-cart-btn" [attr.aria-label]="'Add ' + product.name + ' to cart'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            }
            
            @if (filteredProducts().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <h3 class="empty-title">No products found</h3>
                <p class="empty-desc">We couldn't find anything matching your search criteria.</p>
                <button (click)="resetFilters()" class="empty-btn">Clear Filters</button>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class ShopComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  
  readonly products = this.store.selectSignal(selectActiveProducts);
  readonly loading = this.store.selectSignal(selectProductLoading);
  private readonly user = this.store.selectSignal(selectCurrentUser);
  
  readonly categories = ['All', 'Spices', 'Masalas', 'Teas'];
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('All');
  readonly sortOption = signal('newest');

  readonly filteredProducts = computed(() => {
    let result = this.products();
    if (this.selectedCategory() !== 'All') {
      result = result.filter(p => p.category === this.selectedCategory());
    }
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query)
      );
    }
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
      productId: product.id, name: product.name, imageUrl: product.imageUrl,
      price: product.price, quantity: 1, weight: product.weight,
    };
    this.store.dispatch(CartActions.addToCart({ item, uid: this.user()?.uid ?? null }));
  }
}