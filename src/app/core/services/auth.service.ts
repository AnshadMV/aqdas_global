import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/firebase.config';
import { User } from '../../shared/models';

/**
 * AuthService wraps Firebase Authentication calls in Observables
 * for consumption by NgRx auth effects.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Sign in with email and password */
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      map((credential) => this.mapFirebaseUser(credential.user))
    );
  }

  /** Register a new user */
  register(email: string, password: string, displayName: string): Observable<User> {
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      map((credential) => {
        // Fire-and-forget profile update; the returned user still has the displayName set
        updateProfile(credential.user, { displayName });
        return this.mapFirebaseUser({ ...credential.user, displayName });
      })
    );
  }

  /** Sign out */
  logout(): Observable<void> {
    return from(signOut(auth));
  }

  /** Listen to the current auth state (emits once) */
  getAuthState(): Observable<User | null> {
    return new Observable<User | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        subscriber.next(
          firebaseUser ? this.mapFirebaseUser(firebaseUser) : null
        );
        subscriber.complete();
      });
      return () => unsubscribe();
    }).pipe(take(1));
  }

  /** Map Firebase User to our serializable User model */
  private mapFirebaseUser(fbUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }): User {
    return {
      uid: fbUser.uid,
      email: fbUser.email ?? '',
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      emailVerified: fbUser.emailVerified,
    };
  }
}
