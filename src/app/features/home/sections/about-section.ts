import { Component, ChangeDetectionStrategy, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'block' },
  styles: `.about-image-wrapper{transition:transform .6s cubic-bezier(.23,1,.32,1)}.about-image-wrapper:hover{transform:scale(1.02)}`,
  template: `
    <section class="py-24 bg-secondary overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="relative" #aboutImages>
            <div class="grid grid-cols-2 gap-4">
              <div class="about-image-wrapper rounded-3xl overflow-hidden shadow-xl mt-8 opacity-0 translate-y-10 image-1">
                <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80" alt="Kerala spice plantation" class="w-full h-72 object-cover" loading="lazy" />
              </div>
              <div class="about-image-wrapper rounded-3xl overflow-hidden shadow-xl opacity-0 translate-y-10 image-2">
                <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80" alt="Premium cardamom pods" class="w-full h-72 object-cover" loading="lazy" />
              </div>
            </div>
            <div class="absolute -bottom-6 -left-6 w-32 h-32 rounded-3xl bg-accent/10 -z-10 bg-blob"></div>
          </div>
          <div #aboutContent>
            <span class="inline-block font-body text-accent text-sm font-semibold tracking-widest uppercase mb-4">Our Story</span>
            <h2 class="font-heading text-4xl sm:text-5xl font-bold text-dark mb-6 leading-tight">From Kerala's Hills <span class="text-primary">to Your Kitchen</span></h2>
            <p class="font-body text-dark/60 text-lg leading-relaxed mb-6">AQDAS brings authentic Kerala spices directly from farmers to your kitchen. Our products are naturally cultivated, handpicked, and carefully packed.</p>
            <div class="grid grid-cols-2 gap-6">
              @for (f of features; track f.title) {
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1"><span class="text-lg">{{ f.icon }}</span></div>
                  <div><h4 class="font-body text-sm font-semibold text-dark">{{ f.title }}</h4><p class="font-body text-xs text-dark/40 mt-0.5">{{ f.desc }}</p></div>
                </div>
              }
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

  constructor() {
    afterNextRender(() => {
      const imagesEl = this.aboutImages()?.nativeElement;
      const contentEl = this.aboutContent()?.nativeElement;

      if (imagesEl && contentEl) {
        // Animate Images
        gsap.to(imagesEl.querySelectorAll('.about-image-wrapper'), {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: imagesEl,
            start: 'top 80%',
          }
        });

        // Animate Content
        gsap.from(contentEl.children, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentEl,
            start: 'top 85%',
          }
        });
      }
    });
  }

  readonly features = [
    { icon: '🌿', title: '100% Organic', desc: 'No chemicals or preservatives' },
    { icon: '🤝', title: 'Fair Trade', desc: 'Direct from farmers' },
    { icon: '📦', title: 'Fresh Packed', desc: 'Vacuum sealed for freshness' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Pan-India shipping' },
  ];
}
