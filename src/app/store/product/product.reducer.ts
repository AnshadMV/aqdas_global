import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Product } from '../../shared/models';
import { ProductActions } from './product.actions';

/**
 * Product state uses @ngrx/entity for normalized, performant collection management.
 * Additional properties track loading/error state and UI selections.
 */
export interface ProductState extends EntityState<Product> {
  selectedProductId: string | null;
  categoryFilter: string | null;
  loading: boolean;
  error: string | null;
}

/** Entity adapter provides CRUD helpers and default selectors */
export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId: (product) => product.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const initialProductState: ProductState = productAdapter.getInitialState({
  selectedProductId: null,
  categoryFilter: null,
  loading: false,
  error: null,
});

export const productReducer = createReducer(
  initialProductState,

  // ── Load All ──────────────────────────────────────────────
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductsSuccess, (state, { products }) =>
    productAdapter.setAll(products, { ...state, loading: false })
  ),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Load Single ──────────────────────────────────────────
  on(ProductActions.loadProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductSuccess, (state, { product }) =>
    productAdapter.upsertOne(product, { ...state, loading: false })
  ),
  on(ProductActions.loadProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Add ──────────────────────────────────────────────────
  on(ProductActions.addProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.addProductSuccess, (state, { product }) =>
    productAdapter.addOne(product, { ...state, loading: false })
  ),
  on(ProductActions.addProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Update ───────────────────────────────────────────────
  on(ProductActions.updateProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.updateProductSuccess, (state, { product }) =>
    productAdapter.updateOne(
      { id: product.id, changes: product },
      { ...state, loading: false }
    )
  ),
  on(ProductActions.updateProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Delete ───────────────────────────────────────────────
  on(ProductActions.deleteProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.deleteProductSuccess, (state, { productId }) =>
    productAdapter.removeOne(productId, { ...state, loading: false })
  ),
  on(ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── UI State ─────────────────────────────────────────────
  on(ProductActions.selectProduct, (state, { productId }) => ({
    ...state,
    selectedProductId: productId,
  })),
  on(ProductActions.setCategoryFilter, (state, { category }) => ({
    ...state,
    categoryFilter: category,
  })),
  on(ProductActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
