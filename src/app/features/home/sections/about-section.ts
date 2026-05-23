import { Component, ChangeDetectionStrategy, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-section',
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
      background: rgba(255, 255, 255, 0.54);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 12px 40px rgba(15, 23, 42, 0.03);
    }
    .glass-card-dark {
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
    .story-card {
      transition: transform 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
    }
    .story-card:hover {
      transform: translateY(-3px);
      border-color: rgba(0, 168, 89, 0.22);
      background: rgba(248, 250, 252, 0.85);
    }
    .img-shape-1,
    .img-shape-2 {
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .img-shape-1:hover {
      transform: scale(1.02);
    }
    .img-shape-2:hover {
      transform: scale(1.03) rotate(-1deg);
    }
    .animate-float { animation: float1 8s ease-in-out infinite; }
    .animate-float-delayed { animation: float2 9s ease-in-out infinite 2s; }
    @keyframes float1 {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes float2 {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(1deg); }
    }
  `,
  template: `
    <section class="home-section relative bg-white">
      <div class="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient opacity-45"></div>
      <div class="absolute top-1/2 left-0 h-[60%] w-[45%] -translate-y-1/2 rounded-full bg-primary/10 blur-[160px] pointer-events-none mix-blend-multiply"></div>
      <div class="absolute top-[-10%] right-[-10%] h-[40%] w-[35%] rounded-full bg-accent/10 blur-[130px] pointer-events-none mix-blend-multiply"></div>

      <div class="aq-container relative z-10">
        <div class="home-grid-2 gap-12 lg:gap-20">
          <div class="flex flex-col items-start" #aboutContent>
            <div class="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 shadow-sm backdrop-blur-md">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span class="text-xs font-semibold uppercase tracking-[0.15em] text-primary sm:text-sm">Our Heritage Narrative</span>
            </div>

            <h2 class="mb-6 max-w-[12ch] font-heading text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[1.06] tracking-tight text-dark">
              Honoring Spices in <br />
              <span class="relative mt-2 inline-block">
                <span class="relative z-10 bg-gradient-to-r from-primary-dark via-primary to-accent-dark bg-clip-text text-transparent">Their Purest Form</span>
                <svg class="absolute bottom-[-0.375rem] left-0 -z-10 h-3 w-full text-primary/20" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" fill="currentColor"/></svg>
              </span>
            </h2>

            <p class="mb-8 max-w-2xl font-body text-base leading-8 text-dark-light sm:text-lg">
              We refined this section for faster scanning, stronger visual hierarchy, and cleaner spacing while preserving the brand story behind AQDAS.
            </p>

            <div class="mb-8 grid w-full gap-4">
              @for (point of storyPoints; track point.title; let idx = $index) {
                <div class="story-card flex gap-4 rounded-2xl border border-slate-100 p-5">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                    0{{ idx + 1 }}
                  </div>
                  <div>
                    <h3 class="mb-1 font-heading text-lg font-bold text-dark">{{ point.title }}</h3>
                    <p class="font-body text-sm leading-7 text-dark-light">{{ point.copy }}</p>
                  </div>
                </div>
              }
            </div>

            <a routerLink="/about" class="home-button-primary gap-4">
              <span class="text-base font-semibold tracking-wide">Read Full Heritage Story</span>
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:bg-white/20">
                <svg class="h-4 w-4 transition-transform hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
            </a>
          </div>

          <div class="relative mt-6 h-[420px] w-full sm:h-[560px] lg:mt-0 lg:h-[660px]" #aboutImages>
            <div class="absolute right-0 z-0 h-[80%] w-[80%] rounded-full bg-gradient-to-tr from-primary-light/10 to-accent/10 blur-[80px] pointer-events-none"></div>

            <div class="glass-card-premium img-shape-1 animate-float absolute top-0 right-0 z-10 h-[72%] w-[84%] overflow-hidden rounded-[2.5rem] border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <div class="relative h-full w-full bg-slate-100">
                <img [ngSrc]="'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'" fill class="object-cover scale-105" alt="Premium cardamom estate in Kerala" priority />
                <div class="absolute inset-0 bg-gradient-to-tr from-dark/45 to-transparent pointer-events-none"></div>
              </div>

              <div class="glass-card-dark absolute right-6 bottom-6 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2.5 backdrop-blur-md">
                <div class="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Western Ghats Estates</span>
              </div>
            </div>

            <div class="img-shape-2 animate-float-delayed absolute bottom-[5%] left-0 z-20 h-[46%] w-[58%] overflow-hidden rounded-[2rem] border-[8px] border-white/95 shadow-[0_20px_45px_rgba(0,0,0,0.08)] backdrop-blur-md">
              <div class="relative h-full w-full bg-slate-200">
                <img [ngSrc]="'https://images.unsplash.com/photo-1559144490-8328294fc4dc?auto=format&fit=crop&w=600&q=80'" fill class="object-cover" alt="Authentic spice sorting" priority />
                <div class="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent"></div>
              </div>
              <div class="glass-card absolute bottom-5 left-5 rounded-xl border border-white/60 px-4 py-2.5 shadow-sm">
                <span class="flex items-center gap-2 font-heading text-xs font-bold text-dark sm:text-sm">
                  <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  Chemical-Free Organic
                </span>
              </div>
            </div>

            <div class="glass-card-dark animate-float absolute top-[8%] left-[5%] z-30 flex flex-col items-center justify-center rounded-[2rem] border border-white/10 px-7 py-5.5 shadow-2xl">
              <span class="bg-gradient-to-br from-primary-light via-primary to-accent bg-clip-text font-heading text-4xl font-black leading-none text-transparent sm:text-5xl">25+</span>
              <span class="mt-2 text-[9px] font-bold uppercase tracking-[0.25em] text-white/80">Years of</span>
              <span class="text-[9px] font-medium uppercase text-white/50">Harvest Integrity</span>
            </div>

            <div class="glass-card-premium animate-float-delayed absolute right-[3%] bottom-[28%] z-20 flex h-12 w-12 items-center justify-center rounded-full shadow-md">
              <span class="text-sm font-bold text-primary/70" aria-hidden="true">*</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutSectionComponent {
  readonly aboutImages = viewChild<ElementRef>('aboutImages');
  readonly aboutContent = viewChild<ElementRef>('aboutContent');

  readonly storyPoints = [
    {
      title: 'Direct Legacy Sourcing',
      copy: 'AQDAS works closely with small-holder estates across Idukki to secure fair trade relationships and the strongest harvest selections.',
    },
    {
      title: 'Traditional Solar Dehydration',
      copy: 'Our drying process protects aroma and essential oils while avoiding smoky aftertastes or aggressive heat treatment.',
    },
    {
      title: 'Uncompromised Purity Promise',
      copy: 'No adulterants, added colors, or preservatives. We keep the experience whole, traceable, and clean from farm to kitchen.',
    },
  ];

  constructor() {
    afterNextRender(() => {
      const imagesEl = this.aboutImages()?.nativeElement;
      const contentEl = this.aboutContent()?.nativeElement;

      if (imagesEl && contentEl) {
        gsap.from(imagesEl.children, {
          x: 50,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power4.out',
          scrollTrigger: { trigger: imagesEl, start: 'top 80%' },
        });

        gsap.from(contentEl.children, {
          y: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: contentEl, start: 'top 85%' },
        });
      }
    });
  }
}
