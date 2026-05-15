import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminActions } from '../../../store/admin/admin.actions';
import {
  selectDashboardStats,
  selectStatsLoading,
} from '../../../store/admin/admin.selectors';
import { selectAllProducts } from '../../../store/product/product.selectors';
import { ProductActions } from '../../../store/product/product.actions';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, TitleCasePipe, RouterLink],
  host: { class: 'block' },
  template: `
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-heading text-3xl font-bold text-dark">Dashboard Overview</h1>
      <p class="font-body text-dark/50 mt-1">
        Welcome back, Admin. Here's a real-time snapshot.
      </p>
    </div>

    @if (statsLoading()) {
      <!-- Skeleton Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        @for (i of [1,2,3,4]; track i) {
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-dark/5 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-secondary"></div>
              <div class="flex-1">
                <div class="h-3 bg-secondary rounded mb-2 w-2/3"></div>
                <div class="h-7 bg-secondary rounded w-1/2"></div>
              </div>
            </div>
          </div>
        }
      </div>
    } @else if (stats()) {
      <!-- Real Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <!-- Revenue -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-dark/5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p class="font-body text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">Total Revenue</p>
            <p class="font-heading text-2xl font-bold text-dark">
              {{ stats()!.totalRevenue | currency:'INR':'symbol':'1.0-0' }}
            </p>
          </div>
        </div>

        <!-- Orders -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-dark/5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div>
            <p class="font-body text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">Total Orders</p>
            <p class="font-heading text-2xl font-bold text-dark">{{ stats()!.totalOrders }}</p>
            @if (stats()!.pendingOrdersCount > 0) {
              <p class="font-body text-xs text-amber-600 font-semibold mt-0.5">
                {{ stats()!.pendingOrdersCount }} pending
              </p>
            }
          </div>
        </div>

        <!-- Products -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-dark/5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <div>
            <p class="font-body text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">Active Products</p>
            <p class="font-heading text-2xl font-bold text-dark">{{ stats()!.activeProducts }}</p>
          </div>
        </div>

        <!-- Customers -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-dark/5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p class="font-body text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">Total Customers</p>
            <p class="font-heading text-2xl font-bold text-dark">{{ stats()!.totalCustomers }}</p>
          </div>
        </div>
      </div>
    }

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <!-- Order Status Breakdown -->
      @if (stats()) {
        <div class="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-dark/5">
          <h2 class="font-heading text-xl font-bold text-dark mb-6">Order Status</h2>
          <div class="space-y-3">
            @for (item of orderStatusItems(); track item.label) {
              <div>
                <div class="flex justify-between font-body text-sm mb-1">
                  <span class="text-dark/70 font-medium">{{ item.label }}</span>
                  <span class="font-semibold text-dark">{{ item.count }}</span>
                </div>
                <div class="w-full bg-secondary rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    [style.width.%]="item.pct"
                    [style.backgroundColor]="item.color">
                  </div>
                </div>
              </div>
            }
          </div>
          <a routerLink="/admin/orders" class="mt-6 block text-center font-body text-sm text-primary font-semibold hover:underline">
            Manage Orders →
          </a>
        </div>
      }

      <!-- Recent Orders -->
      <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-dark/5">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-heading text-xl font-bold text-dark">Recent Orders</h2>
          <a routerLink="/admin/orders" class="font-body text-sm text-primary font-semibold hover:underline">View all</a>
        </div>

        @if (statsLoading()) {
          <div class="space-y-4">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex items-center justify-between pb-4 border-b border-dark/5 animate-pulse">
                <div class="flex-1">
                  <div class="h-3.5 bg-secondary rounded w-1/3 mb-1.5"></div>
                  <div class="h-3 bg-secondary rounded w-1/4"></div>
                </div>
                <div class="h-6 w-20 bg-secondary rounded-full"></div>
              </div>
            }
          </div>
        } @else if (stats()?.recentOrders?.length) {
          <div class="space-y-3">
            @for (order of stats()!.recentOrders; track order.id) {
              <div class="flex items-center justify-between py-3 border-b border-dark/5 last:border-0">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/40"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <div>
                    <p class="font-body font-semibold text-dark text-sm">#{{ order.id.slice(-6).toUpperCase() }}</p>
                    <p class="font-body text-xs text-dark/50">{{ order.customerName }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-body text-sm font-bold text-dark">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</p>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        [class]="getStatusClass(order.status)">
                    {{ order.status | titlecase }}
                  </span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex items-center justify-center h-40 text-dark/30 font-body text-sm">
            No orders yet.
          </div>
        }
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-dark/5">
      <h2 class="font-heading text-xl font-bold text-dark mb-6">Quick Actions</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a routerLink="/admin/products"
           class="flex flex-col items-center gap-3 p-5 rounded-2xl border border-dark/10 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span class="font-body text-sm font-semibold text-dark text-center">Add Product</span>
        </a>
        <a routerLink="/admin/orders"
           class="flex flex-col items-center gap-3 p-5 rounded-2xl border border-dark/10 hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <span class="font-body text-sm font-semibold text-dark text-center">Manage Orders</span>
        </a>
        <a routerLink="/admin/customers"
           class="flex flex-col items-center gap-3 p-5 rounded-2xl border border-dark/10 hover:border-green-300 hover:bg-green-50 transition-all group cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span class="font-body text-sm font-semibold text-dark text-center">View Customers</span>
        </a>
        <a routerLink="/"
           class="flex flex-col items-center gap-3 p-5 rounded-2xl border border-dark/10 hover:border-amber-300 hover:bg-amber-50 transition-all group cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span class="font-body text-sm font-semibold text-dark text-center">View Store</span>
        </a>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly store = inject(Store);

  readonly stats = this.store.selectSignal(selectDashboardStats);
  readonly statsLoading = this.store.selectSignal(selectStatsLoading);

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadDashboardStats());
  }

  orderStatusItems() {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalOrders || 1;
    return [
      { label: 'Pending', count: s.pendingOrdersCount, color: '#d97706', pct: Math.round((s.pendingOrdersCount / total) * 100) },
      { label: 'Delivered', count: s.totalOrders - s.pendingOrdersCount, color: '#16a34a', pct: Math.round(((s.totalOrders - s.pendingOrdersCount) / total) * 100) },
    ];
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }
}
