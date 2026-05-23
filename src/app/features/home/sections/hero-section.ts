
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
import { ProductService } from '../../../core/services/product.service';
import gsap from 'gsap';

@Component({
  selector: 'app-hero-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  host: { class: 'block' },

  styles: `
    .bg-grid {
      background-size: 42px 42px;
      background-image:
        linear-gradient(to right, rgba(0, 168, 89, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 168, 89, 0.035) 1px, transparent 1px);
    }

    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .mask-image-gradient {
      mask-image: radial-gradient(circle at center, black, transparent 85%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 85%);
    }

    .glass-card-premium {
      background: rgba(255, 255, 255, 0.42);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.75);
      box-shadow:
        0 10px 30px rgba(15, 23, 42, 0.05),
        inset 0 1px 3px rgba(255, 255, 255, 0.35);
    }

    .glass-card-dark {
      background: rgba(15, 23, 42, 0.68);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    }

    .hero-float-primary {
      animation: heroFloat1 8s ease-in-out infinite;
    }

    .hero-float-secondary {
      animation: heroFloat2 9s ease-in-out infinite 1s;
    }

    .hero-float-badge {
      animation: heroFloat3 7s ease-in-out infinite 0.5s;
    }

    .hero-spark {
      font-size: 0.85rem;
      font-weight: 700;
      color: rgb(0 168 89 / 0.7);
    }

    @keyframes heroFloat1 {
      0%,
      100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-8px) rotate(1deg);
      }
    }

    @keyframes heroFloat2 {
      0%,
      100% {
        transform: translateY(0) rotate(-3deg);
      }
      50% {
        transform: translateY(-12px) rotate(-1deg);
      }
    }

    @keyframes heroFloat3 {
      0%,
      100% {
        transform: translateY(0) rotate(5deg);
      }
      50% {
        transform: translateY(-6px) rotate(7deg);
      }
    }

    .spin-slow {
      animation: spin-slow 40s linear infinite;
    }

    @keyframes spin-slow {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .btn-shine::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -60%;
      width: 30%;
      height: 200%;
      background: rgba(255, 255, 255, 0.25);
      transform: rotate(30deg);
      transition: none;
    }

    .btn-shine:hover::after {
      left: 150%;
      transition: all 1.2s cubic-bezier(0.19, 1, 0.22, 1);
    }

    @media (max-width: 1024px) {
      .hero-float-primary,
      .hero-float-secondary,
      .hero-float-badge {
        animation-duration: 5s;
      }
    }

    @media (max-width: 768px) {
      .glass-card-premium,
      .glass-card-dark {
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }
    }
  `,

  template: `
    <section
      class="home-section home-section--hero relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-secondary"
    >
      <div
        class="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[110px] pointer-events-none mix-blend-multiply"
      ></div>

      <div
        class="absolute right-[-10%] bottom-[-10%] h-[55%] w-[55%] rounded-full bg-accent/10 blur-[130px] pointer-events-none mix-blend-multiply"
      ></div>

      <div
        class="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay"
      ></div>

      <div
        class="absolute inset-0 bg-grid pointer-events-none mask-image-gradient"
      ></div>

      <div
        class="aq-container relative z-10 mx-auto grid w-full max-w-[1320px]
        items-center gap-10 px-4 py-12 sm:px-6 md:px-8
        lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-16 xl:px-12"
      >
        <div
          class="relative z-20 flex flex-col items-start justify-center lg:col-span-6"
          #heroText
        >
          <div
            class="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/40"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
              ></span>

              <span
                class="relative inline-flex h-2 w-2 rounded-full bg-primary"
              ></span>
            </span>

            <span
              class="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
            >
              Pure Kerala Origin
            </span>
          </div>

          <h1
            class="mb-12 max-w-[11ch] text-balance font-heading text-[clamp(2.5rem,6vw,4.2rem)] font-extrabold leading-[1.02] tracking-tight text-dark"
          >
            Elevate <br />

            <span class="mr-2 font-light italic text-dark-light/75">
              Artistry with
            </span>

            <span class="relative mt-2 mb-2 inline-block pb-2">
              <span
                class="relative z-10 bg-gradient-to-r from-primary-dark via-primary to-accent-dark bg-clip-text text-transparent block"
              >
                Premium Spices
              </span>

              <svg
                class="absolute bottom-[-0.2rem] left-0 -z-10 h-3 w-full text-primary/20"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,10 Q50,20 100,10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </h1>

          <div class="mb-10 mt-2 flex w-full max-w-lg items-start gap-4">
            <div
              class="h-12 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-primary to-accent mt-1"
            ></div>

            <p
              class="max-w-[600px] font-body text-[15px] leading-relaxed text-dark-light sm:text-base"
            >
              {{ heroSubtitle() }}
            </p>
          </div>

          <div
            class="mb-10 grid w-full max-w-lg grid-cols-1 gap-5 sm:grid-cols-2"
          >
            @for (benefit of benefits; track benefit) {
            <div
              class="flex items-center gap-3 text-[13px] font-semibold text-dark-light/95"
            >
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <svg
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </span>

              <span>{{ benefit }}</span>
            </div>
            }
          </div>

          <div
            class="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center mt-2"
          >
         <a
  routerLink="/shop"
  class="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-2xl
  border border-primary-dark/10
  bg-gradient-to-r from-primary to-primary-dark
  px-7 py-3.5 text-white
  shadow-[0_10px_30px_rgba(0,168,89,0.25)]
  transition-all duration-300 hover:-translate-y-0.5
  hover:shadow-[0_14px_40px_rgba(0,168,89,0.35)]"
>
 <span class="relative z-10 pl-2 text-sm font-semibold tracking-wide">
  Explore Shop
</span>

  <div
    class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full
    border border-white/20 bg-white/15
    transition-all duration-300 group-hover:bg-white/25"
  >
    <svg
      class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      ></path>
    </svg>
  </div>
</a>
            <a
              routerLink="/about"
              class="home-button-secondary group relative inline-flex items-center gap-2 px-5 py-3"
            >
              <span class="font-semibold text-sm">Our Heritage Story</span>

              <svg
                class="h-4 w-4 text-dark-light transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </a>
          </div>

          <div
            class="mt-10 flex w-full flex-wrap items-center gap-4 transition-opacity hover:opacity-95"
          >
            <div class="flex -space-x-3">
              <img
                src="https://i.pravatar.cc/100?img=12"
                class="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                alt="Chef reviewer"
              />

              <img
                src="https://i.pravatar.cc/100?img=33"
                class="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                alt="Home cook reviewer"
              />

              <img
                src="https://i.pravatar.cc/100?img=47"
                class="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                alt="Culinary expert reviewer"
              />
            </div>

            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1 text-accent">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                <svg
                  class="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  ></path>
                </svg>
                }

                <span class="ml-1.5 text-[12px] font-bold text-dark">
                  4.9/5
                </span>
              </div>

              <p class="text-[12px] font-semibold text-dark-light/80">
                Favored by 2,000+ gourmet kitchens and chefs
              </p>
            </div>
          </div>
        </div>

        <div
          class="relative mt-12 flex w-full items-center justify-center overflow-hidden lg:col-span-6 lg:mt-0"
          #heroImages
        >
          <div
            class="relative h-[360px] w-full max-w-[520px] sm:h-[440px] lg:h-[540px]"
          >
            <div
              class="absolute z-0 h-[78%] w-[78%] rounded-full bg-gradient-to-tr from-primary-light/20 to-accent/10 blur-[70px] pointer-events-none"
            ></div>

            <div
              class="absolute z-0 flex h-[78%] w-[78%] items-center justify-center rounded-full border border-primary/10 pointer-events-none spin-slow"
            >
              <div
                class="h-[84%] w-[84%] rounded-full border border-dashed border-accent/20"
              ></div>
            </div>

            <div
              class="absolute bottom-[6%] left-[1%] z-20 h-[40%] w-[50%] hero-float-secondary"
            >
              <div
                class="glass-card-premium group relative h-full w-full rounded-[2rem] p-2 shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-transform duration-700 hover:scale-[1.02]"
              >
                <div
                  class="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-[#E2E8F0]"
                >
                  <img
                    [ngSrc]="'https://images.unsplash.com/photo-1559144490-8328294fc4dc?auto=format&fit=crop&w=600&q=80'"
                    fill
                    class="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                    alt="Authentic pepper and cinnamon"
                    priority
                  />

                  <div
                    class="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/15 to-transparent pointer-events-none"
                  ></div>
                </div>

                <div class="absolute right-4 bottom-4 left-4">
                  <span
                    class="text-[8px] font-bold uppercase tracking-[0.2em] text-accent"
                  >
                    Signature Spices
                  </span>

                  <p class="font-heading text-base font-bold text-white">
                    Malabar Black Pepper
                  </p>
                </div>
              </div>
            </div>

            <div
              class="absolute top-[5%] right-[3%] z-10 h-[66%] w-[68%] hero-float-primary"
            >
              <div
                class="glass-card-premium group relative h-full w-full rounded-[2.4rem] p-2.5 shadow-[0_20px_50px_rgba(15,23,42,0.07)] transition-all duration-700 hover:scale-[1.01]"
              >
                <div
                  class="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#CBD5E1]"
                >
                  <img
                    [ngSrc]="'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'"
                    fill
                    class="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                    alt="Premium green cardamom"
                    priority
                  />

                  <div
                    class="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/20 to-transparent pointer-events-none"
                  ></div>
                </div>

                <div
                  class="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-4"
                >
                  <div>
                    <span
                      class="mb-1 block text-[8px] font-bold uppercase tracking-[0.22em] text-white/60"
                    >
                      Best Seller
                    </span>

                    <h3
                      class="font-heading text-xl font-bold tracking-wide text-white"
                    >
                      Green Cardamom
                    </h3>

                    <p class="mt-1 text-[11px] font-light text-white/80">
                      Extra Bold | Idukki Gold
                    </p>
                  </div>

                  <div
                    class="glass-card-dark flex h-9 w-9 cursor-pointer items-center justify-center rounded-full !bg-white/10 shadow-md backdrop-blur-md transition-colors duration-300 hover:!bg-primary"
                  >
                    <svg
                      class="h-3.5 w-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="glass-card-premium absolute top-[18%] right-[1%] z-30 flex flex-col items-center justify-center rounded-xl border border-white/95 px-4 py-3 shadow-xl hero-float-badge"
            >
              <div
                class="absolute top-[-0.45rem] right-[-0.45rem] flex h-5 w-5 items-center justify-center rounded-full bg-accent shadow-lg"
              >
                <svg
                  class="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>

              <span
                class="mb-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-primary"
              >
                Special Offer
              </span>

              <span
                class="font-heading text-2xl font-black leading-none tracking-tight text-dark"
              >
                20%
                <span class="text-xs font-bold text-dark-light">OFF</span>
              </span>

              <span
                class="mt-1 text-[8px] font-bold uppercase tracking-wider text-dark-light/75"
              >
                Direct Orders
              </span>
            </div>

            <div
              class="glass-card-dark absolute right-[3%] bottom-[18%] z-30 flex items-center gap-3 rounded-xl p-3 shadow-xl transition-colors duration-300 hover:bg-slate-900"
            >
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white shadow-inner"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>

              <div class="pr-1">
                <p class="font-heading text-sm font-bold leading-tight text-white">
                  Spices Board
                </p>

                <p
                  class="text-[9px] font-medium uppercase tracking-[0.08em] text-white/60"
                >
                  Certified Export Quality
                </p>
              </div>
            </div>

            <div
              class="glass-card-premium hero-float-badge absolute top-[18%] left-[8%] z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md"
            >
              <span class="hero-spark" aria-hidden="true">+</span>
            </div>

            <div
              class="glass-card-premium hero-float-primary absolute right-[42%] bottom-[5%] z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-md"
              style="animation-delay: 1.5s;"
            >
              <span class="hero-spark" aria-hidden="true">*</span>
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

  readonly benefits = [
    'Directly Sourced from Idukki Hills',
    '100% Certified Organic and Pure',
    'Maximum Essential Oils Retained',
    'Aroma-Lock Eco Packaging',
  ];

  readonly heroSubtitle = signal(
    "Directly sourced from the pristine hills of Idukki, our spices deliver the unmatched aroma and purity of Kerala's finest soil to your kitchen.",
  );

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
      gsap.from(textEl.children, {
        opacity: 0,
        y: 25,
        duration: 1,
        stagger: 0.08,
        ease: 'power4.out',
      });
    }

    if (imagesEl) {
      gsap.from(imagesEl.children, {
        opacity: 0,
        scale: 0.97,
        y: 18,
        duration: 1.2,
        delay: 0.2,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }
}
