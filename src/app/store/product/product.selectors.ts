import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState, productAdapter } from './product.reducer';

/**
 * Product selectors.
 * Feature selector + entity adapter selectors + custom derived selectors.
 */

// Feature selector
export const selectProductState = createFeatureSelector<ProductState>('product');

// Entity adapter auto-generated selectors
const { selectIds, selectEntities, selectAll, selectTotal } =
  productAdapter.getSelectors(selectProductState);

export const selectProductIds = selectIds;
export const selectProductEntities = selectEntities;
export const selectAllProducts = selectAll;
export const selectProductTotal = selectTotal;

// Custom selectors
export const selectProductLoading = createSelector(
  selectProductState,
  (state) => state.loading
);

export const selectProductError = createSelector(
  selectProductState,
  (state) => state.error
);

export const selectSelectedProductId = createSelector(
  selectProductState,
  (state) => state.selectedProductId
);

export const selectSelectedProduct = createSelector(
  selectProductEntities,
  selectSelectedProductId,
  (entities, selectedId) => (selectedId ? entities[selectedId] ?? null : null)
);

export const selectCategoryFilter = createSelector(
  selectProductState,
  (state) => state.categoryFilter
);

export const selectFilteredProducts = createSelector(
  selectAllProducts,
  selectCategoryFilter,
  (products, category) =>
    category ? products.filter((p) => p.category === category) : products
);

export const selectActiveProducts = createSelector(
  selectAllProducts,
  (products) => products.filter((p) => p.isActive)
);

export const selectProductCategories = createSelector(
  selectAllProducts,
  (products) => [...new Set(products.map((p) => p.category))]
);
