import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  ElementRef,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOME_CONTENT } from '../../../../environments/constants';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { class: 'block' },

  styles: `
    /* ─── Background & Ambient ─── */
    .about-section {
      background: linear-gradient(160deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 45%, var(--theme-cream) 100%);
      position: relative;
      overflow: hidden;
    }

    .about-bg-blob-a {
      position: absolute;
      top: -8%;
      left: -12%;
      width: 55%;
      height: 55%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,168,89,0.09), transparent 70%);
      filter: blur(80px);
      pointer-events: none;
      animation: blob-drift-a 16s ease-in-out infinite;
    }

    .about-bg-blob-b {
      position: absolute;
      bottom: -10%;
      right: -8%;
      width: 50%;
      height: 50%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%);
      filter: blur(100px);
      pointer-events: none;
      animation: blob-drift-b 18s ease-in-out infinite 2s;
    }

    @keyframes blob-drift-a {
      0%, 100% { transform: translate(0,0) scale(1); }
      50%       { transform: translate(2%,3%) scale(1.04); }
    }

    @keyframes blob-drift-b {
      0%, 100% { transform: translate(0,0) scale(1); }
      50%       { transform: translate(-2%,-3%) scale(1.04); }
    }

    .about-grid-bg {
      position: absolute;
      inset: 0;
      background-size: 44px 44px;
      background-image:
        linear-gradient(to right, rgba(0,168,89,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,168,89,0.03) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
      pointer-events: none;
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

    @media (min-width: 640px) {
      .aq-container { padding: 5.5rem 2rem; }
    }

    @media (min-width: 1024px) {
      .aq-container { padding: 6.5rem 2.5rem; }
    }

    /* ─── Two-Column Layout ─── */
    .about-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: center;
    }

    @media (min-width: 1024px) {
      .about-layout {
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
      }
    }

    /* ─── Left: Text Side ─── */
    .about-text-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    /* Eyebrow */
    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,168,89,0.07);
      border: 1px solid rgba(0,168,89,0.18);
      border-radius: 40px;
      padding: 7px 18px;
      margin-bottom: 1.5rem;
      transition: border-color 0.3s ease, background 0.3s ease;
    }

    @media (min-width: 640px) {
      .eyebrow-badge { margin-bottom: 1.75rem; }
    }

    .eyebrow-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: var(--theme-primary);
      text-transform: uppercase;
    }

    /* Heading */
    .about-heading {
      font-size: clamp(2rem, 4.5vw, 3.2rem);
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.02em;
      color: var(--theme-dark);
      margin-bottom: 1.25rem;
      max-width: 13ch;
    }

    .heading-line-accent {
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark), #f59e0b);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .heading-line-italic {
      font-style: italic;
      font-weight: 300;
      color: var(--theme-dark-light);
    }

    /* Subtitle bar */
    .about-intro {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 2.25rem;
      max-width: 520px;
    }

    .intro-bar {
      width: 4px;
      min-height: 100%;
      border-radius: 4px;
      background: linear-gradient(to bottom, var(--theme-primary), #f59e0b);
      flex-shrink: 0;
      align-self: stretch;
    }

    .about-subtitle {
      font-size: clamp(14px, 1.5vw, 15px);
      line-height: 1.7;
      color: var(--theme-dark-light);
    }

    /* ─── Steps / Heritage Points ─── */
    .heritage-steps {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2.5rem;
      width: 100%;
      max-width: 520px;
    }

    .heritage-step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.125rem 1.25rem;
      background: color-mix(in srgb, var(--theme-white) 70%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0,168,89,0.1);
      border-radius: 1.125rem;
      transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
      cursor: default;
    }

    .heritage-step:hover {
      background: color-mix(in srgb, var(--theme-white) 95%, transparent);
      border-color: rgba(0,168,89,0.22);
      transform: translateX(4px);
      box-shadow: 0 8px 24px -8px rgba(0,168,89,0.12);
    }

    .step-num {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 18%, transparent);
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--theme-primary);
      letter-spacing: 0.02em;
      flex-shrink: 0;
      transition: background 0.3s ease;
    }

    .heritage-step:hover .step-num {
      background: color-mix(in srgb, var(--theme-primary) 16%, transparent);
    }

    .step-content {}

    .step-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--theme-dark);
      margin-bottom: 0.3rem;
      letter-spacing: -0.01em;
    }

    .step-desc {
      font-size: 0.8rem;
      line-height: 1.6;
      color: var(--theme-dark-light);
    }

    /* ─── CTA Buttons ─── */
    .about-cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.875rem;
      align-items: center;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.875rem;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      border: 1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent);
      border-radius: 1.125rem;
      padding: 0.875rem 1.75rem;
      color: white;
      font-weight: 700;
      font-size: 0.875rem;
      letter-spacing: 0.01em;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
      box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--theme-primary) 35%, transparent);
      position: relative;
      overflow: hidden;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: -60%;
      left: -60%;
      width: 28%;
      height: 200%;
      background: rgba(255,255,255,0.2);
      transform: rotate(30deg);
      transition: none;
    }

    .btn-primary:hover::before {
      left: 150%;
      transition: left 1.1s cubic-bezier(0.19,1,0.22,1);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px -8px rgba(0,168,89,0.4);
    }

    .btn-arrow-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.25);
      transition: background 0.3s ease;
    }

    .btn-primary:hover .btn-arrow-wrap {
      background: rgba(255,255,255,0.28);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--theme-dark);
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      padding: 0.875rem 0.25rem;
      transition: gap 0.3s ease, color 0.2s ease;
    }

    .btn-secondary:hover {
      color: var(--theme-primary);
      gap: 0.75rem;
    }

    .btn-secondary svg {
      transition: transform 0.3s ease;
    }

    .btn-secondary:hover svg {
      transform: translateX(3px);
    }

    /* ─── Right: Image Side ─── */
    .about-image-col {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-frame {
      position: relative;
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
    }

    @media (min-width: 1024px) {
      .image-frame { max-width: 520px; }
    }

    /* Main large image */
    .img-main-wrap {
      position: relative;
      width: 88%;
      aspect-ratio: 4/5;
      border-radius: 2.25rem;
      overflow: hidden;
      margin-left: auto;
      box-shadow: 0 24px 64px -16px rgba(0,0,0,0.14);
      border: 6px solid color-mix(in srgb, var(--theme-white) 90%, transparent);
    }

    .img-main-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(15,23,42,0.55) 100%);
      pointer-events: none;
    }

    /* Secondary floating image */
    .img-secondary-wrap {
      position: absolute;
      bottom: -1.5rem;
      left: 0;
      width: 48%;
      aspect-ratio: 1;
      border-radius: 1.75rem;
      overflow: hidden;
      border: 5px solid color-mix(in srgb, var(--theme-white) 92%, transparent);
      box-shadow: 0 16px 40px -10px rgba(0,0,0,0.14);
      animation: float-secondary 9s ease-in-out infinite 1s;
    }

    .img-secondary-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15,23,42,0.6), transparent 60%);
      pointer-events: none;
    }

    @keyframes float-secondary {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    /* Image caption */
    .img-caption {
      position: absolute;
      bottom: 0.75rem;
      left: 0;
      right: 0;
      padding: 0 1rem;
      z-index: 2;
    }

    .img-caption-label {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(245,158,11,0.9);
      display: block;
      margin-bottom: 2px;
    }

    .img-caption-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: white;
      line-height: 1.3;
    }

    /* Years badge */
    .years-badge {
      position: absolute;
      top: 1.25rem;
      left: 0.25rem;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 5.5rem;
      height: 5.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      border: 3px solid rgba(255,255,255,0.15);
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      animation: float-badge 7s ease-in-out infinite 0.5s;
    }

    @keyframes float-badge {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50%       { transform: translateY(-6px) rotate(3deg); }
    }

    .years-num {
      font-size: 1.5rem;
      font-weight: 900;
      color: white;
      line-height: 1;
    }

    .years-suffix {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--theme-primary);
      line-height: 1;
    }

    .years-label {
      font-size: 0.45rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      text-align: center;
      margin-top: 2px;
    }

    /* Certified chip */
    .certified-chip {
      position: absolute;
      top: 1.5rem;
      right: 0.5rem;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: color-mix(in srgb, var(--theme-white) 90%, transparent);
      backdrop-filter: blur(12px);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent);
      border-radius: 0.875rem;
      padding: 0.5rem 0.875rem 0.5rem 0.5rem;
      box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--theme-primary) 15%, transparent);
      animation: float-chip 8s ease-in-out infinite 2s;
    }

    @keyframes float-chip {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }

    .certified-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      flex-shrink: 0;
    }

    .certified-label {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .certified-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--theme-dark);
      line-height: 1;
    }

    .certified-sub {
      font-size: 0.58rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* Stat chips row */
    .stats-row {
      display: flex;
      align-items: stretch;
      gap: 0.75rem;
      margin-top: 2rem;
      max-width: 520px;
    }

    @media (min-width: 640px) {
      .stats-row { margin-top: 2.5rem; }
    }

    .stat-chip {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 0.875rem 0.5rem;
      background: color-mix(in srgb, var(--theme-white) 75%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 10%, transparent);
      border-radius: 1rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .stat-chip:hover {
      background: color-mix(in srgb, var(--theme-white) 95%, transparent);
      border-color: color-mix(in srgb, var(--theme-primary) 20%, transparent);
      transform: translateY(-2px);
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--theme-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--theme-dark-light);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
  `,

  template: `
    <section class="about-section">
      <div class="about-bg-blob-a"></div>
      <div class="about-bg-blob-b"></div>
      <div class="about-grid-bg"></div>

      <div class="aq-container">
        <div class="about-layout" #aboutLayout>

          <!-- ── LEFT: TEXT ── -->
          <div class="about-text-col" #aboutText>

            <!-- Eyebrow -->
            <div class="eyebrow-badge">
              <span class="relative flex h-[7px] w-[7px]">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span class="relative inline-flex h-[7px] w-[7px] rounded-full bg-primary"></span>
              </span>
              <span class="eyebrow-text">{{ content.eyebrow }}</span>
            </div>

            <!-- Heading -->
            <h2 class="about-heading">
              {{ content.title.line1 }}
              <span class="heading-line-italic">{{ content.title.italicPart }}</span><br>
              <span class="heading-line-accent">{{ content.title.accentPart }}</span>
            </h2>

            <!-- Subtitle -->
            <div class="about-intro">
              <div class="intro-bar"></div>
              <p class="about-subtitle">
                {{ content.subtitle }}
              </p>
            </div>

            <!-- Heritage Steps -->
            <div class="heritage-steps">
              @for (step of content.steps; track step.num) {
                <div class="heritage-step">
                  <div class="step-num">{{ step.num }}</div>
                  <div class="step-content">
                    <div class="step-title">{{ step.title }}</div>
                    <div class="step-desc">
                      {{ step.desc }}
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Stats -->
            <div class="stats-row">
              @for (stat of content.stats; track stat.label) {
                <div class="stat-chip">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              }
            </div>

            <!-- CTAs -->
            <div class="about-cta-row" style="margin-top:2.25rem;">
              <a [routerLink]="content.primaryCta.link" class="btn-primary">
                <span>{{ content.primaryCta.text }}</span>
                <div class="btn-arrow-wrap">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </div>
              </a>

              <a [routerLink]="content.secondaryCta.link" class="btn-secondary">
                <span>{{ content.secondaryCta.text }}</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- ── RIGHT: IMAGES ── -->
          <div class="about-image-col" #aboutImages>
            <div class="image-frame">

              <!-- Years Badge -->
              <div class="years-badge">
                <span class="years-num">{{ content.yearsBadge.num }}</span>
                <span class="years-suffix">{{ content.yearsBadge.suffix }}</span>
                <span class="years-label" style="white-space: pre-line;">{{ content.yearsBadge.label }}</span>
              </div>

              <!-- Certified Chip -->
              <div class="certified-chip">
                <div class="certified-icon">
                  <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <div class="certified-label">
                  <span class="certified-title">{{ content.certifiedChip.title }}</span>
                  <span class="certified-sub">{{ content.certifiedChip.subtitle }}</span>
                </div>
              </div>

              <!-- Main Image -->
              <div class="img-main-wrap">
                <img
                  [ngSrc]="content.mainImage.image"
                  fill
                  class="object-cover"
                  [alt]="content.mainImage.captionTitle"
                  priority
                />
                <div class="img-caption">
                  <span class="img-caption-label">{{ content.mainImage.captionLabel }}</span>
                  <span class="img-caption-title">{{ content.mainImage.captionTitle }}</span>
                </div>
              </div>

              <!-- Secondary Floating Image -->
              <div class="img-secondary-wrap">
                <img
                  [ngSrc]="content.secondaryImage.image"
                  fill
                  class="object-cover"
                  [alt]="content.secondaryImage.captionTitle"
                  priority
                />
                <div class="img-caption" style="bottom:0.625rem;">
                  <span class="img-caption-label">{{ content.secondaryImage.captionLabel }}</span>
                  <span class="img-caption-title" style="font-size:0.75rem;">{{ content.secondaryImage.captionTitle }}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  `,
})
export class AboutSectionComponent {
  readonly aboutText   = viewChild<ElementRef>('aboutText');
  readonly aboutImages = viewChild<ElementRef>('aboutImages');
  readonly content = HOME_CONTENT.about;

  constructor() {
    afterNextRender(() => this.animate());
  }

  private animate(): void {
    const textEl   = this.aboutText()?.nativeElement;
    const imagesEl = this.aboutImages()?.nativeElement;

    if (textEl) {
      gsap.from(textEl.children, {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: textEl,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    if (imagesEl) {
      gsap.from(imagesEl.children, {
        opacity: 0,
        scale: 0.96,
        y: 22,
        duration: 1.1,
        delay: 0.15,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: imagesEl,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });
    }
  }
}