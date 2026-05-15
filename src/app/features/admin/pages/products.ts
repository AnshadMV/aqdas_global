import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal, computed,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductActions } from '../../../store/product/product.actions';
import { selectAllProducts, selectProductLoading } from '../../../store/product/product.selectors';
import type { Product } from '../../../shared/models';

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ReactiveFormsModule],
  host: { class: 'block' },
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-dark">Products</h1>
        <p class="font-body text-dark/50 mt-1">Manage your catalog, inventory, and pricing.</p>
      </div>
      <button (click)="openAdd()"
        class="bg-primary hover:bg-primary-dark text-white font-body font-semibold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Product
      </button>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-3xl shadow-sm border border-dark/5 overflow-hidden">
      <div class="p-4 border-b border-dark/5 flex flex-wrap items-center gap-4 justify-between">
        <div class="relative w-72">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="product-search" type="text" placeholder="Search products..."
            [value]="search()"
            (input)="search.set($any($event.target).value)"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex items-center gap-2">
          @for (tab of ['All','Active','Draft']; track tab) {
            <button (click)="activeTab.set(tab)"
              class="px-4 py-2 rounded-xl font-body text-sm font-medium transition-all"
              [class]="activeTab() === tab ? 'bg-primary text-white' : 'bg-secondary text-dark/70 hover:bg-secondary/80'">
              {{ tab }}
            </button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse" aria-label="Products table">
          <thead>
            <tr class="bg-secondary/50 font-body text-xs text-dark/50 uppercase tracking-wider">
              <th scope="col" class="p-4 font-semibold">Product</th>
              <th scope="col" class="p-4 font-semibold">Category</th>
              <th scope="col" class="p-4 font-semibold">Price</th>
              <th scope="col" class="p-4 font-semibold">Stock</th>
              <th scope="col" class="p-4 font-semibold">Status</th>
              <th scope="col" class="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark/5">
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr class="animate-pulse">
                  <td class="p-4"><div class="flex gap-3 items-center"><div class="w-12 h-12 bg-secondary rounded-lg"></div><div class="flex-1"><div class="h-4 bg-secondary rounded w-3/4 mb-1"></div><div class="h-3 bg-secondary rounded w-1/2"></div></div></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-20"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-16"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-10"></div></td>
                  <td class="p-4"><div class="h-6 bg-secondary rounded-full w-16"></div></td>
                  <td class="p-4 text-right"><div class="h-4 bg-secondary rounded w-16 ml-auto"></div></td>
                </tr>
              }
            } @else if (filtered().length === 0) {
              <tr>
                <td colspan="6" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-3 text-dark/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    <p class="font-body font-medium">No products found.</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (p of filtered(); track p.id) {
                <tr class="hover:bg-secondary/20 transition-colors group">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <img [src]="p.imageUrl" [alt]="p.name" width="48" height="48"
                        class="w-12 h-12 rounded-xl object-cover border border-dark/5 bg-cream" />
                      <div>
                        <p class="font-body font-semibold text-dark text-sm">{{ p.name }}</p>
                        <p class="font-body text-xs text-dark/50">{{ p.weight }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 font-body text-sm text-dark/70">{{ p.category }}</td>
                  <td class="p-4">
                    <div>
                      <p class="font-body text-sm font-bold text-dark">{{ p.price | currency:'INR':'symbol':'1.0-0' }}</p>
                      @if (p.originalPrice > p.price) {
                        <p class="font-body text-xs text-dark/40 line-through">{{ p.originalPrice | currency:'INR':'symbol':'1.0-0' }}</p>
                      }
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="font-body text-sm font-semibold"
                      [class]="p.stock < 10 ? 'text-red-500' : 'text-dark'">
                      {{ p.stock }}
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      [class]="p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                      {{ p.isActive ? 'Active' : 'Draft' }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="openEdit(p)"
                        class="p-2 text-dark/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        [attr.aria-label]="'Edit ' + p.name">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button (click)="deleteProduct(p)"
                        class="p-2 text-dark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        [attr.aria-label]="'Delete ' + p.name">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-dark/5 flex items-center justify-between">
        <p class="font-body text-xs text-dark/50">
          Showing <span class="font-semibold text-dark">{{ filtered().length }}</span> of <span class="font-semibold text-dark">{{ products().length }}</span> products
        </p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" [attr.aria-label]="editingProduct() ? 'Edit Product' : 'Add Product'">
        <div class="absolute inset-0 bg-dark/50 backdrop-blur-sm" (click)="closeModal()"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-dark/10 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
            <h2 class="font-heading text-xl font-bold text-dark">
              {{ editingProduct() ? 'Edit Product' : 'Add New Product' }}
            </h2>
            <button (click)="closeModal()" aria-label="Close modal" class="p-2 rounded-xl text-dark/40 hover:bg-secondary hover:text-dark transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveProduct()" class="p-8 space-y-5">
            <!-- Image Preview -->
            @if (form.get('imageUrl')?.value) {
              <div class="relative w-full h-40 rounded-2xl overflow-hidden bg-cream border border-dark/5">
                <img [src]="form.get('imageUrl')?.value" alt="Product preview" class="w-full h-full object-cover" />
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="md:col-span-2">
                <label for="prod-name" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Product Name *</label>
                <input id="prod-name" type="text" formControlName="name" placeholder="e.g. Premium Green Cardamom"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>

              <div class="md:col-span-2">
                <label for="prod-img" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Cloudinary Image URL *</label>
                <input id="prod-img" type="url" formControlName="imageUrl" placeholder="https://res.cloudinary.com/..."
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>

              <div>
                <label for="prod-price" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Price (₹) *</label>
                <input id="prod-price" type="number" formControlName="price" placeholder="299"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="prod-orig" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Original Price (₹)</label>
                <input id="prod-orig" type="number" formControlName="originalPrice" placeholder="399"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="prod-cat" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Category *</label>
                <input id="prod-cat" type="text" formControlName="category" placeholder="Cardamom"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="prod-weight" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Weight</label>
                <input id="prod-weight" type="text" formControlName="weight" placeholder="100g"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="prod-stock" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Stock *</label>
                <input id="prod-stock" type="number" formControlName="stock" placeholder="100"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="prod-badge" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Badge</label>
                <select id="prod-badge" formControlName="badge"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="">None</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New">New</option>
                  <option value="Organic">Organic</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label for="prod-short-desc" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Short Description</label>
                <input id="prod-short-desc" type="text" formControlName="shortDescription" placeholder="Brief tagline"
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div class="md:col-span-2">
                <label for="prod-desc" class="font-body text-sm font-semibold text-dark/70 mb-1.5 block">Description</label>
                <textarea id="prod-desc" formControlName="description" rows="3" placeholder="Full product description..."
                  class="w-full px-4 py-3 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"></textarea>
              </div>
            </div>

            <!-- Toggles -->
            <div class="flex items-center gap-8 py-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <div class="relative">
                  <input type="checkbox" formControlName="isActive" class="sr-only peer" id="toggle-active" />
                  <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors"></div>
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span class="font-body text-sm font-semibold text-dark">Active</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <div class="relative">
                  <input type="checkbox" formControlName="isFeatured" class="sr-only peer" id="toggle-featured" />
                  <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span class="font-body text-sm font-semibold text-dark">Featured</span>
              </label>
            </div>

            @if (formError()) {
              <p class="text-red-500 font-body text-sm" role="alert">{{ formError() }}</p>
            }

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button type="button" (click)="closeModal()"
                class="flex-1 px-6 py-3 rounded-xl border border-dark/10 font-body font-semibold text-dark/70 hover:bg-secondary transition-all">
                Cancel
              </button>
              <button type="submit" [disabled]="form.invalid || saving()"
                class="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-body font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                @if (saving()) {
                  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                }
                {{ saving() ? 'Saving...' : (editingProduct() ? 'Update Product' : 'Add Product') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirm Dialog -->
    @if (deletingProduct()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirm Delete">
        <div class="absolute inset-0 bg-dark/50 backdrop-blur-sm" (click)="deletingProduct.set(null)"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </div>
          <h3 class="font-heading text-xl font-bold text-dark mb-2">Delete Product?</h3>
          <p class="font-body text-dark/60 text-sm mb-6">
            "<strong>{{ deletingProduct()!.name }}</strong>" will be permanently removed. This cannot be undone.
          </p>
          <div class="flex gap-3">
            <button (click)="deletingProduct.set(null)"
              class="flex-1 px-4 py-3 rounded-xl border border-dark/10 font-body font-semibold text-dark/70 hover:bg-secondary transition-all">
              Cancel
            </button>
            <button (click)="confirmDelete()"
              class="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-body font-semibold hover:bg-red-600 transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminProductsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly products = this.store.selectSignal(selectAllProducts);
  readonly loading = this.store.selectSignal(selectProductLoading);

  readonly search = signal('');
  readonly activeTab = signal('All');
  readonly showModal = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly deletingProduct = signal<Product | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');

  readonly filtered = computed(() => {
    let list = this.products();
    const tab = this.activeTab();
    if (tab === 'Active') list = list.filter((p) => p.isActive);
    else if (tab === 'Draft') list = list.filter((p) => !p.isActive);
    const q = this.search().toLowerCase().trim();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    return list;
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    shortDescription: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    originalPrice: [0],
    category: ['', Validators.required],
    imageUrl: ['', Validators.required],
    images: [[] as string[]],
    stock: [0, [Validators.required, Validators.min(0)]],
    rating: [0],
    reviews: [0],
    badge: [''],
    isActive: [true],
    isFeatured: [false],
    weight: [''],
    createdAt: [''],
    updatedAt: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  openAdd(): void {
    this.editingProduct.set(null);
    this.form.reset({ isActive: true, isFeatured: false, price: 0, originalPrice: 0, stock: 0, rating: 0, reviews: 0, images: [] });
    this.formError.set('');
    this.showModal.set(true);
  }

  openEdit(p: Product): void {
    this.editingProduct.set(p);
    this.form.patchValue(p);
    this.formError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.saving.set(false);
  }

  saveProduct(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formError.set('');
    const v = this.form.getRawValue();
    const editing = this.editingProduct();

    if (editing) {
      const updated: Product = { ...editing, ...v };
      this.store.dispatch(ProductActions.updateProduct({ product: updated }));
    } else {
      const now = new Date().toISOString();
      const newProd = { ...v, createdAt: now, updatedAt: now } as Omit<Product, 'id'>;
      this.store.dispatch(ProductActions.addProduct({ product: newProd as Product }));
    }
    setTimeout(() => { this.saving.set(false); this.closeModal(); }, 800);
  }

  deleteProduct(p: Product): void {
    this.deletingProduct.set(p);
  }

  confirmDelete(): void {
    const p = this.deletingProduct();
    if (!p) return;
    this.store.dispatch(ProductActions.deleteProduct({ productId: p.id }));
    this.deletingProduct.set(null);
  }
}
