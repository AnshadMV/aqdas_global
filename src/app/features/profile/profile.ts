import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { AuthActions } from '../../store/auth/auth.actions';
import { RouterLink } from '@angular/router';
import { UpperCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { effect, signal } from '@angular/core';
import { OrderService, Order } from '../../core/services/order.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UpperCasePipe, CurrencyPipe, DatePipe, SpinnerComponent],
  host: { 'class': 'block' },
  template: `
    <section class="min-h-screen bg-secondary py-16">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-dark mb-8">My Account</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Sidebar -->
          <div class="col-span-1">
            <div class="glass rounded-3xl p-6 shadow-md border border-white/40 sticky top-24">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  @if (user()?.photoURL) {
                    <img [src]="user()?.photoURL" alt="Profile" class="w-full h-full object-cover" />
                  } @else {
                    <span class="font-heading text-xl font-bold text-primary">{{ user()?.displayName?.charAt(0) || user()?.email?.charAt(0) || 'U' | uppercase }}</span>
                  }
                </div>
                <div>
                  <p class="font-body font-semibold text-dark">{{ user()?.displayName || 'User' }}</p>
                  <p class="font-body text-xs text-dark/50 truncate max-w-[150px]">{{ user()?.email }}</p>
                </div>
              </div>

              <nav class="space-y-2">
                <a routerLink="/profile" class="flex items-center gap-3 px-4 py-3 bg-white/60 text-primary font-body text-sm font-semibold rounded-xl transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </a>
                <a routerLink="/wishlist" class="flex items-center gap-3 px-4 py-3 hover:bg-white/40 text-dark/70 hover:text-dark font-body text-sm font-medium rounded-xl transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  Wishlist
                </a>
                <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 font-body text-sm font-medium rounded-xl transition-all mt-4 text-left active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          <!-- Main Content -->
          <div class="col-span-1 md:col-span-2 space-y-8">
            <!-- Profile Info -->
            <div class="glass rounded-3xl p-8 shadow-md border border-white/40">
              <h2 class="font-heading text-2xl font-bold text-dark mb-6">Personal Information</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p class="font-body text-xs font-semibold text-dark/40 uppercase tracking-wider mb-1">Display Name</p>
                  <p class="font-body text-dark font-medium">{{ user()?.displayName || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="font-body text-xs font-semibold text-dark/40 uppercase tracking-wider mb-1">Email Address</p>
                  <p class="font-body text-dark font-medium">{{ user()?.email }}</p>
                </div>
                <div>
                  <p class="font-body text-xs font-semibold text-dark/40 uppercase tracking-wider mb-1">Account Status</p>
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" [class.bg-green-500]="user()?.emailVerified" [class.bg-yellow-500]="!user()?.emailVerified"></span>
                    <p class="font-body text-dark font-medium">{{ user()?.emailVerified ? 'Verified' : 'Unverified' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order History -->
            <div class="glass rounded-3xl p-8 shadow-md border border-white/40">
              <h2 class="font-heading text-2xl font-bold text-dark mb-6">Recent Orders</h2>
              
              @if (loadingOrders()) {
                <div class="flex justify-center py-10">
                  <app-spinner size="sm" />
                </div>
              } @else if (orders().length === 0) {
                <div class="text-center py-10 bg-white/30 rounded-2xl border border-dashed border-dark/10">
                  <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-dark/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <h3 class="font-heading text-lg font-bold text-dark mb-2">No orders yet</h3>
                  <p class="font-body text-sm text-dark/50 mb-6">When you place an order, it will appear here.</p>
                  <a routerLink="/shop" class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-body font-semibold px-6 py-2.5 rounded-full transition-all duration-300">
                    Start Shopping
                  </a>
                </div>
              } @else {
                <div class="space-y-6">
                  @for (order of orders(); track order.id) {
                    <div class="bg-white/50 rounded-2xl p-6 border border-dark/5">
                      <div class="flex flex-wrap gap-4 items-center justify-between border-b border-dark/5 pb-4 mb-4">
                        <div>
                          <p class="font-heading font-bold text-dark text-lg">Order #{{ order.id }}</p>
                          <p class="font-body text-xs text-dark/50">{{ order.createdAt | date:'medium' }}</p>
                        </div>
                        <div class="text-right">
                          <span class="inline-block bg-primary/10 text-primary text-xs font-body font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1">{{ order.status }}</span>
                          <p class="font-heading font-bold text-dark">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</p>
                        </div>
                      </div>
                      
                      <div class="space-y-3">
                        @for (item of order.items; track item.productId) {
                          <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                              <img [src]="item.imageUrl" [alt]="item.name" class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1">
                              <p class="font-body font-semibold text-dark text-sm line-clamp-1">{{ item.name }}</p>
                              <p class="font-body text-xs text-dark/50">Qty: {{ item.quantity }}</p>
                            </div>
                            <p class="font-body text-sm font-semibold text-dark">{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</p>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ProfileComponent {
  private readonly store = inject(Store);
  private readonly orderService = inject(OrderService);
  
  readonly user = this.store.selectSignal(selectCurrentUser);
  
  readonly orders = signal<Order[]>([]);
  readonly loadingOrders = signal(true);

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.loadingOrders.set(true);
        this.orderService.getUserOrders(u.uid).subscribe({
          next: (res) => {
            this.orders.set(res);
            this.loadingOrders.set(false);
          },
          error: () => {
            this.loadingOrders.set(false);
          }
        });
      } else {
        this.orders.set([]);
        this.loadingOrders.set(false);
      }
    });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
