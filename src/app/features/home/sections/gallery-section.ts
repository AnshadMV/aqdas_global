import { Component, ChangeDetectionStrategy, afterNextRender, ElementRef, viewChild, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 12px 40px rgba(15, 23, 42, 0.03);
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .gallery-img { 
      transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1); 
    }
    .gallery-card:hover .gallery-img { 
      transform: scale(1.08) rotate(0.5deg); 
    }
    .gallery-card:hover .glass-card-premium {
      border-color: rgba(255, 255, 255, 1);
      box-shadow: 0 25px 50px rgba(0, 168, 89, 0.05);
      background: rgba(255, 255, 255, 0.65);
    }
  `,
  template: `
    <section class="py-36 relative bg-white overflow-hidden">
      <!-- Background elements -->
      <div class="absolute inset-0 bg-noise opacity-[0.035] pointer-events-none mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient opacity-50"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] bg-primary/10 blur-[160px] rounded-full pointer-events-none mix-blend-multiply"></div>
      
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center relative z-10">
        
        <div class="text-center mb-24 relative" #galleryHeader>
          <div class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8 shadow-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span class="text-xs sm:text-sm font-semibold tracking-[0.15em] text-primary uppercase">The Spice Journey</span>
          </div>
          <h2 class="font-heading text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-dark leading-[1.08] tracking-tight">
            Follow the <span class="relative inline-block mt-2">
              <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-primary to-accent-dark">Harvest Story</span>
              <svg class="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" fill="currentColor"/></svg>
            </span>
          </h2>
          <p class="font-body text-dark-light text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal mt-6">
            A glimpse into pristine high-altitude farms, hand-graded selection steps, and the pure organic lifecycle of AQDAS spices.
          </p>
        </div>

        <!-- Editorial Asymmetrical Masonry Gallery Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl relative" #galleryGrid>
          
          <!-- Central Overlay badge for absolute deluxe SaaS look -->
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#0F172A]/90 backdrop-blur-xl rounded-full z-30 flex flex-col items-center justify-center text-white shadow-2xl border border-white/10 transform hover:scale-105 transition-transform cursor-pointer group hidden lg:flex">
            <div class="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out -z-10"></div>
            <svg class="w-8 h-8 mb-1 group-hover:-translate-y-0.5 transition-transform text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <span class="text-[9px] font-bold tracking-[0.25em] uppercase">Origin Story</span>
          </div>

          @for (item of galleryItems(); track item.title; let idx = $index) {
            <div 
              class="gallery-card relative group cursor-pointer"
              [class.lg:col-span-2]="idx === 1 || idx === 3"
            >
              <div 
                class="glass-card-premium p-2.5 rounded-[2.5rem] w-full shadow-lg relative overflow-hidden"
                [class.h-72]="idx !== 1 && idx !== 3"
                [class.h-[320px]]="idx === 1 || idx === 3"
                [class.lg:rounded-tl-[5rem]]="idx === 0"
                [class.lg:rounded-br-[5rem]]="idx === 4"
              >
                <!-- Image Wrapper -->
                <div class="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-100">
                  <img [ngSrc]="item.image" fill class="gallery-img object-cover" [alt]="item.title" priority />
                  <div class="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/25 to-transparent rounded-[2rem]"></div>
                </div>

                <!-- Hover Details overlay -->
                <div class="absolute bottom-6 left-6 right-6 text-white z-20 flex flex-col items-start translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  <span class="bg-primary/20 backdrop-blur-md text-primary-light border border-primary/20 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-2">
                    {{ item.tag }}
                  </span>
                  <h3 class="font-heading text-xl sm:text-2xl font-bold tracking-wide mb-1 leading-none">{{ item.title }}</h3>
                  <p class="font-body text-white/70 text-xs font-light max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 leading-relaxed mt-1">
                    {{ item.desc }}
                  </p>
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
  readonly galleryGrid = viewChild<ElementRef>('galleryGrid');

  readonly galleryItems = signal<GalleryItem[]>([
    {
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      title: 'Drying cardamom pods',
      tag: 'Estate Sorting',
      desc: 'Sorted handpicked green cardamoms are dried slowly in a smoke-free natural setup to preserve maximum chlorophyll and active natural oils.'
    },
    {
      image: 'https://images.unsplash.com/photo-1559144490-8328294fc4dc?auto=format&fit=crop&w=800&q=80',
      title: 'Tellicherry Black Pepper sorting',
      tag: 'Sun-Drying Setup',
      desc: 'Selected peppercorns laid under uniform temperature setups. Plump berries are dried to a rich, wrinkled black shell bursting with piperine.'
    },
    {
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
      title: 'Artisanal harvesting steps',
      tag: 'Sustainable Pick',
      desc: 'Spice harvesting is carried out by hand at sunrise, preserving the delicate branch stalks and harvesting only pods at absolute peak maturity.'
    },
    {
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
      title: 'Ceylon Cinnamon scraping quills',
      tag: 'Scraping Craftsmanship',
      desc: 'Fine internal bark of Ceylon trees scraped by hand by native specialists and layered tightly into paper-thin multi-roll quills.'
    },
    {
      image: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?auto=format&fit=crop&w=600&q=80',
      title: 'Pure spice packing sorting',
      tag: 'Aroma-Lock Pack',
      desc: 'Our spice batches are sealed in specialized triple-layer organic foil containers, preventing loss of essential aromatherapy values.'
    }
  ]);

  constructor() {
    afterNextRender(() => {
      const header = this.galleryHeader()?.nativeElement;
      const grid = this.galleryGrid()?.nativeElement;

      if (header && grid) {
        gsap.from(header.children, {
          y: 35,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 85%' }
        });

        gsap.from(grid.children, {
          scale: 0.96,
          y: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: grid, start: 'top 85%' }
        });
      }
    });
  }
}
