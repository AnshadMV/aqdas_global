import { Component, ChangeDetectionStrategy, inject, signal, effect, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { OrderService, Order } from '../../core/services/order.service';
import { CartActions } from '../../store/cart/cart.actions';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ToastService } from '../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DatePipe, SpinnerComponent, FormsModule],
  host: { 'class': 'block' },
  styles: `
    /* ─── Search & Filters ─── */
    .filters-card {
      background: var(--theme-cream);
      backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      border-radius: 1.5rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
    }

    @media (min-width: 768px) {
      .filters-card {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .search-wrap {
      position: relative;
      width: 100%;
      max-width: 320px;
    }

    @media (min-width: 768px) {
      .search-wrap { width: 320px; }
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--theme-dark-light);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 2.75rem;
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 1rem;
      font-size: 0.9rem;
      color: var(--theme-dark);
      outline: none;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      border-color: #00a859;
      box-shadow: 0 0 0 4px rgba(0, 168, 89, 0.08);
      background: var(--theme-white);
    }

    .search-input::placeholder { color: var(--theme-dark-light); opacity: 0.6; }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
      scrollbar-width: none;
    }

    .filter-tabs::-webkit-scrollbar { display: none; }

    .filter-tab {
      padding: 0.65rem 1.25rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      color: var(--theme-dark-light);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
    }

    .filter-tab:hover {
      background: rgba(0, 168, 89, 0.05);
      border-color: rgba(0, 168, 89, 0.2);
      color: #00a859;
    }

    .filter-tab.active {
      background: linear-gradient(135deg, #00a859, #16a34a);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 8px 20px -6px rgba(0, 168, 89, 0.3);
    }

    /* ─── Loading & Empty States ─── */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      backdrop-filter: blur(12px);
      border-radius: 2rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
    }

    .loading-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      margin-top: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      backdrop-filter: blur(12px);
      border-radius: 2rem;
      border: 1px dashed color-mix(in srgb, var(--theme-dark) 15%, transparent);
    }

    .empty-icon {
      width: 5rem;
      height: 5rem;
      background: linear-gradient(135deg, rgba(0,168,89,0.08), rgba(22,163,74,0.12));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: #00a859;
      box-shadow: 0 8px 24px -8px rgba(0, 168, 89, 0.2);
    }

    .empty-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--theme-dark);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .empty-desc {
      color: var(--theme-dark-light);
      margin-bottom: 2rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #00a859, #16a34a);
      color: #fff;
      font-weight: 700;
      padding: 1rem 2rem;
      border-radius: 100px;
      text-decoration: none;
      box-shadow: 0 8px 24px -8px rgba(0, 168, 89, 0.4);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .empty-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px -8px rgba(0, 168, 89, 0.5);
    }

    /* ─── Order Cards ─── */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .order-card {
      background: var(--theme-cream);
      backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      border-radius: 1.5rem;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
    }

    .order-card:hover {
      box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.08);
    }

    .order-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      background: color-mix(in srgb, var(--theme-white) 50%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      transition: background 0.2s ease;
    }

    .order-header:hover {
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
    }

    .order-header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .expand-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: color-mix(in srgb, var(--theme-dark) 6%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--theme-dark-light);
      transition: all 0.3s ease;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
      background: rgba(0, 168, 89, 0.1);
      color: #00a859;
    }

    .order-id {
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--theme-dark);
      letter-spacing: -0.01em;
    }

    .order-meta {
      font-size: 0.8rem;
      color: var(--theme-dark-light);
      margin-top: 0.15rem;
    }

    .order-header-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .order-status-badge {
      display: inline-block;
      padding: 0.35rem 0.875rem;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: 100px;
    }

    .status-pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .status-processing { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
    .status-shipped { background: rgba(99, 102, 241, 0.1); color: #4f46e5; }
    .status-delivered { background: rgba(0, 168, 89, 0.1); color: #00a859; }
    .status-cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .order-total {
      font-size: 1.25rem;
      font-weight: 800;
      color: #00a859;
    }

    /* ─── Order Body (Expanded) ─── */
    .order-body {
      padding: 1.5rem;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── Tracking Stepper ─── */
    .tracking-section {
      padding-bottom: 2rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--theme-dark);
      margin-bottom: 1.5rem;
    }

    .stepper {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 600px;
      margin: 0 auto;
      overflow: hidden;
    }

    @media (min-width: 640px) {
      .stepper {
        flex-direction: row;
        justify-content: space-between;
        gap: 0;
      }
    }

    .stepper-line {
      position: absolute;
      left: 1.25rem;
      top: 1.25rem;
      bottom: 1.25rem;
      width: 2px;
      background: color-mix(in srgb, var(--theme-dark) 8%, transparent);
      z-index: 0;
    }

    @media (min-width: 640px) {
      .stepper-line {
        left: calc(1.25rem);
        right: calc(1.25rem);
        top: 1.25rem;
        bottom: auto;
        width: auto;
        height: 2px;
      }
    }

    .stepper-progress {
      position: absolute;
      left: 1.25rem;
      top: 1.25rem;
      width: 2px;
      max-height: calc(100% - 2.5rem);
      background: linear-gradient(to bottom, var(--theme-primary), var(--theme-primary-light));
      z-index: 1;
      transition: height 0.5s ease;
    }

    @media (min-width: 640px) {
      .stepper-progress {
        left: calc(1.25rem);
        top: 1.25rem;
        height: 2px !important;
        width: 0;
        max-height: none;
        max-width: calc(100% - 2.5rem);
        background: linear-gradient(to right, var(--theme-primary), var(--theme-primary-light));
        transition: width 0.5s ease;
      }
    }

    .stepper-step {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .stepper-step {
        flex: 1;
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
        min-width: 0;
      }
    }

    .step-indicator {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .step-indicator.completed {
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light));
      color: #fff;
      box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }

    .step-indicator.current {
      background: var(--theme-white);
      border: 2px solid var(--theme-primary);
      color: var(--theme-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 15%, transparent);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 15%, transparent); }
      50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--theme-primary) 8%, transparent); }
    }

    .step-indicator.pending {
      background: color-mix(in srgb, var(--theme-dark) 4%, transparent);
      border: 2px solid color-mix(in srgb, var(--theme-dark) 10%, transparent);
      color: var(--theme-dark-light);
    }

    .step-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .step-label.completed { color: var(--theme-primary); }
    .step-label.current { color: var(--theme-primary); }
    .step-label.pending { color: var(--theme-dark-light); }

    /* ─── Order Items ─── */
    .items-section {
      margin-bottom: 2rem;
    }

    .items-container {
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      border-radius: 1.25rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      padding: 1rem;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
    }

    .order-item:last-child { border-bottom: none; }

    .item-image {
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      background: var(--theme-cream-dark);
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-weight: 700;
      color: var(--theme-dark);
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-meta {
      font-size: 0.8rem;
      color: var(--theme-dark-light);
      margin-top: 0.25rem;
    }

    .item-price {
      font-weight: 700;
      color: #00a859;
      font-size: 1rem;
    }

    /* ─── Details Grid ─── */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
    }

    @media (min-width: 768px) {
      .details-grid { grid-template-columns: 1fr 1fr; }
    }

    .detail-card {
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      border-radius: 1.25rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      padding: 1.25rem;
    }

    .detail-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--theme-dark);
      margin-bottom: 1rem;
    }

    .detail-content {
      font-size: 0.875rem;
      color: var(--theme-dark-light);
      line-height: 1.6;
    }

    .detail-content p { margin-bottom: 0.25rem; }

    .detail-content .label {
      font-weight: 600;
      color: var(--theme-dark);
    }

    .detail-content .divider {
      height: 1px;
      background: color-mix(in srgb, var(--theme-dark) 8%, transparent);
      margin: 0.75rem 0;
    }

    .detail-content .small {
      font-size: 0.75rem;
      color: var(--theme-dark-light);
      opacity: 0.8;
    }

    .payment-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
    }

    .payment-row.total {
      border-top: 1px dashed color-mix(in srgb, var(--theme-dark) 15%, transparent);
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      font-weight: 700;
    }

    .payment-method-badge {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: color-mix(in srgb, var(--theme-dark) 6%, transparent);
      color: var(--theme-dark-light);
      padding: 0.25rem 0.625rem;
      border-radius: 0.375rem;
    }

    .free-text { color: #00a859; font-weight: 700; }
    .total-amount { color: #00a859; font-weight: 800; }

    /* ─── Action Buttons ─── */
    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1.5rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 10%, transparent);
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: var(--theme-white);
      border-color: rgba(0, 168, 89, 0.3);
      color: #00a859;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.08);
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      background: linear-gradient(135deg, #00a859, #16a34a);
      border: none;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 8px 20px -6px rgba(0, 168, 89, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px -6px rgba(0, 168, 89, 0.4);
    }


    /* ─── Invoice Modal Overlay ─── */
.invoice-modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  animation: fadeIn 0.3s ease-out;
}

.invoice-modal-content {
  position: relative;
  width: 100%; max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ─── Modal Actions ─── */
.invoice-modal-actions {
  position: absolute; bottom: 1.25rem; right: 1.25rem;
  display: flex; gap: 0.5rem; z-index: 10;
}

.invoice-action-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1rem; border-radius: 12px;
  background: rgba(15, 23, 42, 0.04); border: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 0.8rem; font-weight: 600; color: #475569;
  cursor: pointer; transition: all 0.2s ease;
}
.invoice-action-btn:hover { background: rgba(0, 168, 89, 0.08); color: #00a859; border-color: rgba(0, 168, 89, 0.2); }
.invoice-action-btn.close { padding: 0.6rem; }
.invoice-action-btn.close:hover { background: rgba(239, 68, 68, 0.08); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }

/* ─── Invoice Document ─── */
.invoice-document { padding: 3rem; }

.invoice-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding-bottom: 2rem; margin-bottom: 2rem;
  border-bottom: 2px solid rgba(15, 23, 42, 0.06);
}
.brand-name { font-size: 2rem; font-weight: 900; color: #0f172a; letter-spacing: -0.03em; line-height: 1; }
.brand-tagline { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; color: #00a859; margin-top: 0.35rem; text-transform: uppercase; }
.doc-title { font-size: 1rem; font-weight: 800; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase; text-align: right; }
.doc-id { font-size: 0.85rem; font-weight: 700; color: #00a859; text-align: right; margin-top: 0.25rem; }

/* Addresses */
.invoice-addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; }
.address-label { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.75rem; }
.address-name { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
.address-text { font-size: 0.85rem; color: #64748b; line-height: 1.5; }
.address-email { font-size: 0.8rem; color: #94a3b8; margin-top: 0.5rem; }
.align-right { text-align: right; }
.detail-row { display: flex; justify-content: flex-end; gap: 0.75rem; font-size: 0.85rem; margin-bottom: 0.35rem; }
.detail-key { color: #94a3b8; }
.detail-val { font-weight: 600; color: #0f172a; }
.status-pill { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 100px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
.status-pending { background: rgba(245,158,11,0.1); color: #d97706; }
.status-delivered { background: rgba(0,168,89,0.1); color: #00a859; }
.status-processing { background: rgba(59,130,246,0.1); color: #2563eb; }
.status-shipped { background: rgba(99,102,241,0.1); color: #4f46e5; }
.status-cancelled { background: rgba(239,68,68,0.1); color: #ef4444; }

/* Table */
.invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
.invoice-table th {
  padding: 0.75rem 0; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8;
  border-bottom: 2px solid rgba(15,23,42,0.06);
}
.invoice-table td { padding: 1rem 0; border-bottom: 1px solid rgba(15,23,42,0.04); font-size: 0.85rem; color: #475569; vertical-align: top; }
.invoice-table tr:last-child td { border-bottom: none; }
.item-name { font-weight: 700; color: #0f172a; margin-bottom: 0.15rem; }
.item-sku { font-size: 0.7rem; color: #94a3b8; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; color: #0f172a; }

/* Totals */
.invoice-totals { display: flex; justify-content: flex-end; margin-bottom: 2.5rem; }
.totals-grid { width: 260px; }
.total-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.85rem; color: #64748b; }
.total-row.shipping .free-tag { color: #00a859; font-weight: 700; }
.total-row.grand {
  border-top: 2px solid rgba(15,23,42,0.08); margin-top: 0.5rem; padding-top: 0.75rem;
  font-size: 1.1rem; font-weight: 800; color: #0f172a;
}
.grand-value { color: #00a859; }

/* Footer */
.invoice-footer {
  text-align: center; padding-top: 2rem; border-top: 1px solid rgba(15,23,42,0.06);
  font-size: 0.7rem; color: #94a3b8; font-style: italic; line-height: 1.6;
}

/* ─── Print Overrides ─── */
@media print {
  .no-print { display: none !important; }
  body * { visibility: hidden; }
  #invoice-receipt, #invoice-receipt * { visibility: visible; }
  #invoice-receipt {
    position: absolute; left: 0; top: 0; width: 100%;
    padding: 0; margin: 0; background: #fff;
  }
  .invoice-modal-overlay { position: absolute; background: transparent; backdrop-filter: none; padding: 0; }
  .invoice-modal-content { box-shadow: none; border-radius: 0; max-height: none; overflow: visible; }
  .status-pill { border: 1px solid currentColor; background: transparent !important; }
}
  `,
  template: `
    <div>
      <!-- Search & Filters -->
      <div class="filters-card">
        <div class="search-wrap">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search Order ID..."
            class="search-input"
          />
        </div>

        <div class="filter-tabs">
          @for (filter of filterOptions; track filter) {
            <button 
              (click)="selectedFilter.set(filter)" 
              class="filter-tab"
              [class.active]="selectedFilter() === filter">
              {{ filter }}
            </button>
          }
        </div>
      </div>

      <!-- Orders List -->
      @if (loading()) {
        <div class="loading-state">
          <app-spinner size="md" />
          <p class="loading-text">Retrieving your premium orders...</p>
        </div>
      } @else if (filteredOrders().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </div>
          <h3 class="empty-title">No Premium Orders Found</h3>
          <p class="empty-desc">You haven't placed any orders matching this criteria yet. Let's spice up your pantry with Kerala's finest.</p>
          <a routerLink="/shop" class="empty-btn">
            <span>Explore Spice Garden</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of filteredOrders(); track order.id) {
            <div class="order-card">
              <!-- Card Header -->
              <div (click)="toggleOrderExpand(order.id)" class="order-header">
                <div class="order-header-left">
                  <div class="expand-icon" [class.expanded]="expandedOrderId() === order.id">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="order-id">Order #{{ order.id }}</h3>
                    <p class="order-meta">{{ order.createdAt | date:'mediumDate' }} • {{ order.items.length }} {{ order.items.length === 1 ? 'Item' : 'Items' }}</p>
                  </div>
                </div>

                <div class="order-header-right">
                  <span class="order-status-badge" [class]="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
                  <span class="order-total">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
              </div>

              <!-- Card Body (Expandable) -->
              @if (expandedOrderId() === order.id) {
                <div class="order-body">
                  <!-- Tracking Stepper -->
                  <div class="tracking-section">
                    <h4 class="section-title">Tracking Status</h4>
                    <div class="stepper">
                      <div class="stepper-line"></div>
                      <div class="stepper-progress" [style.height.%]="getProgressHeight(order.status)" [style.width.%]="getProgressWidth(order.status)"></div>

                      @for (step of steps; track step.key; let i = $index) {
                        <div class="stepper-step">
                          <div class="step-indicator" 
                               [class.completed]="isStepCompleted(order.status, step.key)"
                               [class.current]="order.status === step.key"
                               [class.pending]="!isStepCompleted(order.status, step.key) && order.status !== step.key">
                            @if (isStepCompleted(order.status, step.key)) {
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            } @else {
                              <span>{{ i + 1 }}</span>
                            }
                          </div>
                          <span class="step-label" 
                                [class.completed]="isStepCompleted(order.status, step.key)"
                                [class.current]="order.status === step.key"
                                [class.pending]="!isStepCompleted(order.status, step.key) && order.status !== step.key">
                            {{ step.label }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div class="items-section">
                    <h4 class="section-title">Items Ordered</h4>
                    <div class="items-container">
                      @for (item of order.items; track item.productId) {
                        <div class="order-item">
                          <div class="item-image">
                            <img [src]="item.imageUrl" [alt]="item.name" />
                          </div>
                          <div class="item-info">
                            <p class="item-name">{{ item.name }}</p>
                            <p class="item-meta">Weight: {{ item.weight || '250g' }} • Qty: {{ item.quantity }}</p>
                          </div>
                          <p class="item-price">{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</p>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Details Grid -->
                  <div class="details-grid">
                    <div class="detail-card">
                      <h4 class="detail-title">Shipping Location</h4>
                      <div class="detail-content">
                        <p class="label">{{ order.customerName }}</p>
                        <p>{{ order.shippingAddress.address }}</p>
                        <p>{{ order.shippingAddress.city }} - {{ order.shippingAddress.postalCode }}</p>
                        <div class="divider"></div>
                        <p class="small">Email: {{ order.customerEmail }}</p>
                      </div>
                    </div>

                    <div class="detail-card">
                      <h4 class="detail-title">Payment Summary</h4>
                      <div class="detail-content">
                        <div class="payment-row">
                          <span>Method:</span>
                          <span class="payment-method-badge">{{ order.paymentMethod || 'COD' }}</span>
                        </div>
                        <div class="payment-row">
                          <span>Subtotal:</span>
                          <span class="label">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</span>
                        </div>
                        <div class="payment-row">
                          <span>Shipping:</span>
                          <span class="free-text">FREE</span>
                        </div>
                        <div class="payment-row total">
                          <span>Grand Total:</span>
                          <span class="total-amount">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="action-buttons">
                    <button (click)="openInvoice(order)" class="btn-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      <span>Invoice Receipt</span>
                    </button>

                    <button (click)="reorderAll(order.items)" class="btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                      </svg>
                      <span>Reorder All Items</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

        <!-- Premium Invoice Modal -->
  @if (activeInvoiceOrder()) {
    <div class="invoice-modal-overlay" (click)="closeInvoice()">
      <div class="invoice-modal-content" (click)="$event.stopPropagation()">
        
        <!-- Modal Actions (Hidden on Print) -->
        <div class="invoice-modal-actions no-print">
          <button (click)="printInvoice()" class="invoice-action-btn" aria-label="Print Invoice">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Print</span>
          </button>
          <button (click)="closeInvoice()" class="invoice-action-btn close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Printable Invoice Document -->
        <div id="invoice-receipt" class="invoice-document">
          
          <!-- Header -->
          <div class="invoice-header">
            <div class="invoice-brand">
              <h2 class="brand-name">AQDAS</h2>
              <p class="brand-tagline">PREMIUM KERALA SPICES</p>
            </div>
            <div class="invoice-meta">
              <h3 class="doc-title">INVOICE RECEIPT</h3>
              <p class="doc-id">#{{ activeInvoiceOrder()!.id }}</p>
            </div>
          </div>

          <!-- Address Grid -->
          <div class="invoice-addresses">
            <div class="address-block">
              <p class="address-label">BILLED TO</p>
              <p class="address-name">{{ activeInvoiceOrder()!.customerName }}</p>
              <p class="address-text">{{ activeInvoiceOrder()!.shippingAddress.address }}</p>
              <p class="address-text">{{ activeInvoiceOrder()!.shippingAddress.city }}, {{ activeInvoiceOrder()!.shippingAddress.postalCode }}</p>
              <p class="address-email">{{ activeInvoiceOrder()!.customerEmail }}</p>
            </div>
            <div class="address-block align-right">
              <p class="address-label">TRANSACTION DETAILS</p>
              <div class="detail-row"><span class="detail-key">Order Date:</span> <span class="detail-val">{{ activeInvoiceOrder()!.createdAt | date:'mediumDate' }}</span></div>
              <div class="detail-row"><span class="detail-key">Payment:</span> <span class="detail-val">Cash on Delivery</span></div>
              <div class="detail-row"><span class="detail-key">Status:</span> <span class="detail-val status-pill" [class]="'status-' + activeInvoiceOrder()!.status.toLowerCase()">{{ activeInvoiceOrder()!.status }}</span></div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="invoice-table">
            <thead>
              <tr>
                <th class="text-left">Item Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              @for (item of activeInvoiceOrder()!.items; track item.productId) {
                <tr>
                  <td>
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-sku">Size: {{ item.weight || '250g' }}</p>
                  </td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right">{{ item.price | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td class="text-right font-bold">{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Totals -->
          <div class="invoice-totals">
            <div class="totals-grid">
              <div class="total-row">
                <span>Subtotal</span>
                <span>{{ activeInvoiceOrder()!.total | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
              <div class="total-row shipping">
                <span>Shipping Charges</span>
                <span class="free-tag">FREE</span>
              </div>
              <div class="total-row grand">
                <span>Amount Due</span>
                <span class="grand-value">{{ activeInvoiceOrder()!.total | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="invoice-footer">
            <p>Thank you for choosing AQDAS Premium Spices.</p>
            <p>Support: support&#64;aqdas-spices.com | WhatsApp: +91 98765 43210</p>
          </div>
        </div>
      </div>
    </div>
  
      }
    </div>
  `,
})
export class MyOrdersComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);

  searchQuery = '';
  readonly selectedFilter = signal<string>('All');
  readonly filterOptions = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];

  readonly expandedOrderId = signal<string | null>(null);
  readonly activeInvoiceOrder = signal<Order | null>(null);

  readonly steps = [
    { key: 'Pending', label: 'Placed' },
    { key: 'Processing', label: 'Processing' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Delivered', label: 'Delivered' }
  ];

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.loading.set(true);
        this.orderService.getUserOrders(u.uid).subscribe({
          next: (res) => {
            this.orders.set(res);
            this.loading.set(false);
            if (res.length > 0) {
              this.expandedOrderId.set(res[0].id);
            }
          },
          error: () => {
            this.loading.set(false);
          }
        });
      } else {
        this.orders.set([]);
        this.loading.set(false);
      }
    });
  }

  filteredOrders() {
    return this.orders().filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(this.searchQuery.toLowerCase().trim());
      const filter = this.selectedFilter();
      const matchesFilter = filter === 'All' || o.status.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }

  toggleOrderExpand(id: string): void {
    if (this.expandedOrderId() === id) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(id);
    }
  }

  getProgressHeight(status: string): number {
    const s = status.toLowerCase();
    if (s === 'pending') return 10;
    if (s === 'processing') return 40;
    if (s === 'shipped') return 70;
    if (s === 'delivered') return 100;
    return 0;
  }

  getProgressWidth(status: string): number {
    const s = status.toLowerCase();
    if (s === 'pending') return 10;
    if (s === 'processing') return 40;
    if (s === 'shipped') return 70;
    if (s === 'delivered') return 100;
    return 0;
  }

  isStepCompleted(orderStatus: string, stepKey: string): boolean {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(orderStatus.toLowerCase());
    const stepIdx = statusOrder.indexOf(stepKey.toLowerCase());
    return stepIdx <= currentIdx && currentIdx !== -1;
  }

  reorderAll(orderItems: any[]): void {
    const u = this.user();
    const uid = u ? u.uid : null;
    orderItems.forEach(item => {
      this.store.dispatch(CartActions.addToCart({
        item: {
          productId: item.productId,
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight || '250g'
        },
        uid
      }));
    });
    this.toastService.success('All items added to cart!');
    this.router.navigate(['/cart']);
  }

  openInvoice(order: Order): void {
    this.activeInvoiceOrder.set(order);
    document.body.classList.add('modal-open');
  }

  closeInvoice(): void {
    this.activeInvoiceOrder.set(null);
    document.body.classList.remove('modal-open');
  }

  printInvoice(): void {
    window.print();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
  }
}