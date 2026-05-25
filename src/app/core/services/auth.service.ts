import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebase.config';
import { User } from '../../shared/models';
import { switchMap } from 'rxjs/operators';

/**
 * AuthService wraps Firebase Authentication calls in Observables
 * for consumption by NgRx auth effects.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Sign in with email and password */
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      switchMap((credential) => this.getUserProfile(credential.user.uid).pipe(
        map((profile) => this.mapFirebaseUser(credential.user, profile?.role, profile))
      ))
    );
  }

  /** Register a new user */
  register(email: string, password: string, displayName: string): Observable<User> {
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      switchMap((credential) => {
        return from(updateProfile(credential.user, { displayName })).pipe(
          switchMap(() => this.createUserProfile(credential.user.uid, { email, displayName, role: 'user' })),
          map(() => this.mapFirebaseUser({ ...credential.user, displayName }, 'user'))
        );
      })
    );
  }

  /** Sign out */
  logout(): Observable<void> {
    return from(signOut(auth));
  }

  /** Google Sign-in */
  googleLogin(): Observable<User> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(auth, provider)).pipe(
      switchMap((credential) => this.getUserProfile(credential.user.uid).pipe(
        switchMap((profile) => {
          if (profile) {
            return of(this.mapFirebaseUser(credential.user, profile.role, profile));
          } else {
            // Create profile for new Google user
            const email = credential.user.email ?? '';
            const displayName = credential.user.displayName ?? 'Google User';
            return from(this.createUserProfile(credential.user.uid, { email, displayName, role: 'user' })).pipe(
              map(() => this.mapFirebaseUser(credential.user, 'user'))
            );
          }
        })
      ))
    );
  }

  /** Forgot Password (send reset email) */
  forgotPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(auth, email));
  }

  /** Listen to the current auth state (emits once) */
  getAuthState(): Observable<User | null> {
    return new Observable<User | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          this.getUserProfile(firebaseUser.uid).subscribe({
            next: (profile) => {
              subscriber.next(this.mapFirebaseUser(firebaseUser, profile?.role, profile));
              subscriber.complete();
            },
            error: () => {
              subscriber.next(this.mapFirebaseUser(firebaseUser));
              subscriber.complete();
            }
          });
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
      return () => unsubscribe();
    }).pipe(take(1));
  }

  /** Fetch user profile from Firestore */
  getUserProfile(uid: string): Observable<any> {
    return from(getDoc(doc(firestore, 'users', uid))).pipe(
      map((snap) => snap.exists() ? snap.data() : null)
    );
  }

  /** Update user profile in Firestore and Firebase Auth */
  updateUserProfile(uid: string, data: { displayName?: string; photoURL?: string; phoneNumber?: string; shippingAddress?: any; userType?: 'normal' | 'wholesale' }): Observable<void> {
    const userRef = doc(firestore, 'users', uid);
    const promises: Promise<any>[] = [];
    
    // Update Firebase Auth details if provided
    if (auth.currentUser && (data.displayName !== undefined || data.photoURL !== undefined)) {
      promises.push(updateProfile(auth.currentUser, {
        displayName: data.displayName ?? auth.currentUser.displayName,
        photoURL: data.photoURL ?? auth.currentUser.photoURL
      }));
    }
    
    // Update Firestore user document
    promises.push(setDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true }));
    
    return from(Promise.all(promises)).pipe(
      map(() => void 0)
    );
  }

  /** Create user profile in Firestore */
  private async createUserProfile(uid: string, data: any): Promise<void> {
    await setDoc(doc(firestore, 'users', uid), {
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  /** Map Firebase User to our serializable User model */
  private mapFirebaseUser(fbUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }, role?: 'admin' | 'user', profileData?: any): User {
    return {
      uid: fbUser.uid,
      email: fbUser.email ?? '',
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      emailVerified: fbUser.emailVerified,
      role: role,
      userType: profileData?.userType ?? 'normal',
      phoneNumber: profileData?.phoneNumber,
      shippingAddress: profileData?.shippingAddress
    };
  }
}
