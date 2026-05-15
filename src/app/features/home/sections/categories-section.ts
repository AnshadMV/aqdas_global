import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import type { Category } from '../../../shared/models';

@Component({
  selector: 'app-categories-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'block' },
  styles: `
    .category-card { transition: all 0.5s cubic-bezier(0.23,1,0.32,1); }
    .category-card:hover { transform: scale(1.03); }
    .category-card:hover .category-overlay { background: linear-gradient(to top, rgba(26,26,26,0.85), rgba(53,94,59,0.3)); }
    .category-card:hover .category-img { transform: scale(1.1); }
    .category-img { transition: transform 0.8s cubic-bezier(0.23,1,0.32,1); }
    .category-overlay { transition: background 0.5s ease; }
  `,
  template: `
    <section class="py-24 bg-cream">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block font-body text-accent text-sm font-semibold tracking-widest uppercase mb-4">Browse By</span>
          <h2 class="font-heading text-4xl sm:text-5xl font-bold text-dark mb-4">Shop by Category</h2>
          <p class="font-body text-dark/50 text-lg max-w-2xl mx-auto">Explore our wide range of premium spice categories.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (category of categories(); track category.id; let i = $index) {
            <div class="category-card relative rounded-3xl overflow-hidden cursor-pointer shadow-lg" [class]="i === 0 ? 'sm:col-span-2 lg:col-span-2 h-80' : 'h-72'">
              <img [src]="category.imageUrl" [alt]="category.name" class="category-img absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div class="category-overlay absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <span class="font-body text-accent text-xs font-semibold uppercase tracking-widest">{{ category.productCount }} Products</span>
                <h3 class="font-heading text-2xl font-bold text-white mt-1">{{ category.name }}</h3>
                <p class="font-body text-white/60 text-sm mt-2">{{ category.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class CategoriesSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }
}
