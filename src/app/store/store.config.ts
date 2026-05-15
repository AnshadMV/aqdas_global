import { isDevMode, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { appReducers } from './app.state';
import { ProductEffects } from './product/product.effects';
import { AuthEffects } from './auth/auth.effects';
import { CartEffects } from './cart/cart.effects';
import { WishlistEffects } from './wishlist/wishlist.effects';
import { AdminEffects } from './admin/admin.effects';

export function provideAppStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore(appReducers),
    provideEffects(ProductEffects, AuthEffects, CartEffects, WishlistEffects, AdminEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      connectInZone: true,
    }),
  ]);
}
