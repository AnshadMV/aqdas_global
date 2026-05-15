import { Component, ChangeDetectionStrategy, afterNextRender, signal, ElementRef, viewChild, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import gsap from 'gsap';

@Component({
  selector: 'app-hero-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { 'class': 'block' },
  styles: `
    .hero-float { animation: heroFloat 6s ease-in-out infinite; }
    @keyframes heroFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    .particle { position: absolute; border-radius: 50%; opacity: 0.15; animation: particleDrift 8s ease-in-out infinite; }
    @keyframes particleDrift { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-10px, -40px) rotate(180deg); } }
    .leaf-float { animation: leafFloat 10s ease-in-out infinite; }
    @keyframes leafFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(-3deg); } }
  `,
  template: `
    <section class="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-secondary via-cream to-secondary">
      <div class="particle w-32 h-32 bg-primary/10 top-[10%] left-[5%]"></div>
      <div class="particle w-20 h-20 bg-accent/15 top-[60%] left-[15%]" style="animation-delay:2s"></div>
      <div class="particle w-24 h-24 bg-primary/8 top-[20%] right-[10%]" style="animation-delay:4s"></div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="relative z-10" #heroText>
            <div class="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-2 mb-8">
              <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span class="text-primary text-xs font-body font-medium tracking-widest uppercase">Premium Organic</span>
            </div>
            <h1 class="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-dark leading-[1.1] mb-6">
              {{ heroTitle() }}
            </h1>
            <p class="font-body text-dark/60 text-lg sm:text-xl leading-relaxed max-w-lg mb-10">
              {{ heroSubtitle() }}
            </p>
            <div class="flex flex-wrap items-center gap-4 mb-12">
              <a routerLink="/shop" class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-body font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98]">
                Shop Now
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
            <div class="flex items-center gap-8 pt-4">
              @for (stat of stats(); track stat.label) {
                <div class="text-center">
                  <p class="font-heading text-2xl sm:text-3xl font-bold text-primary">{{ stat.value }}</p>
                  <p class="font-body text-xs text-dark/40 mt-1 uppercase tracking-wider">{{ stat.label }}</p>
                </div>
                @if (!$last) { <div class="w-px h-10 bg-dark/10"></div> }
              }
            </div>
          </div>

          <div class="relative flex items-center justify-center" #heroImageEl>
            <div class="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full border-2 border-dashed border-primary/10 animate-spin" style="animation-duration:60s"></div>
            <div class="absolute w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-br from-primary/5 to-accent/5"></div>
            <div class="relative hero-float z-10">
              <img [src]="heroImageUrl()" alt="Premium Kerala Green Cardamom" class="w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] object-cover rounded-3xl shadow-2xl shadow-primary/20" loading="eager" />
            </div>
            <div class="absolute top-10 right-10 leaf-float" style="animation-delay:1s">
              <div class="w-16 h-16 rounded-2xl bg-accent/20 backdrop-blur-sm flex items-center justify-center shadow-lg"><span class="text-2xl">🌿</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span class="font-body text-xs text-dark/30 tracking-widest uppercase">Scroll</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dark/30"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </section>
  `,
})
export class HeroSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly heroText = viewChild<ElementRef>('heroText');
  readonly heroImageEl = viewChild<ElementRef>('heroImageEl');

  readonly heroTitle = signal('Pure Kerala\nCardamom');
  readonly heroSubtitle = signal('Handpicked premium organic spices from the lush green hills of Kerala, delivered fresh to your kitchen.');
  readonly heroImageUrl = signal('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80');
  readonly stats = signal([
    { value: '500+', label: 'Products' },
    { value: '10K+', label: 'Customers' },
    { value: '100%', label: 'Organic' },
  ]);

  constructor() {
    afterNextRender(() => this.animateHero());
  }

  ngOnInit(): void {
    this.productService.getSiteConfig().subscribe({
      next: (config) => {
        if (config) {
          if ((config as any)['heroTitle']) this.heroTitle.set((config as any)['heroTitle']);
          if ((config as any)['heroSubtitle']) this.heroSubtitle.set((config as any)['heroSubtitle']);
          if ((config as any)['heroImage']) this.heroImageUrl.set((config as any)['heroImage']);
          if (config.stats) this.stats.set(config.stats);
        }
      },
    });
  }

  private animateHero(): void {
    const textEl = this.heroText()?.nativeElement;
    const imageEl = this.heroImageEl()?.nativeElement;
    if (textEl) gsap.from(textEl.children, { opacity: 0, y: 40, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
    if (imageEl) gsap.from(imageEl, { opacity: 0, scale: 0.9, duration: 1, delay: 0.3, ease: 'power3.out' });
  }
}
