import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product } from '../../shared/models';

/**
 * Product actions grouped using createActionGroup for clean, scalable action definitions.
 * Each action source is prefixed with [Product] for DevTools readability.
 */

export const ProductActions = createActionGroup({
  source: 'Product',
  events: {
    /** Triggers loading all products from Firestore */
    'Load Products': emptyProps(),
    'Load Products Success': props<{ products: Product[] }>(),
    'Load Products Failure': props<{ error: string }>(),

    /** Triggers loading a single product by ID */
    'Load Product': props<{ productId: string }>(),
    'Load Product Success': props<{ product: Product }>(),
    'Load Product Failure': props<{ error: string }>(),

    /** Add a new product */
    'Add Product': props<{ product: Product }>(),
    'Add Product Success': props<{ product: Product }>(),
    'Add Product Failure': props<{ error: string }>(),

    /** Update an existing product */
    'Update Product': props<{ product: Product }>(),
    'Update Product Success': props<{ product: Product }>(),
    'Update Product Failure': props<{ error: string }>(),

    /** Delete a product */
    'Delete Product': props<{ productId: string }>(),
    'Delete Product Success': props<{ productId: string }>(),
    'Delete Product Failure': props<{ error: string }>(),

    /** Select a product (for detail views) */
    'Select Product': props<{ productId: string | null }>(),

    /** Filter products by category */
    'Set Category Filter': props<{ category: string | null }>(),

    /** Clear all errors */
    'Clear Error': emptyProps(),
  },
});
