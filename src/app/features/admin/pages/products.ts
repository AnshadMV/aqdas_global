import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, effect, untracked } from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductActions } from '../../../store/product/product.actions';
import { selectAllProducts, selectProductLoading } from '../../../store/product/product.selectors';
import type { Product } from '../../../shared/models';
import { AdminModalComponent } from '../components/modal';
import { ADMIN_ITEMS_PER_PAGE, ADMIN_PRODUCT_BADGES, ADMIN_PRODUCT_TABS } from '../../../../environments/constants';

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, AdminModalComponent],
  host: { class: 'block' },
  styles: `
    /* ─── Header ─── */
    .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-title { font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; }
    .header-desc { color: var(--theme-dark-light); font-size: 0.95rem; margin-top: 0.25rem; }
    .add-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.85rem 1.5rem; background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff; font-weight: 700; font-size: 0.875rem; border: none; border-radius: 1rem;
      cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }
    .add-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -6px color-mix(in srgb, var(--theme-primary) 40%, transparent); }

    /* ─── Toolbar ─── */
    .toolbar-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 9%, transparent); border-radius: 2rem 2rem 0 0;
      padding: 1rem 1.5rem; display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; justify-content: space-between;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
    }
    .search-wrap { position: relative; width: 100%; max-width: 18rem; }
    .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--theme-dark-light); pointer-events: none; }
    .search-input {
      width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem;
      background: color-mix(in srgb, var(--theme-cream) 80%, transparent); border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-radius: 0.875rem;
      font-size: 0.8rem; color: var(--theme-dark); outline: none; transition: all 0.3s;
    }
    .search-input:focus { border-color: var(--theme-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 8%, transparent); background: var(--theme-cream); }
    .search-input::placeholder { color: var(--theme-dark-light); }

    .btn-bulk-delete {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: 700;
      border: 1px solid rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); color: #ef4444;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-bulk-delete:hover {
      background: #ef4444; color: #fff; border-color: #ef4444;
      box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.3);
    }

    .tab-group { display: flex; gap: 0.35rem; }
    .tab-btn {
      padding: 0.55rem 1.125rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: 700;
      border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--theme-dark-light);
    }
    .tab-btn:hover { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); }
    .tab-btn.active { background: var(--theme-primary); color: #fff; box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--theme-primary) 30%, transparent); }

    /* ─── Checkbox ─── */
    .cb-label { display: inline-flex; align-items: center; cursor: pointer; position: relative; }
    .cb-input { position: absolute; opacity: 0; width: 0; height: 0; }
    .cb-box {
      width: 1.125rem; height: 1.125rem; border-radius: 0.35rem;
      border: 1.5px solid color-mix(in srgb, var(--theme-dark) 20%, transparent);
      background: color-mix(in srgb, var(--theme-cream-dark) 50%, transparent);
      transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    }
    .cb-input:checked + .cb-box {
      background: var(--theme-primary); border-color: var(--theme-primary);
    }
    .cb-input:checked + .cb-box::after {
      content: ''; width: 0.25rem; height: 0.5rem;
      border: solid #fff; border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-0.5px, -0.5px);
    }
    .cb-input:focus-visible + .cb-box {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 20%, transparent);
    }

    /* ─── Table ─── */
    .table-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 9%, transparent); border-radius: 0 0 2rem 2rem;
      overflow: hidden; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
    }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; text-align: left; border-collapse: collapse; }
    thead tr { background: color-mix(in srgb, var(--theme-dark) 2%, transparent); }
    th { padding: 0.875rem 1.5rem; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--theme-dark-light); white-space: nowrap; }
    td { padding: 0.875rem 1.5rem; border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); vertical-align: middle; }
    tbody tr { transition: background 0.2s; }
    tbody tr:hover { background: color-mix(in srgb, var(--theme-primary) 2%, transparent); }
    tbody tr:last-child td { border-bottom: none; }

    .product-cell { display: flex; align-items: center; gap: 0.875rem; }
    .product-thumb { width: 3rem; height: 3rem; border-radius: 0.75rem; object-fit: cover; background: var(--theme-cream-dark); border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); flex-shrink: 0; }
    .product-name { font-weight: 700; color: var(--theme-dark); font-size: 0.8rem; }
    .product-weight { font-size: 0.7rem; color: var(--theme-dark-light); margin-top: 0.1rem; }

    .price-current { font-weight: 800; color: var(--theme-dark); font-size: 0.8rem; }
    .price-original { font-size: 0.7rem; color: var(--theme-dark-light); text-decoration: line-through; }
    .stock-val { font-weight: 700; font-size: 0.8rem; }
    .stock-low { color: #ef4444; }
    .stock-ok { color: var(--theme-dark); }

    .status-badge { display: inline-flex; padding: 0.2rem 0.6rem; border-radius: 100px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.03em; }
    .status-active { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .status-draft { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); color: var(--theme-dark-light); }

    .action-btns { display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; opacity: 0; transition: opacity 0.2s; }
    tbody tr:hover .action-btns { opacity: 1; }
    .action-btn {
      width: 2rem; height: 2rem; border-radius: 0.5rem; border: none; background: transparent;
      display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--theme-dark-light); transition: all 0.2s;
    }
    .action-btn.view:hover { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .action-btn.edit:hover { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .action-btn.delete:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

    /* ─── Pagination ─── */
    .pagination-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.5rem; border-top: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      flex-wrap: wrap; gap: 1rem;
    }
    .pagination-info { font-size: 0.75rem; color: var(--theme-dark-light); }
    .pagination-info strong { color: var(--theme-dark); font-weight: 700; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-btn-arrow {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2.25rem; height: 2.25rem; border-radius: 0.75rem; border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      background: transparent; color: var(--theme-dark-light); font-weight: 700; font-size: 0.75rem;
      cursor: pointer; transition: all 0.2s;
    }
    .page-btn:hover, .page-btn-arrow:hover:not(:disabled) {
      background: color-mix(in srgb, var(--theme-dark) 4%, transparent);
      color: var(--theme-dark);
      border-color: color-mix(in srgb, var(--theme-dark) 15%, transparent);
    }
    .page-btn.active {
      background: var(--theme-primary); color: #fff; border-color: var(--theme-primary);
      box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }
    .page-btn-arrow:disabled { opacity: 0.4; cursor: not-allowed; }
    .pagination-ellipsis { font-size: 0.75rem; color: var(--theme-dark-light); padding: 0 0.25rem; }

    /* ─── Details Modal ─── */
    .product-details-sheet { display: flex; flex-direction: column; gap: 1.5rem; }
    .detail-header-row { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .detail-image-wrap { flex: 1 1 12rem; max-width: 15rem; height: 12rem; border-radius: 1.25rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); background: var(--theme-cream-dark); }
    .detail-image { width: 100%; height: 100%; object-fit: cover; }
    .detail-quick-info { flex: 2 1 18rem; display: flex; flex-direction: column; justify-content: center; }
    .detail-badge-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .badge-premium { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-title { font-size: 1.5rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; margin: 0 0 0.25rem 0; }
    .detail-category-weight { font-size: 0.85rem; color: var(--theme-dark-light); margin: 0 0 1rem 0; }
    .detail-pricing { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.25rem; }
    .detail-price { font-size: 1.5rem; font-weight: 800; color: var(--theme-dark); }
    .detail-original-price { font-size: 0.95rem; color: var(--theme-dark-light); text-decoration: line-through; }
    .detail-discount-percent { font-size: 0.8rem; font-weight: 700; color: var(--theme-primary); background: color-mix(in srgb, var(--theme-primary) 8%, transparent); padding: 0.15rem 0.4rem; border-radius: 0.5rem; }
    .detail-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px dashed color-mix(in srgb, var(--theme-dark) 10%, transparent); padding-top: 1rem; }
    .meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .meta-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--theme-dark-light); }
    .meta-value { font-size: 0.85rem; font-weight: 700; color: var(--theme-dark); }
    .rating-stars { display: flex; align-items: center; gap: 0.25rem; }
    .star-icon { color: #f59e0b; fill: #f59e0b; }
    .detail-description-section { border-top: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); padding-top: 1.25rem; }
    .section-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--theme-dark-light); margin: 0 0 0.5rem 0; }
    .detail-desc-text { font-size: 0.85rem; color: var(--theme-dark); line-height: 1.6; margin: 0; }
    .detail-footer-info { font-size: 0.65rem; color: var(--theme-dark-light); margin-top: 0.5rem; display: flex; gap: 0.5rem; }

    .img-preview { width: 100%; height: 10rem; border-radius: 1.25rem; overflow: hidden; background: var(--theme-cream-dark); border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); margin-bottom: 1.5rem; }
    .img-preview img { width: 100%; height: 100%; object-fit: cover; }

    .form-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
    @media (min-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; } .col-span-2 { grid-column: span 2; } }

    .form-label { display: block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--theme-dark-light); margin-bottom: 0.4rem; }
    .form-input, .form-select, .form-textarea {
      width: 100%; padding: 0.75rem 1rem; background: color-mix(in srgb, var(--theme-cream-dark) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent); border-radius: 0.875rem;
      font-size: 0.8rem; color: var(--theme-dark); outline: none; transition: all 0.3s; font-family: inherit;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--theme-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 8%, transparent); background: var(--theme-cream); }
    .form-textarea { resize: none; }

    .toggle-row { display: flex; align-items: center; gap: 2rem; padding: 0.5rem 0; }
    .toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
    .toggle-track { position: relative; width: 2.75rem; height: 1.5rem; background: color-mix(in srgb, var(--theme-dark) 15%, transparent); border-radius: 100px; transition: background 0.3s; }
    .toggle-track::after { content: ''; position: absolute; top: 0.125rem; left: 0.125rem; width: 1.25rem; height: 1.25rem; background: #fff; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.3s; }
    .toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
    .toggle-input:checked + .toggle-track { background: var(--theme-primary); }
    .toggle-input:checked + .toggle-track::after { transform: translateX(1.25rem); }
    .toggle-input.accent:checked + .toggle-track { background: #f59e0b; }
    .toggle-text { font-size: 0.8rem; font-weight: 700; color: var(--theme-dark); }

    .form-error { color: #ef4444; font-size: 0.75rem; font-weight: 500; margin-top: 0.5rem; }

    .modal-actions { display: flex; gap: 0.75rem; padding-top: 1.5rem; margin-top: 1rem; border-top: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); }
    .btn-cancel { flex: 1; padding: 0.85rem; border-radius: 1rem; border: 1px solid color-mix(in srgb, var(--theme-dark) 10%, transparent); background: transparent; font-weight: 700; font-size: 0.8rem; color: var(--theme-dark-light); cursor: pointer; transition: all 0.2s; }
    .btn-cancel:hover { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); }
    .btn-save {
      flex: 1; padding: 0.85rem; border-radius: 1rem; border: none;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark)); color: #fff; font-weight: 700; font-size: 0.8rem;
      cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }
    .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px -6px color-mix(in srgb, var(--theme-primary) 40%, transparent); }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Delete Dialog */
    .delete-icon { width: 4rem; height: 4rem; border-radius: 50%; background: rgba(239,68,68,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: #ef4444; }
    .delete-title { font-size: 1.25rem; font-weight: 800; color: var(--theme-dark); margin-bottom: 0.5rem; }
    .delete-desc { font-size: 0.8rem; color: var(--theme-dark-light); margin-bottom: 1.75rem; line-height: 1.6; }
    .delete-desc strong { color: var(--theme-dark); }
    .delete-actions { display: flex; gap: 0.75rem; }
    .btn-delete-confirm { flex: 1; padding: 0.85rem; border-radius: 1rem; border: none; background: #ef4444; color: #fff; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
    .btn-delete-confirm:hover { background: #dc2626; }

    /* Empty & Skeleton */
    .empty-state { padding: 4rem 2rem; text-align: center; }
    .empty-icon { width: 4rem; height: 4rem; background: color-mix(in srgb, var(--theme-dark) 4%, transparent); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--theme-dark-light); }
    .empty-text { font-weight: 600; color: var(--theme-dark-light); font-size: 0.9rem; }
    .skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-circle { width: 3rem; height: 3rem; border-radius: 0.75rem; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; flex-shrink: 0; }
    .skel-pill { height: 1.5rem; border-radius: 100px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `,
  template: `
    <!-- Header -->
    <div class="admin-header">
      <div>
        <h1 class="header-title">Products</h1>
        <p class="header-desc">Manage your catalog, inventory, and pricing.</p>
      </div>
      <button (click)="openAdd()" class="add-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Product
      </button>
    </div>

    <!-- Toolbar + Table -->
    <div class="toolbar-card">
      <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; flex:1;">
        <div class="search-wrap">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="product-search" type="text" placeholder="Search products..."
            [value]="search()" (input)="search.set($any($event.target).value)" class="search-input" />
        </div>
        @if (selectedIds().size > 0) {
          <button (click)="openBulkDelete()" class="btn-bulk-delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Delete Selected ({{ selectedIds().size }})
          </button>
        }
      </div>
      <div class="tab-group">
        @for (tab of productTabs; track tab) {
          <button (click)="activeTab.set(tab)" class="tab-btn" [class.active]="activeTab() === tab">{{ tab }}</button>
        }
      </div>
    </div>

    <div class="table-card">
      <div class="table-scroll">
        <table aria-label="Products table">
          <thead>
            <tr>
              <th style="width: 40px; padding-right: 0;">
                <label class="cb-label" aria-label="Select all products on current page">
                  <input type="checkbox" class="cb-input" 
                    [checked]="isAllSelectedOnPage()" 
                    [disabled]="paginatedProducts().length === 0"
                    (change)="toggleSelectAll()" />
                  <span class="cb-box"></span>
                </label>
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr>
                  <td style="width: 40px; padding-right: 0;"><div class="skel-line" style="width:1rem;"></div></td>
                  <td><div style="display:flex;align-items:center;gap:0.875rem;"><div class="skel-circle"></div><div style="display:flex;flex-direction:column;gap:0.3rem;"><div class="skel-line" style="width:7rem;"></div><div class="skel-line" style="width:4rem;height:10px;"></div></div></div></td>
                  <td><div class="skel-line" style="width:5rem;"></div></td>
                  <td><div class="skel-line" style="width:4rem;"></div></td>
                  <td><div class="skel-line" style="width:2.5rem;"></div></td>
                  <td><div class="skel-pill" style="width:4rem;"></div></td>
                  <td><div class="skel-line" style="width:4rem;margin-left:auto;"></div></td>
                </tr>
              }
            } @else if (filtered().length === 0) {
              <tr><td colspan="7"><div class="empty-state"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div><p class="empty-text">No products found.</p></div></td></tr>
            } @else {
              @for (p of paginatedProducts(); track p.id) {
                <tr>
                  <td style="padding-right: 0;">
                    <label class="cb-label" [attr.aria-label]="'Select ' + p.name">
                      <input type="checkbox" class="cb-input" 
                        [checked]="isSelected(p.id)" 
                        (change)="toggleSelect(p.id)" />
                      <span class="cb-box"></span>
                    </label>
                  </td>
                  <td>
                    <div class="product-cell">
                      <img [src]="p.imageUrl" [alt]="p.name" class="product-thumb" />
                      <div><p class="product-name">{{ p.name }}</p><p class="product-weight">{{ p.weight }}</p></div>
                    </div>
                  </td>
                  <td><span style="font-size:0.8rem;color:#475569;">{{ p.category }}</span></td>
                  <td>
                    <p class="price-current">{{ p.price | currency:'INR':'symbol':'1.0-0' }}</p>
                    @if (p.originalPrice > p.price) {<p class="price-original">{{ p.originalPrice | currency:'INR':'symbol':'1.0-0' }}</p>}
                  </td>
                  <td><span class="stock-val" [class.stock-low]="p.stock < 10" [class.stock-ok]="p.stock >= 10">{{ p.stock }}</span></td>
                  <td><span class="status-badge" [class.status-active]="p.isActive" [class.status-draft]="!p.isActive">{{ p.isActive ? 'Active' : 'Draft' }}</span></td>
                  <td>
                    <div class="action-btns">
                      <button (click)="viewDetails(p)" class="action-btn view" [attr.aria-label]="'View details of ' + p.name"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                      <button (click)="openEdit(p)" class="action-btn edit" [attr.aria-label]="'Edit ' + p.name"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                      <button (click)="deleteProduct(p)" class="action-btn delete" [attr.aria-label]="'Delete ' + p.name"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination bar controls -->
      <div class="pagination-bar">
        <div class="pagination-info">
          Showing <strong>{{ Math.min((currentPage() - 1) * itemsPerPage() + 1, filtered().length) }}-{{ Math.min(currentPage() * itemsPerPage(), filtered().length) }}</strong> of <strong>{{ filtered().length }}</strong> products
        </div>
        <div class="pagination-controls">
          <button (click)="prevPage()" [disabled]="currentPage() === 1" class="page-btn-arrow" aria-label="Previous page">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="pagination-ellipsis">&bull;&bull;&bull;</span>
            } @else {
              <button (click)="goToPage(page)" [class.active]="currentPage() === page" class="page-btn">
                {{ page }}
              </button>
            }
          }

          <button (click)="nextPage()" [disabled]="currentPage() === totalPages()" class="page-btn-arrow" aria-label="Next page">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <app-admin-modal
        [title]="editingProduct() ? 'Edit Product' : 'Add New Product'"
        [size]="'md'"
        (close)="closeModal()"
      >
        <form [formGroup]="form" (ngSubmit)="saveProduct()" style="display:flex; flex-direction:column; gap:1.5rem;">
          @if (form.get('imageUrl')?.value) {
            <div class="img-preview"><img [src]="form.get('imageUrl')?.value" alt="Preview" /></div>
          }
          <div class="form-grid">
            <div class="col-span-2"><label class="form-label">Product Name *</label><input type="text" formControlName="name" class="form-input" placeholder="e.g. Premium Green Cardamom" /></div>
            <div class="col-span-2"><label class="form-label">Cloudinary Image URL *</label><input type="url" formControlName="imageUrl" class="form-input" placeholder="https://res.cloudinary.com/..." /></div>
            <div><label class="form-label">Price (₹) *</label><input type="number" formControlName="price" class="form-input" placeholder="299" /></div>
            <div><label class="form-label">Original Price (₹)</label><input type="number" formControlName="originalPrice" class="form-input" placeholder="399" /></div>
            <div><label class="form-label">Category *</label><input type="text" formControlName="category" class="form-input" placeholder="Cardamom" /></div>
            <div><label class="form-label">Weight</label><input type="text" formControlName="weight" class="form-input" placeholder="100g" /></div>
            <div><label class="form-label">Stock *</label><input type="number" formControlName="stock" class="form-input" placeholder="100" /></div>
            <div>
              <label class="form-label">Badge</label>
              <select formControlName="badge" class="form-select">
                @for (badge of productBadges; track badge) {
                  <option [value]="badge">{{ badge || 'None' }}</option>
                }
              </select>
            </div>
            <div class="col-span-2"><label class="form-label">Short Description</label><input type="text" formControlName="shortDescription" class="form-input" placeholder="Brief tagline" /></div>
            <div class="col-span-2"><label class="form-label">Description</label><textarea formControlName="description" rows="3" class="form-textarea" placeholder="Full product description..."></textarea></div>
          </div>
          <div class="toggle-row">
            <label class="toggle-label"><div class="relative"><input type="checkbox" formControlName="isActive" class="toggle-input" /><div class="toggle-track"></div></div><span class="toggle-text">Active</span></label>
            <label class="toggle-label"><div class="relative"><input type="checkbox" formControlName="isFeatured" class="toggle-input accent" /><div class="toggle-track"></div></div><span class="toggle-text">Featured</span></label>
          </div>
          @if (formError()) {<p class="form-error" role="alert">{{ formError() }}</p>}
          <div class="modal-actions">
            <button type="button" (click)="closeModal()" class="btn-cancel">Cancel</button>
            <button type="submit" [disabled]="form.invalid || saving()" class="btn-save">
              @if (saving()) {<svg class="animate-spin" style="width:16px;height:16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style="opacity:0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:0.75;" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
              {{ saving() ? 'Saving...' : (editingProduct() ? 'Update Product' : 'Add Product') }}
            </button>
          </div>
        </form>
      </app-admin-modal>
    }

    <!-- Single Delete Confirm Modal -->
    @if (deletingProduct()) {
      <app-admin-modal
        [size]="'sm'"
        (close)="deletingProduct.set(null)"
      >
        <div style="text-align: center;">
          <div class="delete-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></div>
          <h3 class="delete-title">Delete Product?</h3>
          <p class="delete-desc">"<strong>{{ deletingProduct()!.name }}</strong>" will be permanently removed. This cannot be undone.</p>
          <div class="delete-actions">
            <button (click)="deletingProduct.set(null)" class="btn-cancel">Cancel</button>
            <button (click)="confirmDelete()" class="btn-delete-confirm">Delete</button>
          </div>
        </div>
      </app-admin-modal>
    }

    <!-- Bulk Delete Confirm Modal -->
    @if (showBulkDeleteModal()) {
      <app-admin-modal
        [size]="'sm'"
        (close)="showBulkDeleteModal.set(false)"
      >
        <div style="text-align: center;">
          <div class="delete-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></div>
          <h3 class="delete-title">Delete {{ selectedIds().size }} Products?</h3>
          <p class="delete-desc">You are about to permanently remove <strong>{{ selectedIds().size }}</strong> selected products. This action cannot be undone.</p>
          <div class="delete-actions">
            <button (click)="showBulkDeleteModal.set(false)" class="btn-cancel">Cancel</button>
            <button (click)="confirmBulkDelete()" class="btn-delete-confirm">Delete Selected</button>
          </div>
        </div>
      </app-admin-modal>
    }

    <!-- Product Details Sheet Modal -->
    @if (selectedProductDetails()) {
      <app-admin-modal
        [title]="'Product Information'"
        [size]="'md'"
        (close)="selectedProductDetails.set(null)"
      >
        <div class="product-details-sheet">
          <div class="detail-header-row">
            <div class="detail-image-wrap">
              <img [src]="selectedProductDetails()!.imageUrl" [alt]="selectedProductDetails()!.name" class="detail-image" />
            </div>
            <div class="detail-quick-info">
              <div class="detail-badge-row">
                <span class="status-badge" [class.status-active]="selectedProductDetails()!.isActive" [class.status-draft]="!selectedProductDetails()!.isActive">
                  {{ selectedProductDetails()!.isActive ? 'Active' : 'Draft' }}
                </span>
                @if (selectedProductDetails()!.badge) {
                  <span class="badge-premium">{{ selectedProductDetails()!.badge }}</span>
                }
              </div>
              <h2 class="detail-title">{{ selectedProductDetails()!.name }}</h2>
              <p class="detail-category-weight">{{ selectedProductDetails()!.category }} &bull; {{ selectedProductDetails()!.weight || 'No weight specified' }}</p>
              
              <div class="detail-pricing">
                <span class="detail-price">{{ selectedProductDetails()!.price | currency:'INR':'symbol':'1.0-0' }}</span>
                @if (selectedProductDetails()!.originalPrice > selectedProductDetails()!.price) {
                  <span class="detail-original-price">{{ selectedProductDetails()!.originalPrice | currency:'INR':'symbol':'1.0-0' }}</span>
                  <span class="detail-discount-percent">
                    {{ getDiscountPercent(selectedProductDetails()!.originalPrice, selectedProductDetails()!.price) }}% OFF
                  </span>
                }
              </div>
              
              <div class="detail-meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Stock Status</span>
                  <span class="meta-value" [class.stock-low]="selectedProductDetails()!.stock < 10" [class.stock-ok]="selectedProductDetails()!.stock >= 10">
                    {{ selectedProductDetails()!.stock }} units {{ selectedProductDetails()!.stock < 10 ? '(Low Stock!)' : '(In Stock)' }}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Rating</span>
                  <span class="meta-value rating-stars">
                    <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    {{ selectedProductDetails()!.rating || '0' }} ({{ selectedProductDetails()!.reviews || '0' }} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="detail-description-section">
            <h4 class="section-title">Product Description</h4>
            <p class="detail-desc-text">{{ selectedProductDetails()!.description || selectedProductDetails()!.shortDescription || 'No description available for this product.' }}</p>
          </div>

          <div class="detail-footer-info">
            <span>Created: {{ selectedProductDetails()!.createdAt | date:'medium' }}</span>
            @if (selectedProductDetails()!.updatedAt) {
              <span>&bull; Last Updated: {{ selectedProductDetails()!.updatedAt | date:'medium' }}</span>
            }
          </div>

          <div class="modal-actions" style="margin-top: 1.5rem;">
            <button (click)="selectedProductDetails.set(null)" class="btn-cancel" style="width: 100%;">Close Details</button>
          </div>
        </div>
      </app-admin-modal>
    }
  `,
})
export class AdminProductsComponent implements OnInit {
  protected readonly Math = Math;
  protected readonly productTabs = ADMIN_PRODUCT_TABS;
  protected readonly productBadges = ADMIN_PRODUCT_BADGES;
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  readonly products = this.store.selectSignal(selectAllProducts);
  readonly loading = this.store.selectSignal(selectProductLoading);
  
