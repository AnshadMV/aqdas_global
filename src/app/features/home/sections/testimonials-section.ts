import { Component, ChangeDetectionStrategy, inject, signal, OnInit, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import type { Testimonial } from '../../../shared/models';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-testimonials-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  host: { class: 'block' },
  styles: `
    .bg-grid {
      background-size: 50px 50px;
      background-image: linear-gradient(to right, rgba(0, 168, 89, 0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 168, 89, 0.04) 1px, transparent 1px);
    }
    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
    .mask-image-gradient {
      mask-image: radial-gradient(circle at center, black, transparent 85%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 85%);
    }
    .glass-card-premium {
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.88);
      box-shadow: 0 12px 40px rgba(15, 23, 42, 0.03);
      transition: transform 0.35s ease, box-shadow 0.35s ease;
    }
    .glass-card-premium:hover,
    .glass-card-premium-dark:hover {
      transform: translateY(-6px);
    }
    .glass-card-premium-dark {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);
      color: white;
      transition: transform 0.35s ease, box-shadow 0.35s ease;
    }
  `,
  template: `
    <section class="home-section relative bg-[#F8FAFC]">
      <div class="absolute inset-0 bg-noise opacity-[0.035] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient opacity-60"></div>
      <div class="absolute top-[20%] left-[-10%] h-[60%] w-[45%] rounded-full bg-accent/10 blur-[160px] pointer-events-none mix-blend-multiply"></div>
      <div class="absolute right-[-10%] bottom-[-10%] h-[50%] w-[35%] rounded-full bg-primary/15 blur-[160px] pointer-events-none mix-blend-multiply"></div>

      <div class="aq-container relative z-10">
        <div class="home-section__header" #testimonialsHeader>
          <div class="home-section__eyebrow">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            <span class="text-xs font-semibold uppercase tracking-[0.15em] text-primary sm:text-sm">Trusted Globally</span>
          </div>
          <h2 class="home-section__title">
            Praised by <span class="relative inline-block mt-2">
              <span class="relative z-10 bg-gradient-to-r from-primary-dark via-primary to-accent-dark bg-clip-text text-transparent">Culinary Masters</span>
              <svg class="absolute bottom-[-0.25rem] left-0 -z-10 h-3 w-full text-primary/20" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" fill="currentColor"/></svg>
            </span>
          </h2>
          <p class="home-section__copy">
            Reviews now sit in a cleaner grid with more balanced sizing, spacing, and readability across mobile, tablet, and desktop.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8" #testimonialsGrid>
          @for (t of testimonials(); track t.name; let idx = $index) {
            <div
              class="relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
              [class.lg:col-span-2]="idx === 0"
              [class.glass-card-premium-dark]="idx === 0"
              [class.glass-card-premium]="idx !== 0"
            >
              @if (idx === 0) {
                <div class="absolute top-0 right-0 -z-10 h-80 w-80 rounded-full bg-primary/20 blur-[100px] opacity-55"></div>
                <div class="flex h-full flex-col gap-6 lg:flex-row lg:items-center">
                  <div class="relative h-60 w-full shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-800 shadow-xl sm:h-72 lg:w-56">
                    <img [ngSrc]="'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80'" fill class="object-cover transition-transform duration-[2000ms] hover:scale-105" alt="Chef testimonial portrait" priority />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent"></div>
                    <div class="absolute bottom-4 left-4 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                      <div class="flex gap-0.5 text-accent">
                        @for (s of [1, 2, 3, 4, 5]; track s) {
                          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="relative flex flex-1 flex-col">
                    <svg class="absolute -top-2 -left-2 -z-10 h-12 w-12 text-white/5" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/></svg>
                    <p class="mb-6 font-heading text-lg leading-9 text-white/90 italic lg:text-xl">
                      "{{ t.text }}"
                    </p>
                    <div class="mt-auto flex items-center gap-3 border-t border-white/10 pt-4">
                      <div class="relative h-12 w-12 shrink-0">
                        <img [ngSrc]="'https://i.pravatar.cc/100?img=' + (idx + 10)" fill alt="Featured customer" class="rounded-full border-2 border-white/20 object-cover shadow-md" />
                        <div class="absolute right-[-0.2rem] bottom-[-0.2rem] flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0F172A] bg-primary">
                          <svg class="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      </div>
                      <div>
                        <h4 class="font-heading text-lg font-bold leading-none tracking-wide text-white">{{ t.name }}</h4>
                        <p class="mt-1.5 font-body text-[9px] uppercase tracking-[0.2em] text-white/60">{{ t.location }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="relative flex h-full flex-col items-center text-center">
                  <svg class="absolute top-0 right-4 -z-10 h-12 w-12 text-primary/5" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/></svg>
                  <div class="relative mb-6">
                    <div class="relative h-16 w-16">
                      <img [ngSrc]="'https://i.pravatar.cc/100?img=' + (idx + 10)" fill alt="Customer avatar" class="rounded-full border-2 border-white bg-slate-100 object-cover shadow-md" />
                    </div>
                    <div class="glass-card-premium absolute bottom-[-0.625rem] left-1/2 flex -translate-x-1/2 gap-0.5 rounded-full border border-white/95 px-2 py-1 shadow-sm">
                      @for (s of [1, 2, 3, 4, 5]; track s) {
                        <svg class="h-3 w-3 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      }
                    </div>
                  </div>

                  <p class="mb-8 pt-2 font-body text-base leading-8 text-dark-light/95 italic">
                    "{{ t.text }}"
                  </p>

                  <div class="mt-auto w-full border-t border-slate-200/50 pt-4">
                    <h4 class="font-heading text-lg font-bold leading-none tracking-wide text-dark">{{ t.name }}</h4>
                    <p class="mt-1.5 font-body text-[9px] uppercase tracking-[0.2em] text-dark-light/60">{{ t.location }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class TestimonialsSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly testimonialsHeader = viewChild<ElementRef>('testimonialsHeader');
  readonly testimonialsGrid = viewChild<ElementRef>('testimonialsGrid');

  readonly testimonials = signal<Testimonial[]>([]);

  constructor() {
    afterNextRender(() => {
      const header = this.testimonialsHeader()?.nativeElement;
      const grid = this.testimonialsGrid()?.nativeElement;

      if (header && grid) {
        gsap.from(header.children, {
          y: 35,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 85%' },
        });

        gsap.from(grid.children, {
          y: 45,
          opacity: 0,
          duration: 1.1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: grid, start: 'top 85%' },
        });
      }
    });
  }

  ngOnInit(): void {
    this.productService.getTestimonials().subscribe({
      next: (t) => this.testimonials.set(t.slice(0, 3)),
    });
  }
}
