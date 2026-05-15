import { Injectable } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebase.config';
import type { Product, Category } from '../../shared/models';
import type { Order } from './order.service';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  pendingOrdersCount: number;
}

export interface AdminCustomer {
  uid: string;
  email?: string;
  displayName: string | null;
  photoURL?: string | null;
  createdAt?: string;
  ordersCount?: number;
  totalSpent?: number;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  // ── Orders ────────────────────────────────────────────────────────────────

  /** Fetch all orders (admin), ordered by creation date descending */
  getAllOrders(): Observable<Order[]> {
    return from(getDocs(collection(firestore, 'orders'))).pipe(
      map((snap) => {
        const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
        return orders.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
    );
  }

  /** Update an order's status */
  updateOrderStatus(orderId: string, status: string): Observable<void> {
    return from(
      updateDoc(doc(firestore, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString(),
      })
    );
  }

  /** Delete an order */
  deleteOrder(orderId: string): Observable<void> {
    return from(deleteDoc(doc(firestore, 'orders', orderId)));
  }

  // ── Products ──────────────────────────────────────────────────────────────

  /** Fetch ALL products (including inactive) for admin */
  getAllProductsAdmin(): Observable<Product[]> {
    return from(getDocs(collection(firestore, 'products'))).pipe(
      map((snap) =>
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Product)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
    );
  }

  /** Add product to Firestore */
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const data = { ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return from(addDoc(collection(firestore, 'products'), data)).pipe(
      map((ref) => ({ ...data, id: ref.id }) as Product)
    );
  }

  /** Update product in Firestore */
  updateProduct(product: Product): Observable<Product> {
    const { id, ...data } = product;
    const updated = { ...data, updatedAt: new Date().toISOString() };
    return from(updateDoc(doc(firestore, 'products', id), updated)).pipe(
      map(() => ({ ...product, ...updated }))
    );
  }

  /** Delete product from Firestore */
  deleteProduct(productId: string): Observable<void> {
    return from(deleteDoc(doc(firestore, 'products', productId)));
  }

  // ── Categories ────────────────────────────────────────────────────────────

  getAllCategories(): Observable<Category[]> {
    return from(getDocs(collection(firestore, 'categories'))).pipe(
      map((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category))
    );
  }

  updateCategory(category: Category): Observable<Category> {
    const { id, ...data } = category;
    return from(updateDoc(doc(firestore, 'categories', id), data)).pipe(map(() => category));
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  /** Fetch all users from 'users' collection */
  getAllCustomers(): Observable<AdminCustomer[]> {
    return from(getDocs(collection(firestore, 'users'))).pipe(
      map((snap) =>
        snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as AdminCustomer)
      )
    );
  }

  /** Fetch customers with order aggregation */
  getCustomersWithStats(): Observable<AdminCustomer[]> {
    return forkJoin({
      users: from(getDocs(collection(firestore, 'users'))),
      orders: from(getDocs(collection(firestore, 'orders'))),
    }).pipe(
      map(({ users, orders }) => {
        const allOrders = orders.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);

        return users.docs.map((d) => {
          const user = { uid: d.id, ...d.data() } as AdminCustomer;
          const userOrders = allOrders.filter((o) => o.uid === user.uid);
          return {
            ...user,
            ordersCount: userOrders.length,
            totalSpent: userOrders.reduce((sum, o) => sum + (o.total ?? 0), 0),
          };
        });
      })
    );
  }

  // ── Dashboard Stats ───────────────────────────────────────────────────────

  /** Aggregate stats for the admin dashboard */
  getAdminStats(): Observable<AdminStats> {
    return forkJoin({
      products: from(getDocs(collection(firestore, 'products'))),
      orders: from(getDocs(collection(firestore, 'orders'))),
      users: from(getDocs(collection(firestore, 'users'))),
    }).pipe(
      map(({ products, orders, users }) => {
        const allOrders = orders.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
        const allProducts = products.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);

        const totalRevenue = allOrders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total ?? 0), 0);

        const activeProducts = allProducts.filter((p) => p.isActive).length;
        const pendingOrdersCount = allOrders.filter((o) => o.status === 'pending').length;

        const recentOrders = [...allOrders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);

        return {
          totalRevenue,
          totalOrders: allOrders.length,
          activeProducts,
          totalCustomers: users.size,
          recentOrders,
          pendingOrdersCount,
        };
      })
    );
  }
}
