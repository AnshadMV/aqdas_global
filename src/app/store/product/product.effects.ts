import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { ProductActions } from './product.actions';
import { ProductService } from '../../core/services/product.service';

/**
 * Product effects handle side-effects (Firestore calls) triggered by dispatched actions.
 * Each effect listens for a specific action, calls the service, and dispatches success/failure.
 */
@Injectable()
export class ProductEffects {
  private readonly actions$ = inject(Actions);
  private readonly productService = inject(ProductService);

  readonly loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      exhaustMap(() =>
        this.productService.getAll().pipe(
          map((products) => ProductActions.loadProductsSuccess({ products })),
          catchError((error: Error) =>
            of(ProductActions.loadProductsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  readonly loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProduct),
      exhaustMap(({ productId }) =>
        this.productService.getById(productId).pipe(
          map((product) => ProductActions.loadProductSuccess({ product })),
          catchError((error: Error) =>
            of(ProductActions.loadProductFailure({ error: error.message }))
          )
        )
      )
    )
  );

  readonly addProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.addProduct),
      exhaustMap(({ product }) =>
        this.productService.add(product).pipe(
          map((saved) => ProductActions.addProductSuccess({ product: saved })),
          catchError((error: Error) =>
            of(ProductActions.addProductFailure({ error: error.message }))
          )
        )
      )
    )
  );

  readonly updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      exhaustMap(({ product }) =>
        this.productService.update(product).pipe(
          map((updated) =>
            ProductActions.updateProductSuccess({ product: updated })
          ),
          catchError((error: Error) =>
            of(ProductActions.updateProductFailure({ error: error.message }))
          )
        )
      )
    )
  );

  readonly deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      exhaustMap(({ productId }) =>
        this.productService.delete(productId).pipe(
          map(() => ProductActions.deleteProductSuccess({ productId })),
          catchError((error: Error) =>
            of(ProductActions.deleteProductFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
