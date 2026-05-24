import { Component, ChangeDetectionStrategy, inject, signal, OnInit, afterNextRender, ElementRef, viewChild, effect } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import type { Testimonial } from '../../../shared/models';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOME_CONTENT } from '../../../../environments/constants';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-testimonials-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  host: { class: 'block' },
  styles: `
    /* ─── Section ─── */
    .testimonials-section {
      background: var(--theme-cream-dark);
      position: relative;
      overflow: hidden;
    }

    .bg-grid {
      background-size: 50px 50px;
      background-image:
        linear-gradient(to right, rgba(0,168,89,0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,168,89,0.035) 1px, transparent 1px);
    }

    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .mask-image-gradient {
      mask-image: radial-gradient(circle at center, black, transparent 85%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 85%);
    }

    /* ─── Container ─── */
    .aq-container {
      max-width: 1280px;
      margin-left: auto;
      margin-right: auto;
      padding: 4.5rem 1.5rem;
      position: relative;
      z-index: 10;
    }

    @media (min-width: 640px) { .aq-container { padding: 5.5rem 2rem; } }
    @media (min-width: 1024px) { .aq-container { padding: 6.5rem 2.5rem; } }

    /* ─── Section Header ─── */
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    @media (min-width: 640px) { .section-header { margin-bottom: 3.5rem; } }
    @media (min-width: 1024px) { .section-header { margin-bottom: 4rem; } }

    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,168,89,0.06);
      border: 1px solid rgba(0,168,89,0.18);
      border-radius: 40px;
      padding: 7px 20px;
      margin-bottom: 1.5rem;
      transition: border-color 0.3s, background 0.3s;
    }

    @media (min-width: 640px) { .eyebrow-badge { margin-bottom: 1.75rem; } }
    @media (min-width: 1024px) { .eyebrow-badge { margin-bottom: 2rem; } }

    .eyebrow-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: var(--theme-primary);
      text-transform: uppercase;
    }

    .main-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: var(--theme-dark);
      margin-bottom: 1rem;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark), #f59e0b);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .title-underline {
      position: absolute;
      bottom: -0.3rem;
      left: 0;
      width: 100%;
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(90deg, transparent, var(--theme-primary), #f59e0b, transparent);
    }

    .subtitle {
      font-size: clamp(13px, 1.5vw, 15px);
      line-height: 1.7;
      color: var(--theme-dark-light);
      max-width: 520px;
      margin: 0 auto;
    }

    /* ─── Grid ─── */
    .testimonials-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    @media (min-width: 768px) {
      .testimonials-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
    }

    @media (min-width: 1024px) {
      .testimonials-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.75rem;
      }
    }

    /* ─── Cards ─── */
    .tcard {
      border-radius: 2rem;
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.4s cubic-bezier(0.22,1,0.36,1);
      overflow: hidden;
    }

    .tcard:hover { transform: translateY(-7px); }

    /* Light card */
    .tcard--light {
      background: color-mix(in srgb, var(--theme-white) 65%, transparent);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid color-mix(in srgb, var(--theme-white) 92%, transparent);
      box-shadow:
        0 4px 6px -2px rgba(0,0,0,0.04),
        0 12px 28px -8px rgba(0,0,0,0.07);
      padding: 1.75rem;
    }

    @media (min-width: 640px) { .tcard--light { padding: 2rem; } }

    .tcard--light:hover {
      box-shadow:
        0 8px 16px -4px rgba(0,0,0,0.06),
        0 24px 48px -12px rgba(0,168,89,0.1);
    }

    /* Dark / featured card */
    .tcard--dark {
      background: linear-gradient(145deg, #0f172a 0%, #1a2540 55%, #0f1d30 100%);
      border: 1px solid rgba(255,255,255,0.09);
      box-shadow:
        0 4px 6px -2px rgba(0,0,0,0.18),
        0 16px 40px -8px rgba(0,0,0,0.32);
      padding: 1.75rem;
    }

    @media (min-width: 640px) { .tcard--dark { padding: 2rem; } }

    .tcard--dark:hover {
      box-shadow:
        0 8px 16px -4px rgba(0,0,0,0.24),
        0 32px 64px -12px rgba(0,0,0,0.4),
        0 0 0 1px rgba(0,168,89,0.18);
    }

    /* Wide: span 2 cols on lg */
    @media (min-width: 1024px) {
      .tcard--wide { grid-column: span 2; }
    }

    /* ─── Featured Card (dark) internals ─── */
    .featured-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: 100%;
    }

    @media (min-width: 768px) {
      .featured-layout {
        flex-direction: row;
        align-items: center;
        gap: 2rem;
      }
    }

    .featured-image-wrap {
      position: relative;
      flex-shrink: 0;
      border-radius: 1.625rem;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
      background: #1e293b;
      height: 14rem;
      width: 100%;
      box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    }

    @media (min-width: 640px) { .featured-image-wrap { height: 16rem; } }

    @media (min-width: 768px) {
      .featured-image-wrap {
        width: 13rem;
        height: 100%;
        min-height: 14rem;
      }
    }

    @media (min-width: 1024px) {
      .featured-image-wrap { width: 14rem; }
    }

    .featured-img-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.14) 55%, transparent 100%);
      pointer-events: none;
    }

    .featured-rating-chip {
      position: absolute;
      bottom: 0.875rem;
      left: 0.875rem;
      display: flex;
      align-items: center;
      gap: 3px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 0.625rem;
      padding: 5px 10px;
    }

    .featured-content {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .quote-icon {
      position: absolute;
      top: -0.5rem;
      left: -0.5rem;
      z-index: 0;
      opacity: 0.06;
    }

    .featured-quote {
      font-size: clamp(0.9rem, 1.8vw, 1.05rem);
      font-style: italic;
      line-height: 1.75;
      color: rgba(255,255,255,0.88);
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .featured-footer {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 1.125rem;
      margin-top: auto;
    }

    .avatar-wrap {
      position: relative;
      width: 2.75rem;
      height: 2.75rem;
      flex-shrink: 0;
    }

    .verified-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: var(--theme-primary);
      border: 2px solid #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reviewer-name {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: white;
      line-height: 1.2;
    }

    .reviewer-location {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-top: 3px;
    }

    /* ─── Regular Card (light) internals ─── */
    .regular-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: 100%;
    }

    .avatar-section {
      position: relative;
      margin-bottom: 1.375rem;
    }

    .avatar-circle {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      overflow: hidden;
      border: 2.5px solid var(--theme-white);
      background: var(--theme-cream-dark);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      position: relative;
    }

    .stars-chip {
      position: absolute;
      bottom: -0.75rem;
      left: 50%;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: color-mix(in srgb, var(--theme-white) 95%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--theme-white) 98%, transparent);
      border-radius: 40px;
      padding: 4px 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.07);
      white-space: nowrap;
    }

    .regular-quote {
      font-size: 0.875rem;
      font-style: italic;
      line-height: 1.75;
      color: var(--theme-dark-light);
      margin-top: 0.625rem;
      margin-bottom: 1.5rem;
      flex: 1;
    }

    .regular-footer {
      width: 100%;
      border-top: 1px solid color-mix(in srgb, var(--theme-dark) 7%, transparent);
      padding-top: 1.125rem;
      margin-top: auto;
    }

    .regular-name {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--theme-dark);
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .regular-location {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--theme-dark-light);
      margin-top: 4px;
    }

    /* Star icons */
    .star { color: #f59e0b; fill: #f59e0b; }
  `,
  template: `
    <section class="testimonials-section">
      <!-- Ambient -->
      <div class="absolute inset-0 bg-noise opacity-[0.032] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient opacity-55"></div>
      <div class="absolute top-[18%] left-[-12%] h-[60%] w-[48%] rounded-full bg-accent/8 blur-[150px] pointer-events-none mix-blend-multiply"></div>
      <div class="absolute right-[-10%] bottom-[-12%] h-[52%] w-[38%] rounded-full bg-primary/12 blur-[150px] pointer-events-none mix-blend-multiply"></div>

      <div class="aq-container">

        <!-- ── Header ── -->
        <div class="section-header" #testimonialsHeader>
          <div class="eyebrow-badge">
            <span class="relative flex h-[7px] w-[7px]">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex h-[7px] w-[7px] rounded-full bg-primary"></span>
            </span>
            <span class="eyebrow-text">{{ content.eyebrow }}</span>
          </div>

          <h2 class="main-title">
            {{ content.title.main }}
            <span class="relative inline-block ml-2">
              <span class="relative z-10 gradient-text">{{ content.title.accent }}</span>
              <span class="title-underline"></span>
            </span>
          </h2>

          <p class="subtitle">
            {{ content.subtitle }}
          </p>
        </div>

        <!-- ── Grid ── -->
        <div class="testimonials-grid" #testimonialsGrid>
          @for (t of testimonials(); track t.name; let idx = $index) {

            <!-- Featured (dark, wide) card -->
            @if (idx === 0) {
              <div class="tcard tcard--dark tcard--wide">
                <!-- Ambient glow inside card -->
                <div class="absolute top-0 right-0 -z-0 h-72 w-72 rounded-full bg-primary/18 blur-[90px] opacity-50 pointer-events-none"></div>

                <div class="featured-layout relative z-10">

                  <!-- Image -->
                  <div class="featured-image-wrap">
                    <img
                      [ngSrc]="content.featuredPortrait"
                      fill
                      class="object-cover transition-transform duration-[2000ms] hover:scale-105"
                      alt="Chef testimonial portrait"
                      priority
                    />
                    <div class="featured-img-gradient"></div>
                    <div class="featured-rating-chip">
                      @for (s of [1,2,3,4,5]; track s) {
                        <svg class="h-3 w-3 star" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      }
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="featured-content">
                    <svg class="quote-icon w-14 h-14" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
                    </svg>
                    <p class="featured-quote">"{{ t.text }}"</p>

                    <div class="featured-footer">
                      <div class="avatar-wrap">
                        <img
                          [ngSrc]="'https://i.pravatar.cc/100?img=' + (idx + 10)"
                          fill
                          alt="Featured reviewer"
                          class="rounded-full border-2 border-white/20 object-cover"
                        />
                        <div class="verified-dot">
                          <svg width="7" height="7" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div class="reviewer-name">{{ t.name }}</div>
                        <div class="reviewer-location">{{ t.location }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Regular (light) cards -->
            @if (idx !== 0) {
              <div class="tcard tcard--light">
                <div class="regular-layout">

                  <!-- Avatar + stars -->
                  <div class="avatar-section">
                    <div class="avatar-circle">
                      <img
                        [ngSrc]="'https://i.pravatar.cc/100?img=' + (idx + 10)"
                        fill
                        alt="Customer avatar"
                        class="object-cover"
                      />
                    </div>
                    <div class="stars-chip">
                      @for (s of [1,2,3,4,5]; track s) {
                        <svg class="h-[10px] w-[10px] star" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      }
                    </div>
                  </div>

                  <!-- Quote -->
                  <p class="regular-quote">"{{ t.text }}"</p>

                  <!-- Footer -->
                  <div class="regular-footer">
                    <div class="regular-name">{{ t.name }}</div>
                    <div class="regular-location">{{ t.location }}</div>
                  </div>
                </div>
              </div>
            }
          }
        </div>

      </div>
    </section>
  `,
})
export class TestimonialsSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly testimonialsHeader = viewChild<ElementRef>('testimonialsHeader');
  readonly testimonialsGrid   = viewChild<ElementRef>('testimonialsGrid');

  readonly content = HOME_CONTENT.testimonials;
  readonly testimonials = signal<Testimonial[]>([]);

  constructor() {
    afterNextRender(() => {
      const header = this.testimonialsHeader()?.nativeElement;
      if (header) {
        gsap.from(header.children, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none reverse' },
        });
      }
    });

    effect(() => {
      const list = this.testimonials();
      if (list.length > 0) {
        setTimeout(() => this.animateGrid());
      }
    });
  }

  ngOnInit(): void {
    this.productService.getTestimonials().subscribe({
      next: (t) => this.testimonials.set(t.slice(0, 3)),
    });
  }

  private animateGrid(): void {
    const grid = this.testimonialsGrid()?.nativeElement;
    if (grid) {
      gsap.from(grid.children, {
        y: 44,
        opacity: 0,
        scale: 0.97,
        duration: 1.0,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }
  }
}