import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminActions } from '../../../store/admin/admin.actions';
import {
  selectFilteredOrders, selectOrdersLoading, selectOrderStatusFilter,
  selectOrderSearchQuery, selectOrdersCountByStatus,
} from '../../../store/admin/admin.selectors';
import type { Order } from '../../../core/services/order.service';
import { AdminModalComponent } from '../components/modal';

@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, FormsModule, AdminModalComponent],
  host: { class: 'block' },
  styles: `
    /* ─── Header ─── */
    .admin-header { margin-bottom: 2rem; }
    .header-title { font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; }
    .header-desc { color: var(--theme-dark-light); font-size: 0.95rem; margin-top: 0.25rem; }

    /* ─── Status Tabs ─── */
    .status-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
    .status-tab {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.125rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); background: color-mix(in srgb, var(--theme-cream) 60%, transparent); color: var(--theme-dark-light);
      cursor: pointer; transition: all 0.2s; white-space: nowrap;
    }
    .status-tab:hover { border-color: color-mix(in srgb, var(--theme-primary) 30%, transparent); background: color-mix(in srgb, var(--theme-cream) 90%, transparent); }
    .status-tab.active { background: var(--theme-primary); color: #fff; border-color: transparent; box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--theme-primary) 30%, transparent); }
    .tab-count {
      font-size: 0.6rem; font-weight: 800; padding: 0.15rem 0.4rem; border-radius: 100px;
      background: color-mix(in srgb, var(--theme-dark) 6%, transparent); color: inherit;
    }
    .status-tab.active .tab-count { background: rgba(255,255,255,0.2); }

    /* ─── Toolbar ─── */
    .toolbar-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 9%, transparent); border-radius: 2rem 2rem 0 0;
      padding: 1rem 1.5rem; border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
    }
    .search-wrap { position: relative; width: 100%; max-width: 24rem; }
    .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--theme-dark-light); pointer-events: none; }
    .search-input {
      width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem;
      background: color-mix(in srgb, var(--theme-cream) 80%, transparent); border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-radius: 0.875rem;
      font-size: 0.8rem; color: var(--theme-dark); outline: none; transition: all 0.3s;
    }
    .search-input:focus { border-color: var(--theme-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 8%, transparent); background: var(--theme-cream); }
    .search-input::placeholder { color: var(--theme-dark-light); }

    /* ─── Table ─── */
    .table-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 9%, transparent); border-radius: 0 0 2rem 2rem;
      overflow: hidden; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
    }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; text-align: left; border-collapse: collapse; }
    thead tr { background: color-mix(in srgb, var(--theme-dark) 2%, transparent); }
    th { padding: 0.875rem 1.5rem; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--theme-dark-light); white-space: nowrap; }
    td { padding: 0.875rem 1.5rem; border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); vertical-align: middle; }
    tbody tr { transition: background 0.2s; }
    tbody tr:hover { background: color-mix(in srgb, var(--theme-primary) 2%, transparent); }
    tbody tr:last-child td { border-bottom: none; }

    .order-id { font-weight: 800; color: var(--theme-dark); font-size: 0.8rem; }
    .order-date { font-size: 0.8rem; color: var(--theme-dark-light); }
    .customer-name { font-weight: 700; color: var(--theme-dark); font-size: 0.8rem; }
    .customer-email { font-size: 0.7rem; color: var(--theme-dark-light); margin-top: 0.1rem; }
    .items-count { font-size: 0.8rem; color: var(--theme-dark-light); }
    .order-total { font-weight: 800; color: var(--theme-dark); font-size: 0.8rem; }

    .status-select {
      font-size: 0.65rem; font-weight: 700; padding: 0.3rem 0.75rem; border-radius: 100px;
      border: none; cursor: pointer; outline: none; appearance: none; text-align: center;
      transition: all 0.2s;
    }
    .status-select:focus { ring: 2px solid var(--theme-primary); }
    .status-pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .status-processing { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
    .status-shipped { background: rgba(99, 102, 241, 0.1); color: #4f46e5; }
    .status-delivered { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .status-cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .view-btn {
      font-size: 0.7rem; font-weight: 700; color: var(--theme-primary); background: none; border: none;
      cursor: pointer; opacity: 0; transition: opacity 0.2s; text-decoration: none;
    }
    tbody tr:hover .view-btn { opacity: 1; }
    .view-btn:hover { text-decoration: underline; }

    .table-footer { padding: 0.875rem 1.5rem; border-top: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); font-size: 0.7rem; color: var(--theme-dark-light); }
    .table-footer strong { color: var(--theme-dark); font-weight: 700; }

    .modal-body { display: flex; flex-direction: column; gap: 1.5rem; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .info-card { background: color-mix(in srgb, var(--theme-dark) 2%, transparent); border-radius: 1.25rem; padding: 1.25rem; }
    .info-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--theme-dark-light); margin-bottom: 0.35rem; }
    .info-value { font-size: 0.875rem; font-weight: 700; color: var(--theme-dark); }
    .info-sub { font-size: 0.75rem; color: var(--theme-dark-light); margin-top: 0.15rem; }

    .section-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--theme-dark-light); margin-bottom: 0.75rem; }
    .address-box { background: color-mix(in srgb, var(--theme-dark) 2%, transparent); border-radius: 1.25rem; padding: 1.25rem; font-size: 0.8rem; color: var(--theme-dark-light); line-height: 1.6; }

    .item-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); font-size: 0.8rem; }
    .item-row:last-child { border-bottom: none; }
    .item-name { color: var(--theme-dark-light); }
    .item-price { font-weight: 700; color: var(--theme-dark); }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); margin-top: 0.5rem; }
    .total-label { font-weight: 800; color: var(--theme-dark); }
    .total-value { font-size: 1.25rem; font-weight: 800; color: var(--theme-primary); }

    /* Empty & Skeleton */
    .empty-state { padding: 4rem 2rem; text-align: center; }
    .empty-icon { width: 4rem; height: 4rem; background: color-mix(in srgb, var(--theme-dark) 4%, transparent); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--theme-dark-light); }
    .empty-text { font-weight: 600; color: var(--theme-dark-light); font-size: 0.8rem; }
    .skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-pill { height: 1.5rem; border-radius: 100px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `,
  template: `
    <!-- Header -->
    <div class="admin-header">
      <h1 class="header-title">Orders</h1>
      <p class="header-desc">View and manage all customer orders.</p>
    </div>

    <!-- Status Tabs -->
    <div class="status-tabs">
      @for (tab of statusTabs; track tab.value) {
        <button (click)="setFilter(tab.value === 'all' ? null : tab.value)"
          class="status-tab" [class.active]="tab.value === 'all' ? activeFilter() === null : activeFilter() === tab.value">
          {{ tab.label }}
          <span class="tab-count">{{ getCount(tab.value) }}</span>
        </button>
      }
    </div>

    <!-- Toolbar -->
    <div class="toolbar-card">
      <div class="search-wrap">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="order-search" type="text" placeholder="Search by order ID, customer..."
          [value]="searchQuery()" (input)="onSearch($any($event.target).value)" class="search-input" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-scroll">
        <table aria-label="Orders table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr>
                  <td><div class="skel-line" style="width:7rem;"></div></td>
                  <td><div class="skel-line" style="width:6rem;"></div></td>
                  <td><div style="display:flex;flex-direction:column;gap:0.3rem;"><div class="skel-line" style="width:8rem;"></div><div class="skel-line" style="width:10rem;height:10px;"></div></div></td>
                  <td><div class="skel-line" style="width:2rem;"></div></td>
                  <td><div class="skel-line" style="width:5rem;"></div></td>
                  <td><div class="skel-pill" style="width:5rem;"></div></td>
                  <td><div class="skel-line" style="width:4rem;margin-left:auto;"></div></td>
                </tr>
              }
            } @else if (orders().length === 0) {
              <tr><td colspan="7"><div class="empty-state"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div><p class="empty-text">No orders found.</p></div></td></tr>
            } @else {
              @for (order of orders(); track order.id) {
                <tr>
                  <td><span class="order-id">#{{ order.id.slice(-6).toUpperCase() }}</span></td>
                  <td><span class="order-date">{{ order.createdAt | date:'dd MMM yyyy' }}</span></td>
                  <td><p class="customer-name">{{ order.customerName }}</p><p class="customer-email">{{ order.customerEmail }}</p></td>
                  <td><span class="items-count">{{ order.items.length }} item(s)</span></td>
                  <td><span class="order-total">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</span></td>
                  <td>
                    <select [value]="order.status" (change)="updateStatus(order.id, $any($event.target).value)"
                      class="status-select" [class]="'status-' + order.status.toLowerCase()"
                      [attr.aria-label]="'Order status for ' + order.id">
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style="text-align:right;"><button (click)="viewOrder(order)" class="view-btn">View Details</button></td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      <div class="table-footer">Showing <strong>{{ orders().length }}</strong> orders</div>
    </div>

    <!-- Order Detail Modal -->
    @if (selectedOrder()) {
      <app-admin-modal
        [title]="'Order #' + selectedOrder()!.id.slice(-6).toUpperCase()"
        [size]="'md'"
        (close)="selectedOrder.set(null)"
      >
        <div class="info-grid">
          <div class="info-card">
            <p class="info-label">Customer</p>
            <p class="info-value">{{ selectedOrder()!.customerName }}</p>
            <p class="info-sub">{{ selectedOrder()!.customerEmail }}</p>
          </div>
          <div class="info-card">
            <p class="info-label">Date</p>
            <p class="info-value">{{ selectedOrder()!.createdAt | date:'dd MMM yyyy, h:mm a' }}</p>
          </div>
          <div class="info-card">
            <p class="info-label">Payment</p>
            <p class="info-value">{{ selectedOrder()!.paymentMethod | titlecase }}</p>
          </div>
          <div class="info-card">
            <p class="info-label">Status</p>
            <span class="status-select" [class]="'status-' + selectedOrder()!.status.toLowerCase()" style="cursor:default;display:inline-block;margin-top:0.25rem;">
              {{ selectedOrder()!.status | titlecase }}
            </span>
          </div>
        </div>

        <div>
          <p class="section-label">Shipping Address</p>
          <div class="address-box">
            {{ selectedOrder()!.shippingAddress.address }},
            {{ selectedOrder()!.shippingAddress.city }},
            {{ selectedOrder()!.shippingAddress.postalCode }}
          </div>
        </div>

        <div>
          <p class="section-label">Items</p>
          @for (item of selectedOrder()!.items; track $index) {
            <div class="item-row">
              <span class="item-name">{{ item.name }} × {{ item.quantity }}</span>
              <span class="item-price">{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
          }
          <div class="total-row">
            <span class="total-label">Total</span>
            <span class="total-value">{{ selectedOrder()!.total | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>
        </div>
      </app-admin-modal>
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
    { label: 'All', value: 'all' }, { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' }, { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' },
  ];

  ngOnInit(): void { this.store.dispatch(AdminActions.loadOrders()); }
  setFilter(status: string | null): void { this.store.dispatch(AdminActions.setOrderStatusFilter({ status })); }
  onSearch(search: string): void { this.store.dispatch(AdminActions.setOrderSearch({ search })); }
  updateStatus(orderId: string, status: string): void { this.store.dispatch(AdminActions.updateOrderStatus({ orderId, status })); }
  viewOrder(order: Order): void { this.selectedOrder.set(order); }

  getCount(key: string): number {
    const c = this.counts();
    return (c as Record<string, number>)[key] ?? 0;
  }
}