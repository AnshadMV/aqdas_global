import { Component, ChangeDetectionStrategy, afterNextRender, ElementRef, viewChild, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOME_CONTENT } from '../../../../environments/constants';

gsap.registerPlugin(ScrollTrigger);

interface GalleryItem {
  image: string;
  title: string;
  tag: string;
  desc: string;
}

@Component({
  selector: 'app-gallery-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  host: { 'class': 'block' },
  styles: `
    /* ─── Background ─── */
    .gallery-section {
      background: var(--theme-white);
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
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    @media (min-width: 640px) {
      .aq-container { padding: 5.5rem 2rem; }
    }

    @media (min-width: 1024px) {
      .aq-container { padding: 6.5rem 2.5rem; }
    }

    /* ─── Section Header ─── */
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
      max-width: 720px;
      width: 100%;
    }

    @media (min-width: 640px) { .section-header { margin-bottom: 3.5rem; } }
    @media (min-width: 1024px) { .section-header { margin-bottom: 4rem; } }

    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 20px;
      border-radius: 40px;
      border: 1px solid rgba(0,168,89,0.18);
      background: rgba(0,168,89,0.06);
      backdrop-filter: blur(8px);
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
      max-width: 560px;
      margin: 0 auto;
    }

    /* ─── Gallery Grid ─── */
    .gallery-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      width: 100%;
      max-width: 1200px;
      position: relative;
    }

    @media (min-width: 540px) {
      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
    }

    @media (min-width: 1024px) {
      .gallery-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.75rem;
      }
    }

    /* ─── Gallery Card ─── */
    .gallery-card {
      position: relative;
      cursor: pointer;
    }

    .card-inner {
      position: relative;
      width: 100%;
      border-radius: 2rem;
      overflow: hidden;
      background: color-mix(in srgb, var(--theme-white) 50%, transparent);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid color-mix(in srgb, var(--theme-white) 88%, transparent);
      box-shadow:
        0 4px 6px -2px rgba(0,0,0,0.04),
        0 12px 32px -8px rgba(0,0,0,0.07);
      padding: 0.625rem;
      transition: transform 0.5s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.5s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.4s ease;
    }

    .gallery-card:hover .card-inner {
      transform: translateY(-6px) scale(1.01);
      box-shadow:
        0 8px 16px -4px rgba(0,0,0,0.07),
        0 28px 56px -12px rgba(0,168,89,0.12);
      border-color: var(--theme-white);
    }

    /* Wide cards (index 1, 3) span 2 cols on lg */
    @media (min-width: 1024px) {
      .gallery-card--wide { grid-column: span 2; }
    }

    /* Image wrapper height */
    .img-wrap {
      position: relative;
      width: 100%;
      border-radius: 1.625rem;
      overflow: hidden;
      background: #e2e8f0;
    }

    .img-wrap--normal { height: 260px; }
    .img-wrap--wide   { height: 300px; }

    @media (min-width: 640px) {
      .img-wrap--normal { height: 280px; }
      .img-wrap--wide   { height: 320px; }
    }

    @media (min-width: 1024px) {
      .img-wrap--normal { height: 300px; }
      .img-wrap--wide   { height: 340px; }
    }

    /* Image zoom */
    .gallery-img {
      transition: transform 1.2s cubic-bezier(0.16,1,0.3,1);
    }

    .gallery-card:hover .gallery-img {
      transform: scale(1.08) rotate(0.4deg);
    }

    /* Gradient overlay */
    .img-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.18) 55%, transparent 100%);
      border-radius: inherit;
      pointer-events: none;
    }

    /* ─── Card Caption ─── */
    .card-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.25rem 1.375rem;
      z-index: 10;
      transform: translateY(4px);
      transition: transform 0.45s cubic-bezier(0.22,1,0.36,1);
    }

    .gallery-card:hover .card-caption {
      transform: translateY(0);
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      background: rgba(0,168,89,0.22);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,168,89,0.28);
      color: #86efac;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .card-title {
      font-size: clamp(1rem, 2vw, 1.2rem);
      font-weight: 700;
      letter-spacing: -0.01em;
      color: white;
      line-height: 1.25;
      margin-bottom: 0;
    }

    .card-desc {
      font-size: 0.78rem;
      line-height: 1.6;
      color: rgba(255,255,255,0.7);
      max-width: 380px;
      margin-top: 0.5rem;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.45s ease 0.05s,
                  transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s;
    }

    .gallery-card:hover .card-desc {
      opacity: 1;
      transform: translateY(0);
    }

    /* ─── Center Origin Badge ─── */
    .origin-badge {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 30;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 7rem;
      height: 7rem;
      border-radius: 50%;
      background: rgba(15,23,42,0.92);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 16px 48px -8px rgba(0,0,0,0.4);
      cursor: pointer;
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
      overflow: hidden;
    }

    @media (min-width: 1024px) {
      .origin-badge { display: flex; }
    }

    .origin-badge::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .origin-badge:hover::before { opacity: 1; }
    .origin-badge:hover { transform: translate(-50%,-50%) scale(1.08); }

    .origin-badge svg,
    .origin-badge span {
      position: relative;
      z-index: 1;
      transition: transform 0.3s ease;
    }

    .origin-badge:hover svg { transform: translateY(-2px); }

    .origin-label {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: white;
      margin-top: 4px;
    }
  `,
  template: `
    <section class="gallery-section">
      <!-- Ambient -->
      <div class="absolute inset-0 bg-noise opacity-[0.032] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient opacity-50"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-primary/8 blur-[160px] rounded-full pointer-events-none mix-blend-multiply"></div>

      <div class="aq-container">

        <!-- ── Header ── -->
        <div class="section-header" #galleryHeader>
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

        <!-- ── Gallery Grid ── -->
        <div class="gallery-grid" #galleryGrid>

          <!-- Center origin badge -->
          <div class="origin-badge">
            <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span class="origin-label">Origin<br>Story</span>
          </div>

          @for (item of galleryItems(); track item.title; let idx = $index) {
            <div
              class="gallery-card"
              [class.gallery-card--wide]="idx === 1 || idx === 3"
            >
              <div class="card-inner">
                <div
                  class="img-wrap"
                  [class.img-wrap--normal]="idx !== 1 && idx !== 3"
                  [class.img-wrap--wide]="idx === 1 || idx === 3"
                >
                  <img
                    [ngSrc]="item.image"
                    fill
                    class="gallery-img object-cover"
                    [alt]="item.title"
                    priority
                  />
                  <div class="img-gradient"></div>

                  <!-- Caption -->
                  <div class="card-caption">
                    <div class="tag-pill">{{ item.tag }}</div>
                    <h3 class="card-title">{{ item.title }}</h3>
                    <p class="card-desc">{{ item.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          }

        </div>
      </div>
    </section>
  `,
})
export class GallerySectionComponent {
  readonly galleryHeader = viewChild<ElementRef>('galleryHeader');
  readonly galleryGrid   = viewChild<ElementRef>('galleryGrid');

  readonly content = HOME_CONTENT.gallery;
  readonly galleryItems = signal<GalleryItem[]>(HOME_CONTENT.gallery.items);

  constructor() {
    afterNextRender(() => {
      const header = this.galleryHeader()?.nativeElement;
      const grid   = this.galleryGrid()?.nativeElement;

      if (header) {
        gsap.from(header.children, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      }

      if (grid) {
        gsap.from(grid.children, {
          scale: 0.96,
          y: 44,
          opacity: 0,
          duration: 1.0,
          stagger: 0.11,
          ease: 'power3.out',
          scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      }
    });
  }
}