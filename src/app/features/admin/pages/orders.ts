import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminActions } from '../../../store/admin/admin.actions';
import {
  selectFilteredOrders,
  selectOrdersLoading,
  selectOrderStatusFilter,
  selectOrderSearchQuery,
  selectOrdersCountByStatus,
} from '../../../store/admin/admin.selectors';
import type { Order } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, FormsModule],
  host: { class: 'block' },
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-dark">Orders</h1>
        <p class="font-body text-dark/50 mt-1">View and manage all customer orders.</p>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="flex gap-2 flex-wrap mb-6">
      @for (tab of statusTabs; track tab.value) {
        <button (click)="setFilter(tab.value === 'all' ? null : tab.value)"
          class="px-4 py-2 rounded-xl font-body text-sm font-semibold transition-all flex items-center gap-2"
          [class]="(tab.value === 'all' ? activeFilter() === null : activeFilter() === tab.value) ? 'bg-primary text-white shadow-sm' : 'bg-white text-dark/60 border border-dark/10 hover:bg-secondary'">
          {{ tab.label }}
          <span class="text-xs px-1.5 py-0.5 rounded-full"
            [class]="(tab.value === 'all' ? activeFilter() === null : activeFilter() === tab.value) ? 'bg-white/20 text-white' : 'bg-dark/10'">
            {{ getCount(tab.value) }}
          </span>
        </button>
      }
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-dark/5 overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-dark/5 flex flex-wrap items-center gap-4">
        <div class="relative flex-1 min-w-52">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="order-search" type="text" placeholder="Search by order ID, customer..."
            [value]="searchQuery()"
            (input)="onSearch($any($event.target).value)"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse" aria-label="Orders table">
          <thead>
            <tr class="bg-secondary/50 font-body text-xs text-dark/50 uppercase tracking-wider">
              <th scope="col" class="p-4 font-semibold">Order ID</th>
              <th scope="col" class="p-4 font-semibold">Date</th>
              <th scope="col" class="p-4 font-semibold">Customer</th>
              <th scope="col" class="p-4 font-semibold">Items</th>
              <th scope="col" class="p-4 font-semibold">Total</th>
              <th scope="col" class="p-4 font-semibold">Status</th>
              <th scope="col" class="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark/5">
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr class="animate-pulse">
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-28"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-24"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-32 mb-1"></div><div class="h-3 bg-secondary rounded w-40"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-8"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-20"></div></td>
                  <td class="p-4"><div class="h-6 bg-secondary rounded-full w-20"></div></td>
                  <td class="p-4 text-right"><div class="h-4 bg-secondary rounded w-16 ml-auto"></div></td>
                </tr>
              }
            } @else if (orders().length === 0) {
              <tr>
                <td colspan="7" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-3 text-dark/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <p class="font-body font-medium text-sm">No orders found.</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (order of orders(); track order.id) {
                <tr class="hover:bg-secondary/20 transition-colors group">
                  <td class="p-4 font-body font-bold text-dark text-sm">#{{ order.id.slice(-6).toUpperCase() }}</td>
                  <td class="p-4 font-body text-sm text-dark/60">{{ order.createdAt | date:'dd MMM yyyy' }}</td>
                  <td class="p-4">
                    <p class="font-body font-semibold text-dark text-sm">{{ order.customerName }}</p>
                    <p class="font-body text-xs text-dark/50">{{ order.customerEmail }}</p>
                  </td>
                  <td class="p-4 font-body text-sm text-dark/70">{{ order.items.length }} item(s)</td>
                  <td class="p-4 font-body text-sm font-bold text-dark">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td class="p-4">
                    <select
                      [value]="order.status"
                      (change)="updateStatus(order.id, $any($event.target).value)"
                      [attr.aria-label]="'Order status for ' + order.id"
                      class="text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                      [class]="getStatusClass(order.status)">
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td class="p-4 text-right">
                    <button (click)="viewOrder(order)"
                      class="font-body text-xs font-semibold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                    </button>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t border-dark/5 flex items-center justify-between">
        <p class="font-body text-xs text-dark/50">
          Showing <span class="font-semibold text-dark">{{ orders().length }}</span> orders
        </p>
      </div>
    </div>

    <!-- Order Detail Modal -->
    @if (selectedOrder()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Order Details">
        <div class="absolute inset-0 bg-dark/50 backdrop-blur-sm" (click)="selectedOrder.set(null)"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-dark/10 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
            <h2 class="font-heading text-xl font-bold text-dark">
              Order #{{ selectedOrder()!.id.slice(-6).toUpperCase() }}
            </h2>
            <button (click)="selectedOrder.set(null)" aria-label="Close" class="p-2 rounded-xl text-dark/40 hover:bg-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-secondary/40 rounded-2xl p-4">
                <p class="font-body text-xs text-dark/50 uppercase tracking-wide mb-1">Customer</p>
                <p class="font-body font-semibold text-dark text-sm">{{ selectedOrder()!.customerName }}</p>
                <p class="font-body text-xs text-dark/60">{{ selectedOrder()!.customerEmail }}</p>
              </div>
              <div class="bg-secondary/40 rounded-2xl p-4">
                <p class="font-body text-xs text-dark/50 uppercase tracking-wide mb-1">Date</p>
                <p class="font-body font-semibold text-dark text-sm">{{ selectedOrder()!.createdAt | date:'dd MMM yyyy, h:mm a' }}</p>
              </div>
              <div class="bg-secondary/40 rounded-2xl p-4">
                <p class="font-body text-xs text-dark/50 uppercase tracking-wide mb-1">Payment</p>
                <p class="font-body font-semibold text-dark text-sm">{{ selectedOrder()!.paymentMethod | titlecase }}</p>
              </div>
              <div class="bg-secondary/40 rounded-2xl p-4">
                <p class="font-body text-xs text-dark/50 uppercase tracking-wide mb-1">Status</p>
                <span class="inline-block text-xs font-bold px-3 py-1 rounded-full" [class]="getStatusClass(selectedOrder()!.status)">
                  {{ selectedOrder()!.status | titlecase }}
                </span>
              </div>
            </div>

            <div>
              <p class="font-body text-xs text-dark/50 uppercase tracking-wide mb-3">Shipping Address</p>
              <div class="bg-secondary/40 rounded-2xl p-4 font-body text-sm text-dark">
                {{ selectedOrder()!.shippingAddress.address }},
                {{ selectedOrder()!.shippingAddress.city }},
                {{ selectedOrder()!.shippingAddress.postalCode }}
              </div>
            </div>

            <div>
              <p class="font-body text-xs text-dark/50 uppercase tracking-wide mb-3">Items</p>
              <div class="space-y-2">
                @for (item of selectedOrder()!.items; track $index) {
                  <div class="flex justify-between items-center py-2 border-b border-dark/5 last:border-0">
                    <span class="font-body text-sm text-dark">{{ item.name }} × {{ item.quantity }}</span>
                    <span class="font-body text-sm font-bold text-dark">{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                }
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-dark/10 mt-2">
                <span class="font-body font-bold text-dark">Total</span>
                <span class="font-heading text-lg font-bold text-primary">{{ selectedOrder()!.total | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminOrdersComponent implements OnInit {
  private readonly store = inject(Store);

  readonly orders = this.store.selectSignal(selectFilteredOrders);
  readonly loading = this.store.selectSignal(selectOrdersLoading);
  readonly activeFilter = this.store.selectSignal(selectOrderStatusFilter);
  readonly searchQuery = this.store.selectSignal(selectOrderSearchQuery);
  readonly counts = this.store.selectSignal(selectOrdersCountByStatus);
  readonly selectedOrder = signal<Order | null>(null);

  readonly statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadOrders());
  }

  setFilter(status: string | null): void {
    this.store.dispatch(AdminActions.setOrderStatusFilter({ status }));
  }

  onSearch(search: string): void {
    this.store.dispatch(AdminActions.setOrderSearch({ search }));
  }

  updateStatus(orderId: string, status: string): void {
    this.store.dispatch(AdminActions.updateOrderStatus({ orderId, status }));
  }

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  /** Safely read count by tab value key from the typed selector result */
  getCount(key: string): number {
    const c = this.counts();
    return (c as Record<string, number>)[key] ?? 0;
  }
}
