import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-offer-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { 'class': 'block' },
  template: `
    <section class="relative py-24 bg-gradient-to-r from-primary-dark via-primary to-primary-light overflow-hidden">
      <div class="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-8">
          <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          <span class="text-white/80 text-xs font-body font-medium tracking-widest uppercase">Limited Time Offer</span>
        </div>
        <h2 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">{{ offerTitle() }}</h2>
        <p class="font-heading text-2xl text-white/80 mb-4">{{ offerSubtitle() }}</p>
        <p class="font-body text-white/50 text-base mb-10 max-w-lg mx-auto">
          Use code <span class="text-accent font-semibold bg-white/10 px-3 py-1 rounded-lg">{{ offerCode() }}</span> at checkout
        </p>
        <div class="flex items-center justify-center gap-4 sm:gap-6 mb-12">
          @for (unit of countdownUnits(); track unit.label) {
            <div class="text-center">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-2">
                <span class="font-heading text-2xl sm:text-3xl font-bold text-white">{{ unit.value.toString().padStart(2, '0') }}</span>
              </div>
              <span class="font-body text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">{{ unit.label }}</span>
            </div>
            @if (!$last) { <span class="font-heading text-2xl text-white/30 mb-6">:</span> }
          }
        </div>
        <a routerLink="/shop" class="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-dark font-body font-bold px-10 py-4 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-1 text-lg">
          Shop Now & Save
        </a>
      </div>
    </section>
  `,
})
export class OfferBannerComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  readonly offerTitle = signal('Get 20% OFF');
  readonly offerSubtitle = signal('on Your First Order');
  readonly offerCode = signal('AQDAS20');
  readonly countdownUnits = signal([
    { label: 'Days', value: 3 }, { label: 'Hours', value: 12 },
    { label: 'Minutes', value: 45 }, { label: 'Seconds', value: 0 },
  ]);
  private timerId: ReturnType<typeof setInterval> | null = null;
  private targetDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  ngOnInit(): void {
    this.productService.getSiteConfig().subscribe({
      next: (c) => {
        if (c) {
          if (c.offerTitle) this.offerTitle.set(c.offerTitle);
          if (c.offerSubtitle) this.offerSubtitle.set(c.offerSubtitle);
          if (c.offerCode) this.offerCode.set(c.offerCode);
          if (c.offerEndDate) this.targetDate = new Date(c.offerEndDate);
        }
      },
    });
    this.timerId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void { if (this.timerId) clearInterval(this.timerId); }

  private updateCountdown(): void {
    const d = this.targetDate.getTime() - Date.now();
    if (d <= 0) { this.countdownUnits.set([{ label: 'Days', value: 0 }, { label: 'Hours', value: 0 }, { label: 'Minutes', value: 0 }, { label: 'Seconds', value: 0 }]); return; }
    this.countdownUnits.set([
      { label: 'Days', value: Math.floor(d / 86400000) },
      { label: 'Hours', value: Math.floor((d % 86400000) / 3600000) },
      { label: 'Minutes', value: Math.floor((d % 3600000) / 60000) },
      { label: 'Seconds', value: Math.floor((d % 60000) / 1000) },
    ]);
  }
}
