import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Order } from '../../core/services/order.service';
import type { AdminStats, AdminCustomer } from '../../core/services/admin.service';

export const AdminActions = createActionGroup({
  source: 'Admin',
  events: {
    // ── Orders ──────────────────────────────────────────────────────────────
    'Load Orders': emptyProps(),
    'Load Orders Success': props<{ orders: Order[] }>(),
    'Load Orders Failure': props<{ error: string }>(),

    'Update Order Status': props<{ orderId: string; status: string }>(),
    'Update Order Status Success': props<{ orderId: string; status: string }>(),
    'Update Order Status Failure': props<{ error: string }>(),

    'Delete Order': props<{ orderId: string }>(),
    'Delete Order Success': props<{ orderId: string }>(),
    'Delete Order Failure': props<{ error: string }>(),

    'Set Order Status Filter': props<{ status: string | null }>(),
    'Set Order Search': props<{ search: string }>(),

    // ── Customers ────────────────────────────────────────────────────────────
    'Load Customers': emptyProps(),
    'Load Customers Success': props<{ customers: AdminCustomer[] }>(),
    'Load Customers Failure': props<{ error: string }>(),

    // ── Dashboard Stats ──────────────────────────────────────────────────────
    'Load Dashboard Stats': emptyProps(),
    'Load Dashboard Stats Success': props<{ stats: AdminStats }>(),
    'Load Dashboard Stats Failure': props<{ error: string }>(),

    // ── UI ───────────────────────────────────────────────────────────────────
    'Clear Error': emptyProps(),
  },
});
