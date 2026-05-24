import { Component, ChangeDetectionStrategy, inject, signal, OnInit, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOME_CONTENT } from '../../../../environments/constants';

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
    /* Modern Bento Grid Background */
    .bento-bg {
      background: linear-gradient(135deg, #0a0f1e 0%, #0f1625 50%, #0a0f1e 100%);
      position: relative;
    }

    .bento-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(0, 168, 89, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(255, 193, 7, 0.06) 0%, transparent 40%);
      pointer-events: none;
    }

    /* Animated Gradient Mesh */
    .gradient-mesh {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 30% 40%, rgba(0, 168, 89, 0.2), transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(255, 193, 7, 0.1), transparent 50%);
      filter: blur(80px);
      animation: mesh-flow 12s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes mesh-flow {
      0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
      50% { opacity: 0.6; transform: scale(1.05) rotate(2deg); }
    }

    /* Container - Centered with increased padding for gap */
    .aq-container {
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    
    @media (min-width: 640px) {
      .aq-container {
        padding-left: 2rem;
        padding-right: 2rem;
        padding-top: 2.5rem;
        padding-bottom: 2.5rem;
      }
    }
    
    @media (min-width: 1024px) {
      .aq-container {
        padding-left: 2.5rem;
        padding-right: 2.5rem;
        padding-top: 3rem;
        padding-bottom: 3rem;
      }
    }

    /* Modern Card Style - Left Panel */
    .categories-panel {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      overflow: hidden;
      padding: 16px 18px;
    }
    
    @media (min-width: 640px) {
      .categories-panel {
        padding: 20px 22px;
      }
    }

    /* Category Pills Design */
    .category-pill {
      background: transparent;
      border: none;
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      width: 100%;
      text-align: left;
      padding: 12px 16px !important;
    }

    .category-pill:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .category-pill.active {
      background: linear-gradient(135deg, rgba(0, 168, 89, 0.12), rgba(0, 168, 89, 0.06));
      border: 1px solid rgba(0, 168, 89, 0.25);
      padding: 11px 15px !important;
    }

    /* Number Badge */
    .number-badge {
      width: 32px;
      height: 32px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .category-pill.active .number-badge {
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light));
      color: white;
      box-shadow: 0 2px 10px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }

    /* Category Badge Text */
    .category-badge {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.4);
      transition: color 0.3s ease;
    }

    .category-pill.active .category-badge {
      color: var(--theme-primary-light);
    }

    /* Hero Card - Right Panel */
    .hero-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .hero-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.4);
    }

    /* Image Container */
    .image-container {
      position: relative;
      height: 240px;
      overflow: hidden;
    }
    
    @media (min-width: 768px) {
      .image-container {
        height: 280px;
      }
    }
    
    @media (min-width: 1024px) {
      .image-container {
        height: 320px;
      }
    }

    .image-container img {
      transition: transform 0.5s ease;
    }

    .hero-card:hover .image-container img {
      transform: scale(1.04);
    }

    /* Image Overlay */
    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(10, 15, 30, 0.95) 0%,
        rgba(10, 15, 30, 0.5) 40%,
        transparent 100%
      );
    }

    /* Premium Badge on Image */
    .premium-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 30px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #ffc107;
      z-index: 2;
    }

    .premium-badge::before {
      content: '★';
      font-size: 10px;
    }

    /* Content Overlay */
    .content-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px 20px 24px;
      z-index: 2;
    }

    @media (min-width: 640px) {
      .content-overlay {
        padding: 24px 24px 28px;
      }
    }

    @media (min-width: 1024px) {
      .content-overlay {
        padding: 28px 28px 32px;
      }
    }

    /* Title Styles */
    .category-title {
      font-size: 22px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 8px;
      color: white;
    }

    @media (min-width: 640px) {
      .category-title {
        font-size: 26px;
      }
    }

    @media (min-width: 1024px) {
      .category-title {
        font-size: 32px;
        margin-bottom: 10px;
      }
    }

    /* Description */
    .category-description {
      font-size: 12px;
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 14px;
      max-width: 90%;
    }

    @media (min-width: 640px) {
      .category-description {
        font-size: 12px;
        margin-bottom: 16px;
      }
    }

    @media (min-width: 1024px) {
      .category-description {
        font-size: 13px;
        margin-bottom: 18px;
        max-width: 85%;
      }
    }

    /* Metric Tags */
    .metric-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: color-mix(in srgb, var(--theme-primary) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 25%, transparent);
      border-radius: 30px;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: var(--theme-primary-light);
      transition: all 0.2s ease;
    }

    .metric-tag::before {
      content: '';
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--theme-primary-light);
      box-shadow: 0 0 4px var(--theme-primary-light);
    }

    /* Bottom Action Bar */
    .action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(10, 15, 30, 0.4);
    }

    @media (min-width: 640px) {
      .action-bar {
        padding: 16px 24px 18px;
      }
    }

    @media (min-width: 1024px) {
      .action-bar {
        padding: 18px 28px 20px;
      }
    }

    /* Secondary Image Preview */
    .secondary-preview {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      overflow: hidden;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      transition: transform 0.3s ease;
    }

    .secondary-preview:hover {
      transform: scale(1.04);
      border-color: rgba(0, 168, 89, 0.5);
    }

    @media (min-width: 640px) {
      .secondary-preview {
        width: 50px;
        height: 50px;
      }
    }

    /* Explore Text */
    .explore-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 2px;
    }

    .explore-count {
      font-size: 12px;
      font-weight: 700;
      color: white;
    }

    @media (min-width: 640px) {
      .explore-label {
        font-size: 10px;
      }
      .explore-count {
        font-size: 13px;
      }
    }

    /* CTA Button */
    .cta-button {
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 6px 14px color-mix(in srgb, var(--theme-primary) 25%, transparent);
    }

    .cta-button:hover {
      transform: scale(1.06);
      box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent);
    }

    .cta-button svg {
      width: 18px;
      height: 18px;
      transition: transform 0.3s ease;
    }

    .cta-button:hover svg {
      transform: translateX(2px);
    }

    @media (min-width: 640px) {
      .cta-button {
        width: 48px;
        height: 48px;
      }
      .cta-button svg {
        width: 20px;
        height: 20px;
      }
    }

    /* Floating Info Card */
    .floating-card {
      position: absolute;
      background: rgba(10, 15, 30, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 10px 16px;
      z-index: 10;
      animation: float 5s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .floating-card.delay-1 { animation-delay: 1s; }

    .stat-number {
      font-size: 26px;
      font-weight: 800;
      background: linear-gradient(135deg, #ffffff, var(--theme-primary-light));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      line-height: 1;
    }

    .stat-label {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 3px;
    }

    /* Quality Badge */
    .quality-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quality-icon {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      background: rgba(0, 168, 89, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quality-icon svg {
      width: 16px;
      height: 16px;
    }

    .quality-text {
      font-size: 10px;
      font-weight: 700;
      color: white;
    }

    .quality-subtext {
      font-size: 8px;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Section Header - with increased top margin for gap */
    .section-header {
      text-align: center;
      margin-bottom: 40px;
      margin-top: 20px;
    }

    @media (min-width: 640px) {
      .section-header {
        margin-bottom: 48px;
        margin-top: 28px;
      }
    }

    @media (min-width: 1024px) {
      .section-header {
        margin-bottom: 56px;
        margin-top: 36px;
      }
    }

    /* Elite Badge */
    .elite-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 168, 89, 0.1);
      border: 1px solid rgba(0, 168, 89, 0.2);
      border-radius: 40px;
      padding: 6px 16px;
      margin-bottom: 24px;
      margin-top: 8px;
    }

    @media (min-width: 640px) {
      .elite-badge {
        margin-bottom: 28px;
        margin-top: 12px;
        padding: 7px 18px;
      }
    }

    @media (min-width: 1024px) {
      .elite-badge {
        margin-bottom: 32px;
        margin-top: 16px;
        padding: 8px 20px;
      }
    }

    .elite-badge-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: var(--theme-primary-light);
    }

    /* Main Title */
    .main-title {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 14px;
      color: white;
    }

    @media (min-width: 640px) {
      .main-title {
        font-size: 44px;
      }
    }

    @media (min-width: 1024px) {
      .main-title {
        font-size: 56px;
        margin-bottom: 18px;
      }
    }

    .gradient-text {
      background: linear-gradient(135deg, #ffffff, var(--theme-primary-light), #ffc107);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    /* Subtitle */
    .subtitle {
      font-size: 13px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.6);
      max-width: 520px;
      margin: 0 auto;
    }

    @media (min-width: 640px) {
      .subtitle {
        font-size: 14px;
      }
    }

    /* Section Title inside panel */
    .panel-title {
      font-size: 18px;
      font-weight: 700;
      color: white;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    @media (min-width: 640px) {
      .panel-title {
        font-size: 20px;
        margin-bottom: 20px;
      }
    }

    /* Categories list spacing */
    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Hide floating cards on tablet/mobile */
    @media (max-width: 1023px) {
      .floating-card {
        display: none;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .premium-badge {
        padding: 4px 10px;
        font-size: 8px;
        top: 10px;
        right: 10px;
      }
      
      .metric-tag {
        padding: 3px 10px;
        font-size: 8px;
      }
      
      .number-badge {
        width: 28px;
        height: 28px;
        font-size: 12px;
        border-radius: 10px;
      }
      
      .category-pill {
        padding: 10px 12px !important;
      }
      
      .category-pill.active {
        padding: 9px 11px !important;
      }
    }

    /* Animation Classes */
    .fade-in-up {
      animation: fadeInUp 0.5s ease forwards;
    }
    .aq-container{
      margin-bottom: 60px;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  template: `
    <section class="bento-bg relative min-h-screen overflow-hidden">
      <!-- Animated Background -->
      <div class="gradient-mesh"></div>

      <div class="aq-container relative z-10">
        <!-- Section Header with gap between section border and elite-badge -->
        <div class="section-header">
          <div class="elite-badge">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            </span>
            <span class="elite-badge-text">{{ content.eyebrow }}</span>
          </div>

          <h1 class="main-title">
            {{ content.title.main }} <span class="gradient-text">{{ content.title.accent }}</span>
          </h1>

          <p class="subtitle">
            {{ content.subtitle }}
          </p>
        </div>

        <!-- Main 2-Column Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8" #categoriesContainer>
          
          <!-- Left Panel - Categories List -->
          <div class="lg:col-span-5 xl:col-span-4">
            <div class="categories-panel">
              <h2 class="panel-title">{{ content.panelTitle }}</h2>

              <div class="categories-list">
                @for (category of displayCategories(); track category.id; let idx = $index) {
                  <button
                     class="category-pill flex items-center gap-3 rounded-xl"
                    [class.active]="idx === activeIdx()"
                    (click)="setActiveCategory(idx)"
                    type="button"
                  >
                    <div class="number-badge">
                      {{ idx + 1 }}
                    </div>

                    <div class="flex-1">
                      <h3 class="font-semibold text-white text-sm sm:text-base mb-0.5">
                        {{ category.name }}
                      </h3>
                      <span class="category-badge text-[9px] uppercase tracking-wider">
                        {{ category.badge }}
                      </span>
                    </div>

                    <svg 
                      class="w-3.5 h-3.5 transition-transform duration-300"
                      [class]="idx === activeIdx() ? 'text-primary rotate-0' : 'text-white/20 -rotate-90'"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Right Panel - Hero Display -->
          <div class="lg:col-span-7 xl:col-span-8">
            <div class="relative">
              @for (category of displayCategories(); track category.id; let idx = $index) {
                @if (idx === activeIdx()) {
                  <div class="hero-card fade-in-up">
                    <!-- Image Section -->
                    <div class="image-container relative">
                      <img 
                        [ngSrc]="category.image" 
                        fill 
                        class="object-cover" 
                        [alt]="category.name"
                        priority
                      />
                      <div class="image-overlay"></div>
                      
                      <!-- Premium Badge -->
                      <div class="premium-badge">
                        {{ category.badge }}
                      </div>

                      <!-- Content Overlay -->
                      <div class="content-overlay">
                        <h2 class="category-title">{{ category.name }}</h2>
                        <p class="category-description">
                          {{ category.description }}
                        </p>
                        <div class="flex flex-wrap gap-2">
                          @for (metric of category.metrics.split('|'); track metric) {
                            <span class="metric-tag">
                              {{ metric.trim() }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Action Bar -->
                    <div class="action-bar">
                      <div class="flex items-center gap-3">
                        <!-- Secondary Image Preview -->
                        <div class="secondary-preview">
                          <img 
                            [ngSrc]="category.secondaryImage" 
                            fill 
                            class="object-cover" 
                            [alt]="category.name + ' preview'"
                          />
                        </div>

                        <div>
                          <p class="explore-label">EXPLORE MORE</p>
                          <p class="explore-count">{{ displayCategories().length - 1 }} other varieties</p>
                        </div>
                      </div>

                      <!-- CTA Button -->
                      <a routerLink="/shop" class="cta-button" aria-label="Shop this category">
                        <svg class="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                      </a>
                    </div>

                    <!-- Floating Info Cards (Desktop) -->
                    <div class="floating-card top-4 left-4 hidden xl:block">
                      <div class="stat-number">100%</div>
                      <div class="stat-label">AUTHENTIC</div>
                    </div>

                    <div class="floating-card delay-1 bottom-30 right-4 hidden xl:block">
                      <div class="quality-badge">
                        <div class="quality-icon">
                          <svg class="text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <div>
                          <div class="quality-text">Quality Assured</div>
                          <div class="quality-subtext">Lab Tested</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CategoriesSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly categoriesContainer = viewChild<ElementRef>('categoriesContainer');

  readonly content = HOME_CONTENT.categories;
  readonly activeIdx = signal(0);
  readonly displayCategories = signal<PremiumCategory[]>(HOME_CONTENT.categories.categories);

  constructor() {
    afterNextRender(() => {
      const el = this.categoriesContainer()?.nativeElement;
      if (el) {
        gsap.from(el.children, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
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