import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  collection, doc, getDocs, setDoc, deleteDoc, query, where,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebase.config';
import type { CartItem } from '../../shared/models';

/**
 * CartService — persists cart to Firestore under users/{uid}/cart.
 * Falls back to localStorage for unauthenticated users.
 */
@Injectable({ providedIn: 'root' })
export class CartService {

  /** Load cart items for a user (or from localStorage) */
  loadCart(uid: string | null): Observable<CartItem[]> {
    if (!uid) {
      const stored = localStorage.getItem('aqdas_cart');
      return of(stored ? JSON.parse(stored) as CartItem[] : []);
    }
    const q = collection(firestore, `users/${uid}/cart`);
    return from(getDocs(q)).pipe(
      map((snap) => snap.docs.map((d) => d.data() as CartItem))
    );
  }

  /** Save entire cart (overwrite) */
  saveCart(uid: string | null, items: CartItem[]): Observable<void> {
    if (!uid) {
      localStorage.setItem('aqdas_cart', JSON.stringify(items));
      return of(undefined);
    }
    return this.clearFirestoreCart(uid).pipe(
      switchMap(() => {
        const writes = items.map((item) =>
          setDoc(doc(firestore, `users/${uid}/cart`, item.productId), item)
        );
        return from(Promise.all(writes).then(() => undefined));
      })
    );
  }

  /** Remove single item */
  removeItem(uid: string | null, productId: string): Observable<void> {
    if (!uid) {
      const stored = localStorage.getItem('aqdas_cart');
      const items: CartItem[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('aqdas_cart', JSON.stringify(items.filter((i) => i.productId !== productId)));
      return of(undefined);
    }
    return from(deleteDoc(doc(firestore, `users/${uid}/cart`, productId)));
  }

  private clearFirestoreCart(uid: string): Observable<void> {
    const q = collection(firestore, `users/${uid}/cart`);
    return from(getDocs(q)).pipe(
      switchMap((snap) => {
        const deletes = snap.docs.map((d) => deleteDoc(d.ref));
        return from(Promise.all(deletes).then(() => undefined));
      })
    );
  }
}
