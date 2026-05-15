import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase.config';
import type { WishlistItem } from '../../shared/models';

/**
 * WishlistService — persists to Firestore under users/{uid}/wishlist.
 * Falls back to localStorage for guests.
 */
@Injectable({ providedIn: 'root' })
export class WishlistService {

  loadWishlist(uid: string | null): Observable<WishlistItem[]> {
    if (!uid) {
      const stored = localStorage.getItem('aqdas_wishlist');
      return of(stored ? JSON.parse(stored) as WishlistItem[] : []);
    }
    return from(getDocs(collection(firestore, `users/${uid}/wishlist`))).pipe(
      map((snap) => snap.docs.map((d) => d.data() as WishlistItem))
    );
  }

  addItem(uid: string | null, item: WishlistItem): Observable<void> {
    if (!uid) {
      const stored = localStorage.getItem('aqdas_wishlist');
      const items: WishlistItem[] = stored ? JSON.parse(stored) : [];
      if (!items.find((i) => i.productId === item.productId)) {
        items.push(item);
        localStorage.setItem('aqdas_wishlist', JSON.stringify(items));
      }
      return of(undefined);
    }
    return from(setDoc(doc(firestore, `users/${uid}/wishlist`, item.productId), item));
  }

  removeItem(uid: string | null, productId: string): Observable<void> {
    if (!uid) {
      const stored = localStorage.getItem('aqdas_wishlist');
      const items: WishlistItem[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('aqdas_wishlist', JSON.stringify(items.filter((i) => i.productId !== productId)));
      return of(undefined);
    }
    return from(deleteDoc(doc(firestore, `users/${uid}/wishlist`, productId)));
  }
}
