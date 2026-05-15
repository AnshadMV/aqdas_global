import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import type { Testimonial } from '../../../shared/models';

@Component({
  selector: 'app-testimonials-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'block' },
  styles: `.testimonial-card{transition:all .4s ease}.testimonial-card:hover{transform:translateY(-4px)}.slider-track{transition:transform .5s cubic-bezier(.23,1,.32,1)}`,
  template: `
    <section class="py-24 bg-cream overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block font-body text-accent text-sm font-semibold tracking-widest uppercase mb-4">Testimonials</span>
          <h2 class="font-heading text-4xl sm:text-5xl font-bold text-dark mb-4">What Our Customers Say</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (t of testimonials(); track t.name) {
            <div class="testimonial-card glass rounded-3xl p-8 border border-white/40">
              <div class="flex items-center gap-1 mb-4">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" [attr.fill]="s<=t.rating?'#D4A017':'none'" [attr.stroke]="s<=t.rating?'#D4A017':'#ccc'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                }
              </div>
              <p class="font-body text-dark/70 text-sm leading-relaxed mb-6 italic">"{{ t.text }}"</p>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-lg font-heading font-bold text-primary">{{ t.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-body text-sm font-semibold text-dark">{{ t.name }}</p>
                  <p class="font-body text-xs text-dark/40">{{ t.location }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class TestimonialsSectionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly testimonials = signal<Testimonial[]>([]);

  ngOnInit(): void {
    this.productService.getTestimonials().subscribe({ next: (t) => this.testimonials.set(t) });
  }
}
