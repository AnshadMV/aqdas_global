import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { HOME_CONTENT } from '../../../../environments/constants';

@Component({
  selector: 'app-offer-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { 'class': 'block' },
  styles: `
    /* ─── Section ─── */
    .offer-section {
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 30%, black) 0%, var(--theme-primary) 45%, var(--theme-primary-dark) 75%, color-mix(in srgb, var(--theme-primary) 70%, black) 100%);
    }

    /* Ambient orbs */
    .orb-a {
      position: absolute;
      top: -20%;
      left: -10%;
      width: 55%;
      height: 160%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.08), transparent 65%);
      pointer-events: none;
      animation: orb-drift 14s ease-in-out infinite;
    }

    .orb-b {
      position: absolute;
      bottom: -30%;
      right: -8%;
      width: 50%;
      height: 140%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245,158,11,0.15), transparent 65%);
      pointer-events: none;
      animation: orb-drift 18s ease-in-out infinite reverse 2s;
    }

    .orb-c {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      width: 60%;
      height: 300%;
      background: radial-gradient(ellipse, rgba(255,255,255,0.04), transparent 65%);
      pointer-events: none;
    }

    @keyframes orb-drift {
      0%, 100% { transform: translate(0,0) scale(1); }
      50%       { transform: translate(2%,-4%) scale(1.05); }
    }

    /* Noise texture */
    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    /* Decorative grid pattern */
    .banner-grid {
      background-size: 48px 48px;
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
    }

    /* ─── Container ─── */
    .aq-container {
      max-width: 860px;
      margin-left: auto;
      margin-right: auto;
      padding: 4.5rem 1.5rem;
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    @media (min-width: 640px) { .aq-container { padding: 5.5rem 2rem; } }
    @media (min-width: 1024px) { .aq-container { padding: 6rem 2.5rem; } }

    /* ─── Eyebrow ─── */
    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 40px;
      padding: 7px 18px;
      margin-bottom: 1.75rem;
    }

    @media (min-width: 640px) { .eyebrow-badge { margin-bottom: 2rem; } }

    .eyebrow-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.85);
      text-transform: uppercase;
    }

    /* ─── Offer Headline ─── */
    .offer-title {
      font-size: clamp(2.5rem, 7vw, 4rem);
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: white;
      margin-bottom: 0.625rem;
    }

    .offer-subtitle {
      font-size: clamp(1.1rem, 3vw, 1.5rem);
      font-weight: 400;
      color: rgba(255,255,255,0.75);
      margin-bottom: 1.5rem;
    }

    /* ─── Code Block ─── */
    .code-line {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2.5rem;
      font-size: 0.875rem;
      color: rgba(255,255,255,0.6);
    }

    @media (min-width: 640px) { .code-line { margin-bottom: 3rem; font-size: 0.9375rem; } }

    .code-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 0.625rem;
      padding: 0.375rem 0.875rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: #fbbf24;
      letter-spacing: 0.06em;
    }

    /* ─── Countdown ─── */
    .countdown-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      margin-bottom: 2.75rem;
    }

    @media (min-width: 640px) {
      .countdown-row { gap: 0.875rem; margin-bottom: 3rem; }
    }

    .countdown-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
    }

    .countdown-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3.75rem;
      height: 3.75rem;
      border-radius: 0.875rem;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1);
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
    }

    .countdown-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: rgba(255,255,255,0.04);
      border-radius: inherit;
    }

    @media (min-width: 640px) {
      .countdown-box { width: 4.5rem; height: 4.5rem; border-radius: 1rem; }
    }

    .countdown-num {
      font-size: 1.4rem;
      font-weight: 800;
      color: white;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      position: relative;
      z-index: 1;
    }

    @media (min-width: 640px) { .countdown-num { font-size: 1.75rem; } }

    .countdown-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
    }

    .countdown-sep {
      font-size: 1.5rem;
      font-weight: 700;
      color: rgba(255,255,255,0.3);
      align-self: flex-start;
      margin-top: 0.875rem;
      line-height: 1;
    }

    @media (min-width: 640px) { .countdown-sep { font-size: 1.75rem; margin-top: 1rem; } }

    /* ─── CTA Button ─── */
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.875rem;
      background: #f59e0b;
      color: #0f172a;
      font-weight: 800;
      font-size: 0.9375rem;
      letter-spacing: 0.01em;
      padding: 1rem 2.25rem;
      border-radius: 60px;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
      box-shadow: 0 8px 28px rgba(245,158,11,0.35);
      position: relative;
      overflow: hidden;
    }

    .cta-btn::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -60%;
      width: 28%;
      height: 200%;
      background: rgba(255,255,255,0.3);
      transform: rotate(30deg);
      transition: none;
    }

    .cta-btn:hover::before {
      left: 150%;
      transition: left 1.1s cubic-bezier(0.19,1,0.22,1);
    }

    .cta-btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 16px 40px rgba(245,158,11,0.4);
      background: #fbbf24;
    }

    .cta-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.875rem;
      height: 1.875rem;
      border-radius: 50%;
      background: rgba(15,23,42,0.12);
      transition: transform 0.3s ease;
    }

    .cta-btn:hover .cta-icon { transform: translateX(3px); }

    /* ─── Trust strip ─── */
    .trust-strip {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      margin-top: 2.25rem;
    }

    @media (min-width: 640px) { .trust-strip { gap: 2rem; } }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
    }

    .trust-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
    }
  `,
  template: `
    <section class="offer-section">
      <!-- Ambient -->
      <div class="orb-a"></div>
      <div class="orb-b"></div>
      <div class="orb-c"></div>
      <div class="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 banner-grid pointer-events-none"></div>

      <div class="aq-container">

        <!-- Eyebrow -->
        <div class="eyebrow-badge">
          <span class="w-[7px] h-[7px] rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <span class="eyebrow-text">{{ content.eyebrow }}</span>
        </div>

        <!-- Headline -->
        <h2 class="offer-title">{{ offerTitle() }}</h2>
        <p class="offer-subtitle">{{ offerSubtitle() }}</p>

        <!-- Code -->
        <div class="code-line">
          <span>Use code</span>
          <span class="code-chip">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            {{ offerCode() }}
          </span>
          <span>at checkout</span>
        </div>

        <!-- Countdown -->
        <div class="countdown-row">
          @for (unit of countdownUnits(); track unit.label) {
            <div class="countdown-unit">
              <div class="countdown-box">
                <span class="countdown-num">{{ unit.value.toString().padStart(2, '0') }}</span>
              </div>
              <span class="countdown-label">{{ unit.label }}</span>
            </div>
            @if (!$last) {
              <span class="countdown-sep">:</span>
            }
          }
        </div>

        <!-- CTA -->
        <a routerLink="/shop" class="cta-btn">
          <span>Shop Now &amp; Save</span>
          <span class="cta-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </span>
        </a>

        <!-- Trust -->
        <div class="trust-strip">
          @for (item of content.trustStrip; track item.text; let idx = $index) {
            <div class="trust-item">
              @if (item.iconType === 'secure') {
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              } @else if (item.iconType === 'shipping') {
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              } @else {
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              }
              {{ item.text }}
            </div>
            @if (!$last) {
              <div class="trust-dot"></div>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class OfferBannerComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);

  readonly content = HOME_CONTENT.offer;
  readonly offerTitle      = signal(HOME_CONTENT.offer.defaultTitle);
  readonly offerSubtitle   = signal(HOME_CONTENT.offer.defaultSubtitle);
  readonly offerCode       = signal(HOME_CONTENT.offer.defaultCode);
  readonly countdownUnits  = signal([
    { label: 'Days',    value: 3  },
    { label: 'Hours',   value: 12 },
    { label: 'Minutes', value: 45 },
    { label: 'Seconds', value: 0  },
  ]);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private targetDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  ngOnInit(): void {
    this.productService.getSiteConfig().subscribe({
      next: (c) => {
        if (c) {
          if (c.offerTitle)   this.offerTitle.set(c.offerTitle);
          if (c.offerSubtitle) this.offerSubtitle.set(c.offerSubtitle);
          if (c.offerCode)    this.offerCode.set(c.offerCode);
          if (c.offerEndDate) this.targetDate = new Date(c.offerEndDate);
        }
      },
    });
    this.timerId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  private updateCountdown(): void {
    const d = this.targetDate.getTime() - Date.now();
    if (d <= 0) {
      this.countdownUnits.set([
        { label: 'Days', value: 0 }, { label: 'Hours', value: 0 },
        { label: 'Minutes', value: 0 }, { label: 'Seconds', value: 0 },
      ]);
      return;
    }
    this.countdownUnits.set([
      { label: 'Days',    value: Math.floor(d / 86400000) },
      { label: 'Hours',   value: Math.floor((d % 86400000) / 3600000) },
      { label: 'Minutes', value: Math.floor((d % 3600000) / 60000) },
      { label: 'Seconds', value: Math.floor((d % 60000) / 1000) },
    ]);
  }
}