  // Search & Filter Signals
  readonly search = signal('');
  readonly activeTab = signal('All');
  readonly showModal = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly deletingProduct = signal<Product | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');

  // Pagination & Multi-Select & Modal Details Signals
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(ADMIN_ITEMS_PER_PAGE);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selectedProductDetails = signal<Product | null>(null);
  readonly showBulkDeleteModal = signal(false);

  readonly filtered = computed(() => {
    let list = this.products();
    const tab = this.activeTab();
    if (tab === 'Active') list = list.filter((p) => p.isActive);
    else if (tab === 'Draft') list = list.filter((p) => !p.isActive);
    const q = this.search().toLowerCase().trim();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    return list;
  });

  readonly totalPages = computed(() => {
    const len = this.filtered().length;
    return Math.max(1, Math.ceil(len / this.itemsPerPage()));
  });

  readonly paginatedProducts = computed(() => {
    const list = this.filtered();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return list.slice(start, start + this.itemsPerPage());
  });

  readonly visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push(-1); // ellipsis placeholder
      }
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (current < total - 2) {
        pages.push(-1); // ellipsis placeholder
      }
      if (!pages.includes(total)) pages.push(total);
    }
    return pages;
  });

  readonly isAllSelectedOnPage = computed(() => {
    const pageProducts = this.paginatedProducts();
    if (pageProducts.length === 0) return false;
    const selected = this.selectedIds();
    return pageProducts.every(p => selected.has(p.id));
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required], description: [''], shortDescription: [''],
    price: [0, [Validators.required, Validators.min(1)]], originalPrice: [0],
    category: ['', Validators.required], imageUrl: ['', Validators.required],
    images: [[] as string[]], stock: [0, [Validators.required, Validators.min(0)]],
    rating: [0], reviews: [0], badge: [''], isActive: [true], isFeatured: [false],
    weight: [''], createdAt: [''], updatedAt: [''],
  });

  constructor() {
    effect(() => {
      // Trigger side effect when active tab or search string changes
      this.activeTab();
      this.search();
      untracked(() => {
        // Reset back to page 1 to prevent out of bounds queries
        this.currentPage.set(1);
      });
    });
  }

  ngOnInit(): void { 
    this.store.dispatch(ProductActions.loadProducts()); 
  }

  // Pagination Actions
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  goToPage(p: number): void {
    if (p > 0) this.currentPage.set(p);
  }

  // Checkbox Actions
  toggleSelect(id: string): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  toggleSelectAll(): void {
    const pageProducts = this.paginatedProducts();
    const allSelected = this.isAllSelectedOnPage();
    this.selectedIds.update(set => {
      const next = new Set(set);
      for (const p of pageProducts) {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      }
      return next;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  // Bulk Deletion Modal Triggers
  openBulkDelete(): void {
    this.showBulkDeleteModal.set(true);
  }

  confirmBulkDelete(): void {
    const ids = Array.from(this.selectedIds());
    for (const id of ids) {
      this.store.dispatch(ProductActions.deleteProduct({ productId: id }));
    }
    this.selectedIds.update(set => {
      set.clear();
      return new Set(set);
    });
    this.showBulkDeleteModal.set(false);
  }

  // Single product detail sheet trigger
  viewDetails(p: Product): void {
    this.selectedProductDetails.set(p);
  }

  getDiscountPercent(original: number, current: number): number {
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  }

  openAdd(): void {
    this.editingProduct.set(null);
    this.form.reset({ isActive: true, isFeatured: false, price: 0, originalPrice: 0, stock: 0, rating: 0, reviews: 0, images: [] });
    this.formError.set(''); this.showModal.set(true);
  }

  openEdit(p: Product): void {
    this.editingProduct.set(p); this.form.patchValue(p);
    this.formError.set(''); this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.saving.set(false); }

  saveProduct(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.formError.set('');
    const v = this.form.getRawValue();
    const editing = this.editingProduct();
    if (editing) {
      this.store.dispatch(ProductActions.updateProduct({ product: { ...editing, ...v } }));
    } else {
      const now = new Date().toISOString();
      this.store.dispatch(ProductActions.addProduct({ product: { ...v, createdAt: now, updatedAt: now } as Product }));
    }
    setTimeout(() => { this.saving.set(false); this.closeModal(); }, 800);
  }

  deleteProduct(p: Product): void { this.deletingProduct.set(p); }
  confirmDelete(): void {
    const p = this.deletingProduct(); if (!p) return;
    this.store.dispatch(ProductActions.deleteProduct({ productId: p.id }));
    this.deletingProduct.set(null);
  }
}