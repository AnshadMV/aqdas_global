import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal, computed,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AdminActions } from '../../../store/admin/admin.actions';
import { selectAllCustomers, selectCustomersLoading } from '../../../store/admin/admin.selectors';

@Component({
  selector: 'app-admin-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-dark">Customers</h1>
        <p class="font-body text-dark/50 mt-1">View all registered customers and their order history.</p>
      </div>
      <div class="font-body text-sm text-dark/50 bg-white border border-dark/10 rounded-xl px-4 py-2.5">
        <span class="font-bold text-dark">{{ customers().length }}</span> total customers
      </div>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="relative w-full max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="customer-search" type="text" placeholder="Search customers..."
          [value]="search()"
          (input)="search.set($any($event.target).value)"
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark/10 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" />
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-dark/5 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse" aria-label="Customers table">
          <thead>
            <tr class="bg-secondary/50 font-body text-xs text-dark/50 uppercase tracking-wider">
              <th scope="col" class="p-4 font-semibold">Customer</th>
              <th scope="col" class="p-4 font-semibold">Role</th>
              <th scope="col" class="p-4 font-semibold">Orders</th>
              <th scope="col" class="p-4 font-semibold">Total Spent</th>
              <th scope="col" class="p-4 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark/5">
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr class="animate-pulse">
                  <td class="p-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-secondary"></div><div><div class="h-4 bg-secondary rounded w-32 mb-1"></div><div class="h-3 bg-secondary rounded w-48"></div></div></div></td>
                  <td class="p-4"><div class="h-5 bg-secondary rounded-full w-16"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-8"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-20"></div></td>
                  <td class="p-4"><div class="h-4 bg-secondary rounded w-24"></div></td>
                </tr>
              }
            } @else if (filtered().length === 0) {
              <tr>
                <td colspan="5" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-3 text-dark/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <p class="font-body font-medium text-sm">No customers found.</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (c of filtered(); track c.uid) {
                <tr class="hover:bg-secondary/20 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      @if (c.photoURL) {
                        <img [src]="c.photoURL" [alt]="c.displayName ?? 'Customer'" width="40" height="40"
                          class="w-10 h-10 rounded-full object-cover border border-dark/5" />
                      } @else {
                        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-sm">
                          {{ (c.displayName ?? c.email ?? '?').charAt(0).toUpperCase() }}
                        </div>
                      }
                      <div>
                        <p class="font-body font-semibold text-dark text-sm">{{ c.displayName ?? 'No Name' }}</p>
                        <p class="font-body text-xs text-dark/50">{{ c.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      [class]="c.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-dark/60'">
                      {{ c.role ?? 'Customer' }}
                    </span>
                  </td>
                  <td class="p-4 font-body text-sm font-semibold text-dark">{{ c.ordersCount ?? 0 }}</td>
                  <td class="p-4 font-body text-sm font-bold text-dark">{{ (c.totalSpent ?? 0) | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td class="p-4 font-body text-sm text-dark/50">{{ c.createdAt | date:'dd MMM yyyy' }}</td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      <div class="p-4 border-t border-dark/5">
        <p class="font-body text-xs text-dark/50">
          Showing <span class="font-semibold text-dark">{{ filtered().length }}</span> customers
        </p>
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
      (c) =>
        c.email?.toLowerCase().includes(q) ||
        c.displayName?.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadCustomers());
  }
}
