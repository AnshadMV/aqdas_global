import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import type { Order } from '../../core/services/order.service';
import type { AdminStats, AdminCustomer } from '../../core/services/admin.service';
import { AdminActions } from './admin.actions';

// ── Order Entity ────────────────────────────────────────────────────────────
export interface AdminOrderState extends EntityState<Order> {
  statusFilter: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

export const orderAdapter: EntityAdapter<Order> = createEntityAdapter<Order>({
  selectId: (order) => order.id,
  sortComparer: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

// ── Customer Entity ─────────────────────────────────────────────────────────
export interface AdminCustomerState extends EntityState<AdminCustomer> {
  loading: boolean;
  error: string | null;
}

export const customerAdapter: EntityAdapter<AdminCustomer> = createEntityAdapter<AdminCustomer>({
  selectId: (customer) => customer.uid,
});

// ── Combined Admin State ─────────────────────────────────────────────────────
export interface AdminState {
  orders: AdminOrderState;
  customers: AdminCustomerState;
  stats: AdminStats | null;
  statsLoading: boolean;
  statsError: string | null;
  error: string | null;
}

const initialOrderState: AdminOrderState = orderAdapter.getInitialState({
  statusFilter: null,
  searchQuery: '',
  loading: false,
  error: null,
});

const initialCustomerState: AdminCustomerState = customerAdapter.getInitialState({
  loading: false,
  error: null,
});

export const initialAdminState: AdminState = {
  orders: initialOrderState,
  customers: initialCustomerState,
  stats: null,
  statsLoading: false,
  statsError: null,
  error: null,
};

export const adminReducer = createReducer(
  initialAdminState,

  // ── Orders ──────────────────────────────────────────────────────────────
  on(AdminActions.loadOrders, (state) => ({
    ...state,
    orders: { ...state.orders, loading: true, error: null },
  })),
  on(AdminActions.loadOrdersSuccess, (state, { orders }) => ({
    ...state,
    orders: orderAdapter.setAll(orders, { ...state.orders, loading: false }),
  })),
  on(AdminActions.loadOrdersFailure, (state, { error }) => ({
    ...state,
    orders: { ...state.orders, loading: false, error },
  })),

  on(AdminActions.updateOrderStatus, (state) => ({
    ...state,
    orders: { ...state.orders, loading: true, error: null },
  })),
  on(AdminActions.updateOrderStatusSuccess, (state, { orderId, status }) => ({
    ...state,
    orders: orderAdapter.updateOne(
      { id: orderId, changes: { status } },
      { ...state.orders, loading: false }
    ),
  })),
  on(AdminActions.updateOrderStatusFailure, (state, { error }) => ({
    ...state,
    orders: { ...state.orders, loading: false, error },
  })),

  on(AdminActions.deleteOrder, (state) => ({
    ...state,
    orders: { ...state.orders, loading: true, error: null },
  })),
  on(AdminActions.deleteOrderSuccess, (state, { orderId }) => ({
    ...state,
    orders: orderAdapter.removeOne(orderId, { ...state.orders, loading: false }),
  })),
  on(AdminActions.deleteOrderFailure, (state, { error }) => ({
    ...state,
    orders: { ...state.orders, loading: false, error },
  })),

  on(AdminActions.setOrderStatusFilter, (state, { status }) => ({
    ...state,
    orders: { ...state.orders, statusFilter: status },
  })),
  on(AdminActions.setOrderSearch, (state, { search }) => ({
    ...state,
    orders: { ...state.orders, searchQuery: search },
  })),

  // ── Customers ────────────────────────────────────────────────────────────
  on(AdminActions.loadCustomers, (state) => ({
    ...state,
    customers: { ...state.customers, loading: true, error: null },
  })),
  on(AdminActions.loadCustomersSuccess, (state, { customers }) => ({
    ...state,
    customers: customerAdapter.setAll(customers, { ...state.customers, loading: false }),
  })),
  on(AdminActions.loadCustomersFailure, (state, { error }) => ({
    ...state,
    customers: { ...state.customers, loading: false, error },
  })),

  // ── Dashboard Stats ──────────────────────────────────────────────────────
  on(AdminActions.loadDashboardStats, (state) => ({
    ...state,
    statsLoading: true,
    statsError: null,
  })),
  on(AdminActions.loadDashboardStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    statsLoading: false,
  })),
  on(AdminActions.loadDashboardStatsFailure, (state, { error }) => ({
    ...state,
    statsLoading: false,
    statsError: error,
  })),

  // ── Clear Error ──────────────────────────────────────────────────────────
  on(AdminActions.clearError, (state) => ({ ...state, error: null }))
);
