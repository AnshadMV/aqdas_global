import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState, orderAdapter, customerAdapter } from './admin.reducer';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

// ── Orders ────────────────────────────────────────────────────────────────────
const selectOrdersState = createSelector(selectAdminState, (s) => s.orders);

const { selectAll: selectAllOrderEntities } = orderAdapter.getSelectors(selectOrdersState);

export const selectAllOrders = selectAllOrderEntities;
export const selectOrdersLoading = createSelector(selectOrdersState, (s) => s.loading);
export const selectOrdersError = createSelector(selectOrdersState, (s) => s.error);
export const selectOrderStatusFilter = createSelector(selectOrdersState, (s) => s.statusFilter);
export const selectOrderSearchQuery = createSelector(selectOrdersState, (s) => s.searchQuery);

export const selectFilteredOrders = createSelector(
  selectAllOrders,
  selectOrderStatusFilter,
  selectOrderSearchQuery,
  (orders, statusFilter, searchQuery) => {
    let result = orders;
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.customerEmail?.toLowerCase().includes(q)
      );
    }
    return result;
  }
);

export const selectOrdersCountByStatus = createSelector(selectAllOrders, (orders) => ({
  all: orders.length,
  pending: orders.filter((o) => o.status === 'pending').length,
  processing: orders.filter((o) => o.status === 'processing').length,
  shipped: orders.filter((o) => o.status === 'shipped').length,
  delivered: orders.filter((o) => o.status === 'delivered').length,
  cancelled: orders.filter((o) => o.status === 'cancelled').length,
}));

// ── Customers ─────────────────────────────────────────────────────────────────
const selectCustomersState = createSelector(selectAdminState, (s) => s.customers);

const { selectAll: selectAllCustomerEntities } = customerAdapter.getSelectors(selectCustomersState);

export const selectAllCustomers = selectAllCustomerEntities;
export const selectCustomersLoading = createSelector(selectCustomersState, (s) => s.loading);

// ── Dashboard Stats ────────────────────────────────────────────────────────────
export const selectDashboardStats = createSelector(selectAdminState, (s) => s.stats);
export const selectStatsLoading = createSelector(selectAdminState, (s) => s.statsLoading);
