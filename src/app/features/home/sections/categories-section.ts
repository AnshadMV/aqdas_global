import { Component, ChangeDetectionStrategy, inject, signal, OnInit, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PremiumCategory {
  id: string;
  name: string;
  image: string;
  secondaryImage: string;
  description: string;
  metrics: string;
  badge: string;
}

@Component({
  selector: 'app-categories-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
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
      background: rgba(255, 255, 255, 0.52);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.04);
    }
    .glass-card-dark {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }
    .cat-btn {
      position: relative;
      min-width: 16rem;
      border: 1px solid rgba(255, 255, 255, 0.45);
      background: rgba(255, 255, 255, 0.38);
      transition: transform 0.35s ease, background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
    }
    .cat-btn::before {
      content: '';
      position: absolute;
      inset: auto 18% 0;
      height: 3px;
      border-radius: 999px 999px 0 0;
      background: #00a859;
      opacity: 0;
      transition: opacity 0.35s ease;
    }
    .cat-btn.active {
      background: rgba(255, 255, 255, 0.92);
      border-color: rgba(0, 168, 89, 0.2);
      box-shadow: 0 16px 35px rgba(0, 168, 89, 0.06);
      transform: translateY(-2px);
    }
    .cat-btn.active::before {
      opacity: 1;
    }
    .cat-btn:not(.active):hover {
      background: rgba(255, 255, 255, 0.58);
      border-color: rgba(0, 168, 89, 0.14);
    }
    .cat-btn.active .icon-circle {
      background: #00a859;
      color: white;
      border-color: #00a859;
      box-shadow: 0 4px 15px rgba(0, 168, 89, 0.25);
      transform: scale(1.05);
    }
    .img-wrapper {
      overflow: hidden;
      border-radius: 2rem;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .img-wrapper img {
      transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .img-wrapper:hover img {
      transform: scale(1.06);
    }
    .fade-scale-in {
      animation: fadeScaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .float-slow { animation: float 7s ease-in-out infinite; }
    .float-delayed { animation: float 8s ease-in-out infinite 1.5s; }
    @keyframes fadeScaleIn {
      from {
        opacity: 0;
        transform: scale(0.97) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @media (min-width: 1024px) {
      .cat-btn {
        min-width: 0;
      }
      .cat-btn::before {
        inset: 20% auto 20% 0;
        width: 4px;
        height: auto;
        border-radius: 0 4px 4px 0;
      }
      .cat-btn.active {
        transform: translateX(10px);
      }
      .cat-btn:not(.active):hover {
        transform: translateX(4px);
      }
    }
  `,
  template: `
    <section class="home-section relative bg-[#F8FAFC]">
      <div class="absolute inset-0 bg-noise opacity-[0.035] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient opacity-60"></div>
      <div class="absolute top-[-10%] right-[-5%] h-[60%] w-[45%] rounded-full bg-primary/10 blur-[130px] pointer-events-none mix-blend-multiply"></div>
      <div class="absolute bottom-[-10%] left-[-10%] h-[50%] w-[55%] rounded-full bg-accent/10 blur-[160px] pointer-events-none mix-blend-multiply"></div>

      <div class="aq-container relative z-10">
        <div class="home-section__header">
          <div class="home-section__eyebrow">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">Elite Spice Catalog</span>
          </div>
          <h2 class="home-section__title">
            Taste the <span class="relative inline-block">
              <span class="relative z-10 bg-gradient-to-r from-primary-dark via-primary to-accent-dark bg-clip-text text-transparent">Extraordinary</span>
              <svg class="absolute bottom-[-0.25rem] left-0 -z-10 h-3 w-full text-primary/20" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" fill="currentColor"/></svg>
            </span>
          </h2>
          <p class="home-section__copy">
            Every pinch of AQDAS reflects sustainable agriculture, organic handpicking, and meticulous grading from Kerala's spice estates.
          </p>
        </div>

        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-16" #categoriesContainer>
          <div class="hide-scrollbar relative z-20 flex w-full flex-row gap-4 overflow-x-auto pb-3 lg:col-span-5 lg:flex-col lg:overflow-visible lg:pb-0">
            <div class="absolute top-20 left-[-2rem] hidden h-32 w-32 rounded-full bg-primary/20 blur-[70px] pointer-events-none lg:block"></div>

            @for (category of displayCategories(); track category.id; let idx = $index) {
              <button
                class="cat-btn group relative shrink-0 rounded-[1.5rem] p-5 text-left sm:p-6"
                [class.active]="idx === activeIdx()"
                (click)="setActiveCategory(idx)"
                type="button"
              >
                <div class="relative z-10 flex items-center justify-between gap-4">
                  <div class="pr-2">
                    <span class="font-heading text-lg font-bold text-dark transition-colors duration-300 group-hover:text-primary sm:text-xl lg:text-2xl">{{ category.name }}</span>
                    <span class="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-dark-light/65 transition-colors group-hover:text-primary/75">
                      @if (idx === activeIdx()) { Active Showcase } @else { Explore Characteristics }
                    </span>
                  </div>
                  <div class="icon-circle flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dark/10 bg-white shadow-sm transition-all duration-300">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </div>
                </div>
              </button>
            }
          </div>

          <div class="relative flex h-[420px] w-full items-center justify-center sm:h-[520px] lg:col-span-7 lg:h-[650px] lg:justify-end">
            @for (category of displayCategories(); track category.id; let idx = $index) {
              @if (idx === activeIdx()) {
                <div class="fade-scale-in absolute inset-0 flex h-full w-full items-center justify-center lg:justify-end">
                  <div class="float-slow relative z-10 h-[84%] w-[92%] sm:w-[84%] lg:w-[88%]">
                    <div class="glass-card-premium relative h-full w-full rounded-[2.25rem] p-3 shadow-[0_25px_60px_rgba(15,23,42,0.06)]">
                      <div class="img-wrapper relative h-full w-full bg-slate-100">
                        <img [ngSrc]="category.image" fill class="object-cover" [alt]="category.name" priority />
                        <div class="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent"></div>
                      </div>

                      <div class="absolute right-7 bottom-7 left-7 flex flex-col items-start text-white">
                        <span class="mb-3 block rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-accent backdrop-blur-md">
                          {{ category.badge }}
                        </span>
                        <h3 class="mb-3 font-heading text-2xl font-bold leading-tight tracking-wide sm:text-3xl">{{ category.name }}</h3>
                        <p class="mb-6 max-w-md font-body text-sm leading-relaxed text-white/80">
                          {{ category.description }}
                        </p>

                        <div class="flex w-full items-center justify-between gap-4 border-t border-white/10 pt-5">
                          <span class="font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
                            {{ category.metrics }}
                          </span>
                          <a routerLink="/shop" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-dark shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white" aria-label="Shop category products">
                            <svg class="h-5 w-5 transition-transform duration-300 hover:-rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div class="glass-card-dark float-delayed absolute top-12 left-[-1rem] z-20 hidden flex-col items-center justify-center rounded-2xl px-5 py-4 shadow-2xl sm:flex">
                      <span class="font-heading text-2xl font-black leading-none text-white">100%</span>
                      <span class="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">Authentic</span>
                    </div>
                  </div>

                  <div class="float-delayed absolute bottom-[4%] left-[2%] z-0 hidden h-[46%] w-[52%] opacity-60 transition-opacity duration-300 hover:opacity-85 sm:block">
                    <div class="glass-card-premium relative h-full w-full rounded-[2rem] p-2 shadow-[0_15px_40px_rgba(0,0,0,0.05)]">
                      <div class="img-wrapper relative h-full w-full rounded-[1.5rem] bg-slate-200">
                        <img [ngSrc]="category.secondaryImage" fill class="object-cover opacity-90" [alt]="category.name + ' cultivation preview'" />
                        <div class="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CategoriesSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly categoriesContainer = viewChild<ElementRef>('categoriesContainer');

  readonly activeIdx = signal(0);
  readonly displayCategories = signal<PremiumCategory[]>([
    {
      id: '1',
      name: 'Premium Cardamom',
      image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
      secondaryImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      description: 'Sourced from the premium high-altitude valleys of Idukki and hand-sorted for bold size, rich color, and lasting aroma.',
      metrics: 'Camphor High | Moisture under 12%',
      badge: 'Bestseller Grade A',
    },
    {
      id: '2',
      name: 'Tellicherry Black Pepper',
      image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=800&q=80',
      secondaryImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      description: 'Hand-picked dried peppercorns with robust heat, citrus undertones, and the clean finish prized by serious cooks.',
      metrics: 'Piperine above 5.5% | Handpicked',
      badge: 'Sun Dried Natural',
    },
    {
      id: '3',
      name: 'True Ceylon Cinnamon',
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
      secondaryImage: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80',
      description: 'Paper-thin quills prepared by skilled local craftsmen with sweet woody notes and a naturally refined profile.',
      metrics: 'Low Coumarin | Artisanal Finish',
      badge: 'Organically Grown',
    },
    {
      id: '4',
      name: 'Aromatic Cloves',
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
      secondaryImage: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
      description: 'Legacy-estate clove buds harvested before bloom to preserve deep spice aroma and a rich essential-oil profile.',
      metrics: 'Eugenol above 18% | Plump Buds',
      badge: 'Aroma-Lock Sorted',
    },
  ]);

  constructor() {
    afterNextRender(() => {
      const el = this.categoriesContainer()?.nativeElement;
      if (el) {
        gsap.from(el.children, {
          y: 45,
          opacity: 0,
          duration: 1.1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      }
    });
  }

  ngOnInit(): void {
    this.productService.getCategories().subscribe({ next: () => void 0 });
  }

  setActiveCategory(idx: number): void {
    this.activeIdx.set(idx);
  }
}
