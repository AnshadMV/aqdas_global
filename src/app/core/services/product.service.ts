import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebase.config';
import { Product } from '../../shared/models';

/**
 * ProductService encapsulates all Firestore operations for the `products` collection.
 * Returns Observables so NgRx effects can consume them directly.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly collectionName = 'products';

  /** Fetch all products, ordered by name */
  getAll(): Observable<Product[]> {
    const q = query(
      collection(firestore, this.collectionName),
      orderBy('name')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Product
        )
      )
    );
  }

  /** Fetch a single product by ID */
  getById(productId: string): Observable<Product> {
    const docRef = doc(firestore, this.collectionName, productId);
    return from(getDoc(docRef)).pipe(
      map((snapshot) => {
        if (!snapshot.exists()) {
          throw new Error(`Product ${productId} not found`);
        }
        return { id: snapshot.id, ...snapshot.data() } as Product;
      })
    );
  }

  /** Add a new product and return it with the generated ID */
  add(product: Product): Observable<Product> {
    const { id: _id, ...data } = product;
    return from(addDoc(collection(firestore, this.collectionName), data)).pipe(
      map((docRef) => ({ ...product, id: docRef.id }))
    );
  }

  /** Update an existing product */
  update(product: Product): Observable<Product> {
    const { id, ...data } = product;
    const docRef = doc(firestore, this.collectionName, id);
    return from(updateDoc(docRef, data)).pipe(map(() => product));
  }

  /** Delete a product by ID */
  delete(productId: string): Observable<void> {
    const docRef = doc(firestore, this.collectionName, productId);
    return from(deleteDoc(docRef));
  }
}
