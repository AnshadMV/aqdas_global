import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  ElementRef,
  viewChild,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import gsap from 'gsap';
import { ProductService } from '../../../core/services';
import { HOME_CONTENT } from '../../../../environments/constants';

@Component({
  selector: 'app-hero-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { class: 'block' },
  styles: `
    /* ─── Background & Ambient ─── */
    .hero-section {
      background: linear-gradient(180deg, var(--theme-secondary) 0%, var(--theme-cream) 100%);
      position: relative;
      overflow: hidden;
      min-height: 88vh;
      display: flex;
      align-items: center;
    }
.hero-benefits, .benefit-item {
  opacity: 1;
}
    .hero-blob-1 {
      position: absolute; top: -10%; left: -10%; width: 50%; height: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 12%, transparent), transparent 70%);
      filter: blur(110px); pointer-events: none;
    }

    .hero-blob-2 {
      position: absolute; bottom: -10%; right: -10%; width: 55%; height: 55%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent-dark) 10%, transparent), transparent 70%);
      filter: blur(130px); pointer-events: none;
    }

    .hero-noise {
      position: absolute; inset: 0; opacity: 0.03; pointer-events: none; mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .hero-grid-bg {
      position: absolute; inset: 0; pointer-events: none;
      background-size: 42px 42px;
      background-image:
        linear-gradient(to right, color-mix(in srgb, var(--theme-primary) 3.5%, transparent) 1px, transparent 1px),
        linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 3.5%, transparent) 1px, transparent 1px);
      mask-image: radial-gradient(circle at center, black, transparent 85%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 85%);
    }

    /* ─── Container ─── */
    .hero-container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 5rem 1.5rem;
      position: relative;
      z-index: 10;
      width: 100%;
    }

    @media (min-width: 640px) { .hero-container { padding: 6rem 2rem; } }
    @media (min-width: 1024px) { .hero-container { padding: 7rem 2.5rem; } }

    .hero-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 4rem;
      align-items: center;
    }

    @media (min-width: 1024px) {
      .hero-layout {
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
      }
    }

    /* ─── Left: Text Side ─── */
    .hero-text-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: color-mix(in srgb, var(--theme-primary) 5%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent);
      border-radius: 100px;
      padding: 0.5rem 1rem;
      margin-bottom: 2rem;
      backdrop-filter: blur(8px);
      transition: border-color 0.3s ease;
    }
    .hero-eyebrow:hover { border-color: color-mix(in srgb, var(--theme-primary) 40%, transparent); }

    .ping-wrap { position: relative; display: flex; width: 8px; height: 8px; }
    .ping-dot {
      position: absolute; inset: 0; border-radius: 50%; background: var(--theme-primary); opacity: 0.75;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .ping-solid { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--theme-primary); }
    @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }

    .eyebrow-label {
      font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--theme-primary);
    }

    .hero-heading {
      font-size: clamp(2.5rem, 6vw, 4.2rem);
      font-weight: 800;
      line-height: 1.02;
      letter-spacing: -0.02em;
      color: var(--theme-dark);
      margin-bottom: 2.5rem;
      max-width: 12ch;
      text-wrap: balance;
    }

    .heading-italic { font-style: italic; font-weight: 300; color: color-mix(in srgb, var(--theme-dark) 75%, transparent); margin-right: 0.5rem; }

    .heading-accent-wrap { position: relative; display: inline-block; padding-bottom: 0.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
    .heading-accent-text {
      background: linear-gradient(90deg, var(--theme-primary-dark), var(--theme-primary), var(--theme-accent-dark));
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .heading-underline {
      position: absolute; bottom: -0.2rem; left: 0; width: 100%; height: 0.75rem; z-index: -1; color: color-mix(in srgb, var(--theme-primary) 20%, transparent);
    }

    .hero-subtitle-wrap {
      display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 2.5rem; max-width: 600px; width: 100%;
    }
    .subtitle-bar {
      width: 6px; min-height: 100%; border-radius: 6px; background: linear-gradient(to bottom, var(--theme-primary), var(--theme-accent-dark)); flex-shrink: 0; margin-top: 4px;
    }
    .hero-subtitle {
      font-size: clamp(15px, 1.5vw, 16px); line-height: 1.7; color: var(--theme-dark-light);
    }

    /* Benefits */
    .hero-benefits {
      display: grid; grid-template-columns: 1fr; gap: 1.25rem; width: 100%; max-width: 500px; margin-bottom: 2.5rem;
    }
    @media (min-width: 640px) { .hero-benefits { grid-template-columns: 1fr 1fr; } }

    .benefit-item { display: flex; align-items: center; gap: 0.75rem; font-size: 13px; font-weight: 600; color: color-mix(in srgb, var(--theme-dark) 85%, transparent); }
    .benefit-icon {
      width: 20px; height: 20px; border-radius: 50%; background: color-mix(in srgb, var(--theme-primary) 10%, transparent); color: var(--theme-primary);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    /* CTAs */
    .hero-ctas {
      display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; width: 100%; margin-bottom: 3rem;
    }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 1rem;
      background: linear-gradient(90deg, var(--theme-primary), var(--theme-primary-dark));
      border: 1px solid color-mix(in srgb, var(--theme-primary-dark) 10%, transparent); border-radius: 1rem;
      padding: 0.875rem 1.75rem; color: #fff; font-weight: 600; font-size: 0.875rem; letter-spacing: 0.02em;
      text-decoration: none; box-shadow: 0 10px 30px color-mix(in srgb, var(--theme-primary) 25%, transparent);
      transition: all 0.3s ease; position: relative; overflow: hidden;
    }
    .btn-primary::after {
      content: ''; position: absolute; top: -50%; left: -60%; width: 30%; height: 200%;
      background: rgba(255,255,255,0.25); transform: rotate(30deg); transition: none;
    }
    .btn-primary:hover::after { left: 150%; transition: left 1.2s cubic-bezier(0.19, 1, 0.22, 1); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 40px color-mix(in srgb, var(--theme-primary) 35%, transparent); }

    .btn-arrow {
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center; transition: background 0.3s;
    }
    .btn-primary:hover .btn-arrow { background: rgba(255,255,255,0.25); }

    .btn-secondary {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.25rem;
      color: var(--theme-dark); font-weight: 600; font-size: 0.875rem; text-decoration: none; transition: gap 0.3s, color 0.2s;
    }
    .btn-secondary:hover { color: var(--theme-primary); gap: 0.75rem; }
    .btn-secondary svg { transition: transform 0.3s; }
    .btn-secondary:hover svg { transform: translateX(4px); }

    /* Social Proof */
    .hero-social {
      display: flex; flex-wrap: wrap; align-items: center; gap: 1rem;
    }
    .avatar-stack { display: flex; }
    .avatar-stack img {
      width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--theme-cream); object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-left: -12px;
    }
    .avatar-stack img:first-child { margin-left: 0; }

    .social-info { display: flex; flex-direction: column; gap: 2px; }
    .stars-row { display: flex; align-items: center; gap: 4px; color: #f59e0b; }
    .rating-text { font-size: 12px; font-weight: 800; color: var(--theme-dark); margin-left: 6px; }
    .social-subtext { font-size: 12px; font-weight: 600; color: color-mix(in srgb, var(--theme-dark) 60%, transparent); }

    /* ─── Right: Visual Side ─── */
    .hero-visual-col {
      position: relative; display: flex; align-items: center; justify-content: center; width: 100%;
    }

    .visual-frame {
      position: relative; width: 100%; max-width: 520px; height: 540px; margin: 0 auto;
    }
    @media (max-width: 1024px) { .visual-frame { height: 440px; } }
    @media (max-width: 640px) { .visual-frame { height: 360px; } }

    .visual-glow {
      position: absolute; width: 78%; height: 78%; border-radius: 50%;
      background: linear-gradient(to top right, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-accent-dark) 10%, transparent));
      filter: blur(70px); pointer-events: none; z-index: 0;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
    }

    .visual-orbit {
      position: absolute; width: 78%; height: 78%; border-radius: 50%;
      border: 1px solid color-mix(in srgb, var(--theme-primary) 10%, transparent); top: 50%; left: 50%; transform: translate(-50%, -50%);
      display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0;
      animation: spin-slow 40s linear infinite;
    }
    .visual-orbit-inner {
      width: 84%; height: 84%; border-radius: 50%; border: 1px dashed color-mix(in srgb, var(--theme-accent-dark) 20%, transparent);
    }
    @keyframes spin-slow { 100% { transform: translate(-50%, -50%) rotate(360deg); } }

    /* Glass Cards */
    .glass-card {
      position: absolute; background: color-mix(in srgb, var(--theme-cream) 42%, transparent); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid color-mix(in srgb, var(--theme-cream) 75%, transparent); box-shadow: 0 10px 30px color-mix(in srgb, var(--theme-dark) 5%, transparent), inset 0 1px 3px color-mix(in srgb, var(--theme-cream) 35%, transparent);
      border-radius: 2rem; padding: 0.5rem; overflow: hidden; transition: transform 0.7s ease;
    }
    .glass-card:hover { transform: scale(1.02); }

    .card-img-wrap {
      position: relative; width: 100%; height: 100%; border-radius: 1.6rem; overflow: hidden; background: #e2e8f0;
    }
    .card-img {
      width: 100%; height: 100%; object-fit: cover; transition: transform 2s ease-out;
    }
    .glass-card:hover .card-img { transform: scale(1.08); }
    .card-overlay {
      position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.75), transparent 60%); pointer-events: none;
    }

    .card-content { position: absolute; bottom: 1rem; left: 1rem; right: 1rem; z-index: 2; }
    .card-label { font-size: 8px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--theme-accent-dark); display: block; margin-bottom: 4px; }
    .card-title { font-size: 1rem; font-weight: 800; color: #fff; line-height: 1.2; }
    .card-subtitle { font-size: 11px; font-weight: 300; color: color-mix(in srgb, var(--theme-dark) 80%, transparent); margin-top: 4px; }

    /* Specific Card Positions & Animations */
    .card-main {
      top: 5%; right: 3%; width: 68%; height: 66%; z-index: 10;
      animation: float-primary 8s ease-in-out infinite;
    }
    .card-main .card-label { color: rgba(255,255,255,0.6); }
    .card-main .card-title { font-size: 1.25rem; }

    .card-secondary {
      bottom: 6%; left: 1%; width: 50%; height: 40%; z-index: 20;
      animation: float-secondary 9s ease-in-out infinite 1s;
    }

    @keyframes float-primary {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(1deg); }
    }
    @keyframes float-secondary {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-12px) rotate(-1deg); }
    }

    .card-action-btn {
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: #fff;
      cursor: pointer; transition: background 0.3s;
    }
    .card-action-btn:hover { background: var(--theme-primary); }

    /* Floating Badges */
    .badge-offer {
      position: absolute; top: 18%; right: 1%; z-index: 30;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--theme-cream) 95%, transparent); backdrop-filter: blur(12px);
      border: 1px solid var(--theme-cream); border-radius: 1rem; padding: 0.75rem 1rem;
      box-shadow: 0 15px 40px color-mix(in srgb, var(--theme-dark) 8%, transparent);
      animation: float-badge 7s ease-in-out infinite 0.5s;
    }
    .badge-offer-check {
      position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%;
      background: var(--theme-accent-dark); display: flex; align-items: center; justify-content: center; color: #fff;
      box-shadow: 0 4px 8px color-mix(in srgb, var(--theme-accent-dark) 40%, transparent);
    }
    .badge-offer-label { font-size: 8px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--theme-primary); margin-bottom: 2px; }
    .badge-offer-value { font-size: 1.5rem; font-weight: 900; color: var(--theme-dark); line-height: 1; }
    .badge-offer-suffix { font-size: 0.75rem; font-weight: 800; color: var(--theme-dark-light); }
    .badge-offer-sub { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: color-mix(in srgb, var(--theme-dark) 50%, transparent); margin-top: 4px; }

    .badge-cert {
      position: absolute; right: 3%; bottom: 18%; z-index: 30;
      display: flex; align-items: center; gap: 0.75rem;
      background: rgba(15,23,42,0.8); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 0.75rem;
      box-shadow: 0 15px 40px rgba(0,0,0,0.15); color: #fff;
      transition: background 0.3s;
    }
    .badge-cert:hover { background: rgba(15,23,42,0.95); }
    .badge-cert-icon {
      width: 32px; height: 32px; border-radius: 0.5rem; background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .badge-cert-title { font-size: 0.875rem; font-weight: 800; line-height: 1.2; }
    .badge-cert-sub { font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.6); }

    @keyframes float-badge {
      0%, 100% { transform: translateY(0) rotate(5deg); }
      50% { transform: translateY(-6px) rotate(7deg); }
    }

    /* Sparkles */
    .sparkle {
      position: absolute; width: 40px; height: 40px; border-radius: 50%;
      background: color-mix(in srgb, var(--theme-cream) 80%, transparent); backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--theme-cream) 90%, transparent); box-shadow: 0 8px 20px rgba(0,0,0,0.05);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 800; color: color-mix(in srgb, var(--theme-primary) 70%, transparent);
      z-index: 20;
    }
    .sparkle-1 { top: 18%; left: 8%; animation: float-badge 7s ease-in-out infinite; }
    .sparkle-2 { bottom: 5%; right: 42%; width: 32px; height: 32px; animation: float-primary 8s ease-in-out infinite 1.5s; }
  `,
  template: `
    <section class="hero-section">
      <div class="hero-blob-1"></div>
      <div class="hero-blob-2"></div>
      <div class="hero-noise"></div>
      <div class="hero-grid-bg"></div>

      <div class="hero-container">
        <div class="hero-layout">
          
          <!-- ── LEFT: TEXT ── -->
          <div class="hero-text-col" #heroText>
            <div class="hero-eyebrow">
              <span class="ping-wrap">
                <span class="ping-dot"></span>
                <span class="ping-solid"></span>
              </span>
              <span class="eyebrow-label">{{ content.eyebrow }}</span>
            </div>

            <h1 class="hero-heading">
              {{ content.title.line1 }} <br>
              <span class="heading-italic">{{ content.title.italicPart }}</span>
              <span class="heading-accent-wrap">
                <span class="heading-accent-text">{{ content.title.accentPart }}</span>
                <svg class="heading-underline" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                </svg>
              </span>
            </h1>

            <div class="hero-subtitle-wrap">
              <div class="subtitle-bar"></div>
              <p class="hero-subtitle">{{ heroSubtitle() }}</p>
            </div>

            <div class="hero-benefits">
              @for (benefit of benefits; track benefit) {
                <div class="benefit-item">
                  <span class="benefit-icon">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{{ benefit }}</span>
                </div>
              }
            </div>

            <div class="hero-ctas">
              <a [routerLink]="content.primaryCta.link" class="btn-primary">
                <span>{{ content.primaryCta.text }}</span>
                <div class="btn-arrow">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
              <a [routerLink]="content.secondaryCta.link" class="btn-secondary">
                <span>{{ content.secondaryCta.text }}</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div class="hero-social">
              <div class="avatar-stack">
                @for (avatar of content.socialProof.avatars; track avatar) {
                  <img [src]="avatar" alt="Reviewer avatar" />
                }
              </div>
              <div class="social-info">
                <div class="stars-row">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03 4a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  }
                  <span class="rating-text">{{ content.socialProof.rating }}</span>
                </div>
                <p class="social-subtext">{{ content.socialProof.label }}</p>
              </div>
            </div>
          </div>

          <!-- ── RIGHT: VISUAL ── -->
          <div class="hero-visual-col" #heroImages>
            <div class="visual-frame">
              <div class="visual-glow"></div>
              <div class="visual-orbit">
                <div class="visual-orbit-inner"></div>
              </div>

              <!-- Secondary Card -->
              <div class="glass-card card-secondary">
                <div class="card-img-wrap">
                  <img [ngSrc]="content.secondaryCard.image" fill class="card-img" [alt]="content.secondaryCard.title" priority />
                  <div class="card-overlay"></div>
                </div>
                <div class="card-content">
                  <span class="card-label">{{ content.secondaryCard.label }}</span>
                  <p class="card-title">{{ content.secondaryCard.title }}</p>
                </div>
              </div>

              <!-- Main Card -->
              <div class="glass-card card-main">
                <div class="card-img-wrap">
                  <img [ngSrc]="content.mainCard.image" fill class="card-img" [alt]="content.mainCard.title" priority />
                  <div class="card-overlay"></div>
                </div>
                <div class="card-content" style="display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem;">
                  <div>
                    <span class="card-label">{{ content.mainCard.label }}</span>
                    <h3 class="card-title">{{ content.mainCard.title }}</h3>
                    <p class="card-subtitle">{{ content.mainCard.subtitle }}</p>
                  </div>
                  <button class="card-action-btn" aria-label="View product">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Offer Badge -->
              <div class="badge-offer">
                <div class="badge-offer-check">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="badge-offer-label">{{ content.offerBadge.label }}</span>
                <span class="badge-offer-value">{{ content.offerBadge.value }}<span class="badge-offer-suffix">{{ content.offerBadge.suffix }}</span></span>
                <span class="badge-offer-sub">{{ content.offerBadge.subtext }}</span>
              </div>

              <!-- Cert Badge -->
              <div class="badge-cert">
                <div class="badge-cert-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p class="badge-cert-title">{{ content.certBadge.title }}</p>
                  <p class="badge-cert-sub">{{ content.certBadge.subtitle }}</p>
                </div>
              </div>

              <!-- Sparkles -->
              <div class="sparkle sparkle-1">+</div>
              <div class="sparkle sparkle-2">*</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `,
})
export class HeroSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly heroText = viewChild<ElementRef>('heroText');
  readonly heroImages = viewChild<ElementRef>('heroImages');

  readonly content = HOME_CONTENT.hero;
  readonly benefits = HOME_CONTENT.hero.benefits;
  readonly heroSubtitle = signal(HOME_CONTENT.hero.subtitle);

  constructor() {
    afterNextRender(() => this.animateHero());
  }

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: () => void 0,
    });
  }

  private animateHero(): void {
    const textEl = this.heroText()?.nativeElement;
    const imagesEl = this.heroImages()?.nativeElement;

    if (textEl) {
      // Animate named children individually — skip .hero-benefits wrapper,
      // animate the benefit items directly so @for children are included
      const topChildren = [
        textEl.querySelector('.hero-eyebrow'),
        textEl.querySelector('.hero-heading'),
        textEl.querySelector('.hero-subtitle-wrap'),
        textEl.querySelector('.hero-ctas'),
        textEl.querySelector('.hero-social'),
      ].filter(Boolean);

      const benefitItems = textEl.querySelectorAll('.benefit-item');

      gsap.killTweensOf([...topChildren, ...benefitItems]);

      gsap.fromTo(topChildren,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'power4.out',
          clearProps: 'all',
        }
      );

      // Animate benefit items with a slight delay so they appear after their container
      gsap.fromTo(benefitItems,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.35,
          stagger: 0.07,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }

    if (imagesEl) {
      gsap.killTweensOf(imagesEl.children);
      gsap.fromTo(imagesEl.children,
        { opacity: 0, scale: 0.97, y: 18 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          delay: 0.2,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }
  }
}