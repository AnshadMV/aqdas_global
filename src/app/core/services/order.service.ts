import { Injectable, inject } from '@angular/core';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../firebase/firebase.config';
import { from, Observable, map } from 'rxjs';

export interface Order {
  id: string;
  uid: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
  };
  items: any[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  /**
   * Fetch all orders for a specific user ID, ordered by creation date descending
   */
  getUserOrders(uid: string): Observable<Order[]> {
    const ordersRef = collection(firestore, 'orders');
    const q = query(ordersRef, where('uid', '==', uid));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const orders: Order[] = [];
        snapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        // Sort in memory since Firestore requires composite indexes for multiple fields (where + orderBy)
        return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      })
    );
  }
}
