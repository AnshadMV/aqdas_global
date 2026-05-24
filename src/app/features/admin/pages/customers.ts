import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AdminActions } from '../../../store/admin/admin.actions';
import { selectAllCustomers, selectCustomersLoading } from '../../../store/admin/admin.selectors';

@Component({
  selector: 'app-admin-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  styles: `
    /* ─── Header ─── */
    .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-title { font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; }
    .header-desc { color: var(--theme-dark-light); font-size: 0.95rem; margin-top: 0.25rem; }
    .total-badge {
      font-size: 0.8rem; font-weight: 700; color: var(--theme-dark-light);
      background: color-mix(in srgb, var(--theme-cream) 80%, transparent); backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); border-radius: 100px;
      padding: 0.6rem 1.25rem; white-space: nowrap;
    }
    .total-badge strong { color: var(--theme-dark); font-weight: 800; }

    /* ─── Search ─── */
    .search-wrap { position: relative; width: 100%; max-width: 24rem; margin-bottom: 1.5rem; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--theme-dark-light); pointer-events: none; }
    .search-input {
      width: 100%; padding: 0.85rem 1rem 0.85rem 2.75rem;
      background: color-mix(in srgb, var(--theme-cream) 80%, transparent); backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-radius: 1rem;
      font-size: 0.875rem; color: var(--theme-dark); outline: none; transition: all 0.3s;
    }
    .search-input:focus { border-color: var(--theme-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 8%, transparent); background: var(--theme-cream); }
    .search-input::placeholder { color: var(--theme-dark-light); }

    /* ─── Table Card ─── */
    .table-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); border-radius: 2rem;
      overflow: hidden; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
    }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; text-align: left; border-collapse: collapse; }
    thead tr { background: color-mix(in srgb, var(--theme-dark) 2%, transparent); }
    th { padding: 1rem 1.5rem; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--theme-dark-light); white-space: nowrap; }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); vertical-align: middle; }
    tbody tr { transition: background 0.2s; }
    tbody tr:hover { background: color-mix(in srgb, var(--theme-primary) 2%, transparent); }
    tbody tr:last-child td { border-bottom: none; }

    /* ─── Customer Cell ─── */
    .customer-cell { display: flex; align-items: center; gap: 0.875rem; }
    .avatar-img { width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .avatar-fallback {
      width: 2.5rem; height: 2.5rem; border-radius: 50%;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.875rem; flex-shrink: 0;
    }
    .customer-name { font-weight: 700; color: var(--theme-dark); font-size: 0.875rem; }
    .customer-email { font-size: 0.75rem; color: var(--theme-dark-light); margin-top: 0.1rem; }

    /* ─── Role Badge ─── */
    .role-badge {
      display: inline-flex; align-items: center; padding: 0.25rem 0.75rem;
      border-radius: 100px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.03em;
    }
    .role-admin { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .role-customer { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); color: var(--theme-dark-light); }

    .cell-value { font-size: 0.875rem; font-weight: 600; color: var(--theme-dark); }
    .cell-muted { font-size: 0.875rem; color: var(--theme-dark-light); }
    .cell-bold { font-weight: 800; color: var(--theme-dark); }

    /* ─── Footer ─── */
    .table-footer { padding: 1rem 1.5rem; border-top: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); font-size: 0.75rem; color: var(--theme-dark-light); }
    .table-footer strong { color: var(--theme-dark); font-weight: 700; }

    /* ─── Empty State ─── */
    .empty-state { padding: 4rem 2rem; text-align: center; }
    .empty-icon { width: 4rem; height: 4rem; background: color-mix(in srgb, var(--theme-dark) 4%, transparent); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--theme-dark-light); }
    .empty-text { font-weight: 600; color: var(--theme-dark-light); font-size: 0.9rem; }

    /* ─── Skeleton ─── */
    .skel-row td { padding: 1rem 1.5rem; }
    .skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-circle { width: 2.5rem; height: 2.5rem; border-radius: 50%; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; flex-shrink: 0; }
    .skel-pill { height: 1.5rem; border-radius: 100px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `,
  template: `
    <!-- Header -->
    <div class="admin-header">
      <div>
        <h1 class="header-title">Customers</h1>
        <p class="header-desc">View all registered customers and their order history.</p>
      </div>
      <div class="total-badge">
        <strong>{{ customers().length }}</strong>&nbsp; total customers
      </div>
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="customer-search" type="text" placeholder="Search by name or email..."
        [value]="search()"
        (input)="search.set($any($event.target).value)"
        class="search-input" />
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-scroll">
        <table aria-label="Customers table">
          <thead>
            <tr>
              <th scope="col">Customer</th>
              <th scope="col">Role</th>
              <th scope="col">Orders</th>
              <th scope="col">Total Spent</th>
              <th scope="col">Joined</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr class="skel-row">
                  <td><div style="display:flex;align-items:center;gap:0.875rem;"><div class="skel-circle"></div><div style="display:flex;flex-direction:column;gap:0.35rem;"><div class="skel-line" style="width:8rem;"></div><div class="skel-line" style="width:12rem;height:10px;"></div></div></div></td>
                  <td><div class="skel-pill" style="width:4rem;"></div></td>
                  <td><div class="skel-line" style="width:2rem;"></div></td>
                  <td><div class="skel-line" style="width:5rem;"></div></td>
                  <td><div class="skel-line" style="width:6rem;"></div></td>
                </tr>
              }
            } @else if (filtered().length === 0) {
              <tr>
                <td colspan="5">
                  <div class="empty-state">
                    <div class="empty-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <p class="empty-text">No customers found.</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (c of filtered(); track c.uid) {
                <tr>
                  <td>
                    <div class="customer-cell">
                      @if (c.photoURL) {
                        <img [src]="c.photoURL" [alt]="c.displayName ?? 'Customer'" class="avatar-img" />
                      } @else {
                        <div class="avatar-fallback">{{ (c.displayName ?? c.email ?? '?').charAt(0).toUpperCase() }}</div>
                      }
                      <div>
                        <p class="customer-name">{{ c.displayName ?? 'No Name' }}</p>
                        <p class="customer-email">{{ c.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge" [class.role-admin]="c.role === 'admin'" [class.role-customer]="c.role !== 'admin'">
                      {{ c.role ?? 'Customer' }}
                    </span>
                  </td>
                  <td><span class="cell-value">{{ c.ordersCount ?? 0 }}</span></td>
                  <td><span class="cell-bold">{{ (c.totalSpent ?? 0) | currency:'INR':'symbol':'1.0-0' }}</span></td>
                  <td><span class="cell-muted">{{ c.createdAt | date:'dd MMM yyyy' }}</span></td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        Showing <strong>{{ filtered().length }}</strong> customers
      </div>
    </div>
  `,
})
export class AdminCustomersComponent implements OnInit {
  private readonly store = inject(Store);
  readonly customers = this.store.selectSignal(selectAllCustomers);
  readonly loading = this.store.selectSignal(selectCustomersLoading);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.customers();
    return this.customers().filter(
      (c) => c.email?.toLowerCase().includes(q) || c.displayName?.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadCustomers());
  }
}