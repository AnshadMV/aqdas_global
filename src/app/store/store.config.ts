import { isDevMode, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { appReducers } from './app.state';
import { ProductEffects } from './product/product.effects';
import { AuthEffects } from './auth/auth.effects';

/**
 * Provides all NgRx store configuration as a single provider function.
 * Call this in app.config.ts to wire up the entire store.
 */
export function provideAppStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore(appReducers),
    provideEffects(ProductEffects, AuthEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      connectInZone: true,
    }),
  ]);
}
