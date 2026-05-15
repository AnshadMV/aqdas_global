import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders').then((m) => m.AdminOrdersComponent),
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/customers').then((m) => m.AdminCustomersComponent),
      },
    ],
  },
];
