/**
 * Root Store Module
 * Central barrel export for all NgRx store features.
 *
 * Architecture:
 * - Each feature has its own folder under /store/ with actions, reducer, selectors, effects
 * - This file re-exports everything for easy imports
 * - provideAppStore() is used in app.config.ts
 */

export { provideAppStore } from './store.config';
