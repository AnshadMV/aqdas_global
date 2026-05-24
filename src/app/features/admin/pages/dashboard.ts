import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, effect } from '@angular/core';
import { Store } from '@ngrx/store';
import { CurrencyPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminActions } from '../../../store/admin/admin.actions';
import { selectDashboardStats, selectStatsLoading } from '../../../store/admin/admin.selectors';
import { ADMIN_TOP_PRODUCTS, ADMIN_DONUT_CATEGORIES, ADMIN_CHART_DATA } from '../../../../environments/constants';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, TitleCasePipe, UpperCasePipe, RouterLink],
  styles: `
    /* ─── Background & Ambient ─── */
    .admin-section {
      background: transparent;
      position: relative;
      overflow: hidden;
    }

    .admin-blob-1 {
      position: absolute; top: -10%; right: -5%; width: 40%; height: 40%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 4%, transparent), transparent 70%);
      filter: blur(100px); pointer-events: none;
    }

    .admin-blob-2 {
      position: absolute; bottom: -10%; left: -5%; width: 35%; height: 35%;
      background: radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%);
      filter: blur(100px); pointer-events: none;
    }

    /* ─── Container ─── */
    .admin-container {
      max-width: 1400px; margin: 0 auto; padding: 0.5rem 0; position: relative; z-index: 10;
    }

    /* ─── Header ─── */
    .admin-header { margin-bottom: 2.5rem; }
    .admin-title { font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .admin-subtitle { color: var(--theme-dark-light); font-size: 1rem; }

    /* ─── Stats Grid ─── */
    .stats-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 3rem; }
    @media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1280px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

    .stat-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); border-radius: 1.5rem;
      padding: 1.5rem 1.75rem; display: flex; align-items: center; gap: 1.25rem;
      box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative; overflow: hidden;
      cursor: pointer;
    }

    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px -8px color-mix(in srgb, var(--theme-dark) 8%, transparent); }

    .stat-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-dark) 8%, transparent), transparent);
    }

    .stat-icon-wrap {
      width: 3.5rem; height: 3.5rem; border-radius: 1rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: transform 0.3s ease;
    }
    .stat-card:hover .stat-icon-wrap { transform: scale(1.05); }

    .stat-icon-wrap.revenue { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .stat-icon-wrap.orders { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-icon-wrap.products { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .stat-icon-wrap.customers { background: rgba(16, 185, 129, 0.1); color: #10b981; }

    .stat-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--theme-dark-light); margin-bottom: 0.35rem; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; line-height: 1; }

    /* ─── Growth and Sparkline ─── */
    .stat-content { flex: 1; }
    .growth-indicator { font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.2rem; margin-top: 0.4rem; padding: 0.15rem 0.4rem; border-radius: 0.5rem; }
    .growth-indicator.pos { background: rgba(16, 185, 129, 0.08); color: #10b981; }
    .growth-period { opacity: 0.7; font-weight: 500; font-size: 0.65rem; }
    .stat-sparkline { flex-shrink: 0; opacity: 0.85; transition: transform 0.3s; margin-left: auto; }
    .stat-card:hover .stat-sparkline { transform: scale(1.05); opacity: 1; }
    
    .stat-card.active-dd {
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 12%, transparent);
      background: color-mix(in srgb, var(--theme-cream) 95%, transparent);
    }

    /* ─── Skeleton ─── */
    .skel-card {
      background: color-mix(in srgb, var(--theme-cream) 60%, transparent); border-radius: 1.5rem; padding: 1.75rem;
      display: flex; align-items: center; gap: 1.25rem; border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
    }
    .skel-circle { width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-lines { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--theme-cream-dark) 25%, var(--theme-cream) 50%, var(--theme-cream-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-line.w-60 { width: 60%; }
    .skel-line.w-40 { width: 40%; height: 20px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ─── Charts Grid Main ─── */
    .charts-grid-main { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3rem; }
    @media (min-width: 1024px) { .charts-grid-main { grid-template-columns: 2fr 1fr; } }
    
    .chart-card-main {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); border-radius: 2rem;
      padding: 2rem; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .chart-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); border-radius: 2rem;
      padding: 2rem; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
    }

    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
    .card-title { font-size: 1.25rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.01em; }
    .card-link { font-size: 0.8rem; font-weight: 700; color: var(--theme-primary); text-decoration: none; transition: opacity 0.2s; }
    .card-link:hover { opacity: 0.7; }
    .card-subtitle-small { font-size: 0.75rem; color: var(--theme-dark-light); margin-top: 0.15rem; }

    .timeframe-selector { display: flex; gap: 0.25rem; background: color-mix(in srgb, var(--theme-dark) 4%, transparent); padding: 0.25rem; border-radius: 0.85rem; }
    .tf-btn {
      padding: 0.4rem 0.85rem; border-radius: 0.6rem; font-size: 0.7rem; font-weight: 700;
      border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--theme-dark-light);
    }
    .tf-btn:hover { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); }
    .tf-btn.active { background: var(--theme-cream); color: var(--theme-primary); box-shadow: 0 4px 10px -2px rgba(15,23,42,0.06); }

    .line-chart-container { height: 200px; width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 1rem; }
    .svg-line-chart { width: 100%; height: 100%; }

    .donut-chart-wrapper { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; justify-content: center; margin-top: 1rem; }
    @media (min-width: 640px) { .donut-chart-wrapper { flex-direction: row; gap: 2rem; } }
    @media (min-width: 1024px) { .donut-chart-wrapper { flex-direction: column; gap: 1.5rem; } }

    .donut-chart-container { width: 150px; height: 150px; position: relative; }
    .svg-donut-chart { width: 100%; height: 100%; }
    
    .donut-slice {
      transition: stroke-width 0.2s, stroke 0.2s;
    }
    .donut-slice:hover { stroke-width: 18px; }
    .donut-slice.slice-active { stroke-width: 18px; }
    
    .donut-legend { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; width: 100%; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; cursor: pointer; padding: 0.35rem 0.5rem; border-radius: 0.5rem; transition: background 0.2s; }
    .legend-item:hover { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); }
    .legend-item.active { background: color-mix(in srgb, var(--theme-primary) 8%, transparent); font-weight: 700; }
    .legend-color { width: 0.5rem; height: 0.5rem; border-radius: 50%; display: inline-block; }
    .legend-label { color: var(--theme-dark-light); flex: 1; }
    .legend-value { color: var(--theme-dark); font-weight: 700; }

    /* ─── Bottom Tables Grid ─── */
    .bottom-tables-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3rem; }
    @media (min-width: 1024px) { .bottom-tables-grid { grid-template-columns: 1fr 1fr; } }

    .table-scroll-mini { overflow-x: auto; max-height: 280px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 0.75rem 0.5rem; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--theme-dark-light); border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); }
    th.sort-header { transition: background 0.2s; user-select: none; }
    th.sort-header:hover { background: color-mix(in srgb, var(--theme-dark) 4%, transparent); border-radius: 0.5rem; }
    th.sort-header span { font-size: 0.75rem; color: var(--theme-primary); margin-left: 0.2rem; }
    
    .product-row-drill { transition: background 0.2s; border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent); }
    .product-row-drill:hover { background: color-mix(in srgb, var(--theme-primary) 2%, transparent); }
    .product-row-drill:last-child { border-bottom: none; }
    .product-row-drill td { padding: 0.75rem 0.5rem; vertical-align: middle; }
    
    .p-drill-info { display: flex; flex-direction: column; }
    .p-drill-name { font-size: 0.8rem; font-weight: 700; color: var(--theme-dark); }
    .p-drill-cat { font-size: 0.65rem; color: var(--theme-dark-light); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.15rem; }
    
    .badge-filter-indicator { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Recent Orders List */
    .orders-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .order-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-radius: 1rem;
      background: color-mix(in srgb, var(--theme-cream) 50%, transparent); border: 1px solid color-mix(in srgb, var(--theme-dark) 3%, transparent);
      transition: all 0.2s ease;
    }
    .order-row:hover { background: color-mix(in srgb, var(--theme-cream) 90%, transparent); border-color: color-mix(in srgb, var(--theme-primary) 10%, transparent); }

    .order-left { display: flex; align-items: center; gap: 1rem; }
    .order-icon-wrap {
      width: 2.5rem; height: 2.5rem; border-radius: 0.75rem;
      background: color-mix(in srgb, var(--theme-dark) 4%, transparent); display: flex; align-items: center; justify-content: center; color: var(--theme-dark-light);
    }
    .order-id { font-size: 0.875rem; font-weight: 700; color: var(--theme-dark); }
    .order-customer { font-size: 0.75rem; color: var(--theme-dark-light); margin-top: 0.15rem; }

    .order-right { text-align: right; }
    .order-total { font-size: 0.9rem; font-weight: 700; color: var(--theme-dark); margin-bottom: 0.25rem; }

    .status-badge {
      display: inline-block; padding: 0.2rem 0.6rem; border-radius: 100px;
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase;
    }
    .status-pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .status-processing { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
    .status-shipped { background: rgba(99, 102, 241, 0.1); color: #4f46e5; }
    .status-delivered { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .status-cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--theme-dark-light); font-size: 0.9rem; font-weight: 500; }

    /* ─── Drilldown Banner ─── */
    .drilldown-banner {
      display: flex; align-items: center; justify-content: space-between;
      background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 15%, transparent);
      border-radius: 1rem; padding: 0.85rem 1.25rem; margin-bottom: 2rem;
      flex-wrap: wrap; gap: 0.5rem; animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .pulse-indicator { width: 0.5rem; height: 0.5rem; background: var(--theme-primary); border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--theme-primary) 50%, transparent); } 70% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--theme-primary) 0%, transparent); } 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--theme-primary) 0%, transparent); } }
    .drilldown-message { font-size: 0.8rem; color: var(--theme-dark); margin: 0; }
    .drilldown-message strong { color: var(--theme-primary); font-weight: 800; }
    .btn-clear-drilldown {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.4rem 0.85rem; border-radius: 0.6rem; border: none;
      background: var(--theme-primary); color: #fff; font-size: 0.75rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-clear-drilldown:hover { background: var(--theme-primary-dark); transform: scale(1.02); }

    /* ─── Quick Actions ─── */
    .actions-card {
      background: color-mix(in srgb, var(--theme-cream) 85%, transparent); backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); border-radius: 2rem;
      padding: 2rem; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
      margin-top: 3rem;
    }

    .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    @media (min-width: 768px) { .actions-grid { grid-template-columns: repeat(4, 1fr); } }

    .action-btn {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 1.75rem 1rem; border-radius: 1.5rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent); background: color-mix(in srgb, var(--theme-cream) 50%, transparent);
      text-decoration: none; transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); cursor: pointer;
    }

    .action-btn:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--theme-primary) 20%, transparent); background: color-mix(in srgb, var(--theme-cream) 90%, transparent); box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--theme-dark) 6%, transparent); }

    .action-icon-wrap {
      width: 3rem; height: 3rem; border-radius: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s ease;
    }
    .action-btn:hover .action-icon-wrap { transform: scale(1.1); }

    .action-icon-wrap.green { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary); }
    .action-icon-wrap.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .action-icon-wrap.emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .action-icon-wrap.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

    .action-label { font-size: 0.8rem; font-weight: 700; color: var(--theme-dark); text-align: center; }
  `,
  template: `
    <section class="admin-section">
      <div class="admin-blob-1"></div>
      <div class="admin-blob-2"></div>

      <div class="admin-container">
        <!-- Header -->
        <div class="admin-header">
          <h1 class="admin-title">Dashboard Overview</h1>
          <p class="admin-subtitle">Welcome back, Admin. Here's your real-time business snapshot.</p>
        </div>

        <!-- Drilldown notification banner -->
        @if (activeDrilldown() !== 'all') {
          <div class="drilldown-banner" role="alert">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="pulse-indicator"></span>
              <p class="drilldown-message">
                Showing drilled-down data for: <strong>{{ activeDrilldown() | titlecase }}</strong>
              </p>
            </div>
            <button (click)="clearDrilldown()" class="btn-clear-drilldown" aria-label="Clear active drilldown filter">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Back to Summary
            </button>
          </div>
        }

        <!-- Stats Grid -->
        @if (statsLoading()) {
          <div class="stats-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="skel-card">
                <div class="skel-circle"></div>
                <div class="skel-lines">
                  <div class="skel-line w-60"></div>
                  <div class="skel-line w-40"></div>
                </div>
              </div>
            }
          </div>
        } @else if (stats()) {
          <div class="stats-grid">
            <!-- Revenue -->
            <div class="stat-card" (click)="drilldownMetric('revenue')" [class.active-dd]="activeDrilldown() === 'revenue'" role="button" tabindex="0" aria-label="Revenue KPI Card. Click to drill down.">
              <div class="stat-icon-wrap revenue">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total Revenue</p>
                <p class="stat-value">{{ stats()!.totalRevenue | currency:'INR':'symbol':'1.0-0' }}</p>
                <span class="growth-indicator pos">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  +12.4% <span class="growth-period">WoW</span>
                </span>
              </div>
              <div class="stat-sparkline">
                <svg viewBox="0 0 80 30" width="80" height="30" aria-hidden="true">
                  <path d="M0,25 Q15,10 30,22 T60,5 T80,10" fill="none" stroke="var(--theme-primary)" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
            </div>

            <!-- Orders -->
            <div class="stat-card" (click)="drilldownMetric('orders')" [class.active-dd]="activeDrilldown() === 'orders'" role="button" tabindex="0" aria-label="Orders KPI Card. Click to drill down.">
              <div class="stat-icon-wrap orders">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total Orders</p>
                <p class="stat-value">{{ stats()!.totalOrders }}</p>
                <span class="growth-indicator pos">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  +8.2% <span class="growth-period">WoW</span>
                </span>
              </div>
              <div class="stat-sparkline">
                <svg viewBox="0 0 80 30" width="80" height="30" aria-hidden="true">
                  <path d="M0,15 Q20,25 40,8 T70,18 T80,4" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
            </div>

            <!-- Products -->
            <div class="stat-card" (click)="drilldownMetric('products')" [class.active-dd]="activeDrilldown() === 'products'" role="button" tabindex="0" aria-label="Products KPI Card. Click to drill down.">
              <div class="stat-icon-wrap products">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Active Products</p>
                <p class="stat-value">{{ stats()!.activeProducts }}</p>
                <span class="growth-indicator pos">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  +3.1% <span class="growth-period">MoM</span>
                </span>
              </div>
              <div class="stat-sparkline">
                <svg viewBox="0 0 80 30" width="80" height="30" aria-hidden="true">
                  <path d="M0,28 L20,24 L40,24 L60,15 L70,8 L80,4" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
            </div>

            <!-- Customers -->
            <div class="stat-card" (click)="drilldownMetric('customers')" [class.active-dd]="activeDrilldown() === 'customers'" role="button" tabindex="0" aria-label="Customers KPI Card. Click to drill down.">
              <div class="stat-icon-wrap customers">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total Customers</p>
                <p class="stat-value">{{ stats()!.totalCustomers }}</p>
                <span class="growth-indicator pos">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  +15.7% <span class="growth-period">WoW</span>
                </span>
              </div>
              <div class="stat-sparkline">
                <svg viewBox="0 0 80 30" width="80" height="30" aria-hidden="true">
                  <path d="M0,25 Q15,20 30,12 T60,5 T80,2" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
            </div>
          </div>
        }

        <!-- Interactive Charts Row -->
        <div class="charts-grid-main">
          <!-- Revenue Line Chart -->
          <div class="chart-card-main revenue-trend">
            <div class="card-header">
              <div>
                <h2 class="card-title">Revenue Trends</h2>
                <p class="card-subtitle-small">Interactive sales tracking over time</p>
              </div>
              <div class="timeframe-selector">
                @for (tf of ['weekly', 'monthly', 'annual']; track tf) {
                  <button (click)="selectedTimeframe.set($any(tf))" class="tf-btn" [class.active]="selectedTimeframe() === tf">
                    {{ tf | titlecase }}
                  </button>
                }
              </div>
            </div>
            
            <div class="line-chart-container">
              <svg viewBox="0 0 500 200" width="100%" height="100%" class="svg-line-chart">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--theme-primary)" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="var(--theme-primary)" stop-opacity="0.0" />
                  </linearGradient>
                </defs>
                
                <!-- Grid Lines -->
                <line x1="40" y1="40" x2="460" y2="40" stroke="color-mix(in srgb, var(--theme-dark) 4%, transparent)" stroke-dasharray="4" />
                <line x1="40" y1="105" x2="460" y2="105" stroke="color-mix(in srgb, var(--theme-dark) 4%, transparent)" stroke-dasharray="4" />
                <line x1="40" y1="170" x2="460" y2="170" stroke="color-mix(in srgb, var(--theme-dark) 8%, transparent)" />
                
                <!-- Y-Axis Labels -->
                <text x="32" y="44" text-anchor="end" font-size="7.5" font-weight="700" fill="var(--theme-dark-light)">Max</text>
                <text x="32" y="109" text-anchor="end" font-size="7.5" font-weight="700" fill="var(--theme-dark-light)">Mid</text>
                <text x="32" y="174" text-anchor="end" font-size="7.5" font-weight="700" fill="var(--theme-dark-light)">Min</text>

                <!-- Area Fill -->
                @if (svgPoints().fillPath) {
                  <path [attr.d]="svgPoints().fillPath" fill="url(#chartGrad)" />
                }
                
                <!-- Line Path -->
                @if (svgPoints().path) {
                  <path [attr.d]="svgPoints().path" fill="none" stroke="var(--theme-primary)" stroke-width="2.5" stroke-linecap="round" />
                }
                
                <!-- Interactive Circles -->
                @for (pt of svgPoints().points; track $index) {
                  <circle
                    [attr.cx]="pt.x"
                    [attr.cy]="pt.y"
                    r="4.5"
                    fill="#fff"
                    stroke="var(--theme-primary)"
                    stroke-width="2"
                    (mouseenter)="hoveredNode.set(pt)"
                    (mouseleave)="hoveredNode.set(null)"
                    style="cursor: pointer; transition: r 0.2s;"
                  />
                  <!-- Interactive Hover Area -->
                  <circle
                    [attr.cx]="pt.x"
                    [attr.cy]="pt.y"
                    r="14"
                    fill="transparent"
                    (mouseenter)="hoveredNode.set(pt)"
                    (mouseleave)="hoveredNode.set(null)"
                    style="cursor: pointer;"
                  />
                  <!-- X-Axis Label -->
                  <text [attr.x]="pt.x" y="188" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--theme-dark-light)">{{ pt.label }}</text>
                }

                <!-- Active Tooltip inside SVG -->
                @if (hoveredNode(); as node) {
                  <g>
                    <!-- Tooltip Background -->
                    <rect
                      [attr.x]="node.x - 45"
                      [attr.y]="node.y - 32"
                      width="90"
                      height="24"
                      rx="6"
                      fill="var(--theme-dark)"
                    />
                    <!-- Tooltip Text -->
                    <text [attr.x]="node.x" [attr.y]="node.y - 17" text-anchor="middle" fill="#fff" font-size="8" font-weight="800">
                      {{ node.value | currency:'INR':'symbol':'1.0-0' }}
                    </text>
                    <!-- Guideline -->
                    <line [attr.x1]="node.x" [attr.y1]="node.y" [attr.x2]="node.x" y2="170" stroke="var(--theme-primary)" stroke-width="1" stroke-dasharray="2" pointer-events="none" />
                  </g>
                }
              </svg>
            </div>
          </div>

          <!-- Product Categories Donut Chart -->
          <div class="chart-card-main categories-split">
            <div class="card-header">
              <div>
                <h2 class="card-title">Category Split</h2>
                <p class="card-subtitle-small">Hover slices to drill down</p>
              </div>
            </div>

            <div class="donut-chart-wrapper">
              <div class="donut-chart-container">
                <svg viewBox="0 0 200 200" width="100%" height="100%" class="svg-donut-chart">
                  @for (segment of donutSegments(); track segment.label) {
                    <!-- Donut Segment Circle -->
                    <circle
                      r="50"
                      cx="100"
                      cy="100"
                      fill="transparent"
                      [style.stroke]="segment.color"
                      stroke-width="14"
                      [attr.stroke-dasharray]="segment.strokeDash + ' 314.16'"
                      [style.transform]="'rotate(' + segment.rotation + 'deg)'"
                      style="transform-origin: 100px 100px; transition: stroke-width 0.2s, stroke 0.2s; cursor: pointer;"
                      (mouseenter)="hoveredSegment.set(segment)"
                      (mouseleave)="hoveredSegment.set(null)"
                      (click)="drilldownMetric(segment.label)"
                      [class.slice-active]="activeDrilldown() === segment.label"
                      class="donut-slice"
                    />
                  }
                  
                  <!-- Donut Hole Text -->
                  <g style="pointer-events: none;">
                    <text x="100" y="96" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--theme-dark-light)" letter-spacing="0.05em">
                      {{ hoveredSegment() ? (hoveredSegment().label | uppercase) : 'TOTAL ITEMS' }}
                    </text>
                    <text x="100" y="116" text-anchor="middle" font-size="16" font-weight="800" fill="var(--theme-dark)">
                      {{ hoveredSegment() ? hoveredSegment().percentage + '%' : (stats()?.activeProducts || 30) }}
                    </text>
                  </g>
                </svg>
              </div>
              
              <!-- Donut Legend -->
              <div class="donut-legend">
                @for (segment of donutSegments(); track segment.label) {
                  <div class="legend-item" (click)="drilldownMetric(segment.label)" [class.active]="activeDrilldown() === segment.label">
                    <span class="legend-color" [style.background-color]="segment.color"></span>
                    <span class="legend-label">{{ segment.label }}</span>
                    <span class="legend-value">{{ segment.percentage }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Drill-down specific tables / views -->
        <div class="bottom-tables-grid">
          <!-- Top Performing Products Table -->
          <div class="chart-card">
            <div class="card-header">
              <div>
                <h2 class="card-title">Top Products</h2>
                <p class="card-subtitle-small">Highest volume cardamom grades</p>
              </div>
              @if (activeDrilldown() !== 'all') {
                <span class="badge-filter-indicator">Filtered</span>
              }
            </div>

            <div class="table-scroll-mini">
              <table aria-label="Top Performing Products">
                <thead>
                  <tr>
                    <th (click)="toggleSort('name')" style="cursor:pointer;" class="sort-header" scope="col">
                      Grade / Name
                      @if (sortBy() === 'name') {
                        <span>{{ sortOrder() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                    <th (click)="toggleSort('sales')" style="cursor:pointer; text-align:right;" class="sort-header" scope="col">
                      Sales
                      @if (sortBy() === 'sales') {
                        <span>{{ sortOrder() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                    <th (click)="toggleSort('revenue')" style="cursor:pointer; text-align:right;" class="sort-header" scope="col">
                      Revenue
                      @if (sortBy() === 'revenue') {
                        <span>{{ sortOrder() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredTopProducts().length === 0) {
                    <tr>
                      <td colspan="3">
                        <div class="empty-state">No matching premium grades.</div>
                      </td>
                    </tr>
                  } @else {
                    @for (p of filteredTopProducts(); track p.id) {
                      <tr class="product-row-drill">
                        <td>
                          <div class="p-drill-info">
                            <span class="p-drill-name">{{ p.name }}</span>
                            <span class="p-drill-cat">{{ p.category }}</span>
                          </div>
                        </td>
                        <td style="text-align:right; font-weight:700; color:var(--theme-dark);">{{ p.sales }} units</td>
                        <td style="text-align:right; font-weight:800; color:var(--theme-primary);">{{ p.revenue | currency:'INR':'symbol':'1.0-0' }}</td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Orders Registry (with dynamic drill-down list) -->
          <div class="chart-card">
            <div class="card-header">
              <div>
                <h2 class="card-title">
                  {{ activeDrilldown() === 'orders' ? 'All Registry Orders' : 'Recent Orders' }}
                </h2>
                <p class="card-subtitle-small">Realtime transaction logging</p>
              </div>
              <a routerLink="/admin/orders" class="card-link">Manage →</a>
            </div>

            @if (statsLoading()) {
              <div style="display:flex;flex-direction:column;gap:0.75rem;">
                @for (i of [1,2,3]; track i) {
                  <div class="skel-card" style="padding:1rem 1.25rem;border-radius:1rem;">
                    <div class="skel-circle" style="width:2.5rem;height:2.5rem;border-radius:0.75rem;"></div>
                    <div class="skel-lines">
                      <div class="skel-line w-40" style="height:10px;"></div>
                      <div class="skel-line w-60" style="height:8px;"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (filteredOrders().length) {
              <div class="orders-list">
                @for (order of filteredOrders(); track order.id) {
                  <div class="order-row animate-fade-in">
                    <div class="order-left">
                      <div class="order-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      </div>
                      <div>
                        <p class="order-id">#{{ order.id.slice(-6).toUpperCase() }}</p>
                        <p class="order-customer">{{ order.customerName }}</p>
                      </div>
                    </div>
                    <div class="order-right">
                      <p class="order-total">{{ order.total | currency:'INR':'symbol':'1.0-0' }}</p>
                      <span class="status-badge" [class]="'status-' + order.status.toLowerCase()">
                        {{ order.status | titlecase }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">No matching orders yet.</div>
            }
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-card">
          <div class="card-header" style="margin-bottom:1.5rem;">
            <h2 class="card-title">Quick Actions</h2>
          </div>

          <div class="actions-grid">
            <a routerLink="/admin/products" class="action-btn">
              <div class="action-icon-wrap green">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span class="action-label">Add Product</span>
            </a>

            <a routerLink="/admin/orders" class="action-btn">
              <div class="action-icon-wrap blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <span class="action-label">Manage Orders</span>
            </a>

            <a routerLink="/admin/customers" class="action-btn">
              <div class="action-icon-wrap emerald">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span class="action-label">View Customers</span>
            </a>

            <a routerLink="/" class="action-btn">
              <div class="action-icon-wrap amber">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span class="action-label">View Store</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  readonly stats = this.store.selectSignal(selectDashboardStats);
  readonly statsLoading = this.store.selectSignal(selectStatsLoading);

  // Timeframe and Drill-down Signals
  readonly selectedTimeframe = signal<'weekly' | 'monthly' | 'annual'>('weekly');
  readonly hoveredNode = signal<{ x: number, y: number, value: number, label: string } | null>(null);
  readonly hoveredSegment = signal<any>(null);
  readonly activeDrilldown = signal<string>('all');

  // Top Performing Products Signal & Sorting State
  readonly sortBy = signal<'name' | 'sales' | 'revenue'>('sales');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  readonly topProducts = signal(ADMIN_TOP_PRODUCTS);

  // Donut category breakdown metrics
  readonly donutCategories = signal(ADMIN_DONUT_CATEGORIES);

  // SVG Line Chart coordinates computed signal
  readonly chartData = computed(() => {
    const tf = this.selectedTimeframe();
    return ADMIN_CHART_DATA[tf];
  });

  readonly svgPoints = computed(() => {
    const data = this.chartData();
    const vals = data.values;
    const N = vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    
    const points = vals.map((v, i) => {
      const x = 40 + (i * 420) / (N - 1 || 1);
      const y = 170 - ((v - min) / range) * 130;
      return { x, y, value: v, label: data.labels[i] };
    });
    
    let path = '';
    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    
    let fillPath = '';
    if (points.length > 0) {
      fillPath = `${path} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;
    }
    
    return { points, path, fillPath };
  });

  // SVG Donut Slices Computed Signal
  readonly donutSegments = computed(() => {
    const cats = this.donutCategories();
    let accumulated = 0;
    return cats.map(cat => {
      const pct = cat.percentage;
      const strokeDash = (pct / 100) * 314.159;
      const rotation = (accumulated / 100) * 360 - 90;
      accumulated += pct;
      return {
        ...cat,
        strokeDash,
        rotation,
      };
    });
  });

  // Sorted and filtered top cardamom grades
  readonly sortedTopProducts = computed(() => {
    const list = [...this.topProducts()];
    const key = this.sortBy();
    const order = this.sortOrder();
    list.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      if (typeof valA === 'string') {
        return order === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      } else {
        return order === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
    });
    return list;
  });

  readonly filteredTopProducts = computed(() => {
    const dd = this.activeDrilldown();
    const list = this.sortedTopProducts();
    if (['cardamom', 'elachi', 'seeds', 'powder'].includes(dd.toLowerCase())) {
      return list.filter(p => p.category.toLowerCase() === dd.toLowerCase());
    }
    return list;
  });

  // Orders table drill-down filter
  readonly filteredOrders = computed(() => {
    const dd = this.activeDrilldown();
    const list = this.stats()?.recentOrders || [];
    if (dd === 'orders') {
      return list;
    }
    if (dd === 'revenue') {
      return list.filter(o => o.total > 3000);
    }
    return list;
  });

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadDashboardStats());
  }

  drilldownMetric(metric: string): void {
    this.activeDrilldown.set(metric);
  }

  clearDrilldown(): void {
    this.activeDrilldown.set('all');
  }

  toggleSort(key: 'name' | 'sales' | 'revenue'): void {
    if (this.sortBy() === key) {
      this.sortOrder.update(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(key);
      this.sortOrder.set('desc');
    }
  }

  orderStatusItems() {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalOrders || 1;
    return [
      { label: 'Pending', count: s.pendingOrdersCount, color: '#d97706', pct: Math.round((s.pendingOrdersCount / total) * 100) },
      { label: 'Delivered', count: s.totalOrders - s.pendingOrdersCount, color: 'var(--theme-primary)', pct: Math.round(((s.totalOrders - s.pendingOrdersCount) / total) * 100) },
    ];
  }
}