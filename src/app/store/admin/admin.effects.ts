import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { AdminActions } from './admin.actions';
import { AdminService } from '../../core/services/admin.service';

@Injectable()
export class AdminEffects {
  private readonly actions$ = inject(Actions);
  private readonly adminService = inject(AdminService);

  // ── Orders ─────────────────────────────────────────────────────────────────
  readonly loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadOrders),
      exhaustMap(() =>
        this.adminService.getAllOrders().pipe(
          map((orders) => AdminActions.loadOrdersSuccess({ orders })),
          catchError((e: Error) => of(AdminActions.loadOrdersFailure({ error: e.message })))
        )
      )
    )
  );

  readonly updateOrderStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateOrderStatus),
      exhaustMap(({ orderId, status }) =>
        this.adminService.updateOrderStatus(orderId, status).pipe(
          map(() => AdminActions.updateOrderStatusSuccess({ orderId, status })),
          catchError((e: Error) => of(AdminActions.updateOrderStatusFailure({ error: e.message })))
        )
      )
    )
  );

  readonly deleteOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.deleteOrder),
      exhaustMap(({ orderId }) =>
        this.adminService.deleteOrder(orderId).pipe(
          map(() => AdminActions.deleteOrderSuccess({ orderId })),
          catchError((e: Error) => of(AdminActions.deleteOrderFailure({ error: e.message })))
        )
      )
    )
  );

  // ── Customers ──────────────────────────────────────────────────────────────
  readonly loadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadCustomers),
      exhaustMap(() =>
        this.adminService.getCustomersWithStats().pipe(
          map((customers) => AdminActions.loadCustomersSuccess({ customers })),
          catchError((e: Error) => {
            console.warn('Customers load failed (check Firestore rules for users collection):', e.message);
            return of(AdminActions.loadCustomersSuccess({ customers: [] }));
          })
        )
      )
    )
  );

  // ── Dashboard Stats ────────────────────────────────────────────────────────
  readonly loadDashboardStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadDashboardStats),
      exhaustMap(() =>
        this.adminService.getAdminStats().pipe(
          map((stats) => AdminActions.loadDashboardStatsSuccess({ stats })),
          catchError((e: Error) => of(AdminActions.loadDashboardStatsFailure({ error: e.message })))
        )
      )
    )
  );
}
