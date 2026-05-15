import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, limit,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebase.config';
import type { Product, Category, Testimonial, SiteConfig } from '../../shared/models';

/**
 * ProductService — reads product/category/testimonial/config data from Firestore.
 * All methods return Observables wrapping Firestore promises.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {

  /** Fetch all active products */
  getAll(): Observable<Product[]> {
    return from(getDocs(collection(firestore, 'products'))).pipe(
      map((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product).filter((p) => p.isActive).sort((a, b) => a.name.localeCompare(b.name)))
    );
  }

  /** Fetch featured products */
  getFeatured(): Observable<Product[]> {
    return from(getDocs(collection(firestore, 'products'))).pipe(
      map((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product).filter((p) => p.isFeatured && p.isActive))
    );
  }

  /** Fetch by category */
  getByCategory(category: string): Observable<Product[]> {
    return from(getDocs(collection(firestore, 'products'))).pipe(
      map((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product).filter((p) => p.category === category && p.isActive))
    );
  }

  /** Fetch a single product by ID */
  getById(productId: string): Observable<Product> {
    return from(getDoc(doc(firestore, 'products', productId))).pipe(
      map((snap) => {
        if (!snap.exists()) throw new Error(`Product ${productId} not found`);
        return { id: snap.id, ...snap.data() } as Product;
      })
    );
  }

  /** Add a new product */
  add(product: Omit<Product, 'id'>): Observable<Product> {
    return from(addDoc(collection(firestore, 'products'), product)).pipe(
      map((ref) => ({ ...product, id: ref.id }) as Product)
    );
  }

  /** Update product */
  update(product: Product): Observable<Product> {
    const { id, ...data } = product;
    return from(updateDoc(doc(firestore, 'products', id), data)).pipe(map(() => product));
  }

  /** Delete product */
  delete(productId: string): Observable<void> {
    return from(deleteDoc(doc(firestore, 'products', productId)));
  }

  /** Fetch all categories */
  getCategories(): Observable<Category[]> {
    return from(getDocs(collection(firestore, 'categories'))).pipe(
      map((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category).filter((c) => c.isActive))
    );
  }

  /** Fetch testimonials */
  getTestimonials(): Observable<Testimonial[]> {
    return from(getDocs(collection(firestore, 'testimonials'))).pipe(
      map((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Testimonial))
    );
  }

  /** Fetch site config */
  getSiteConfig(): Observable<SiteConfig> {
    return from(getDoc(doc(firestore, 'config', 'site'))).pipe(
      map((snap) => snap.data() as SiteConfig)
    );
  }
}
