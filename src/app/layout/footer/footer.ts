import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { 'class': 'block' },
  template: `
    <footer class="bg-dark text-white/80 pt-20 pb-8">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <!-- Top Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <a routerLink="/" class="inline-block mb-6" aria-label="AQDAS Home">
              <span class="font-heading text-3xl font-bold text-white">AQDAS</span>
              <span class="text-accent text-xs font-body font-medium tracking-widest uppercase ml-2">Spices</span>
            </a>
            <p class="text-white/50 text-sm leading-relaxed mb-6 font-body">
              Bringing authentic Kerala spices directly from farmers to your kitchen since 2020. Naturally cultivated, handpicked, and carefully packed.
            </p>
            <!-- Social Icons -->
            <div class="flex items-center gap-4">
              @for (social of socialLinks; track social.label) {
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="social.label"
                  class="w-10 h-10 rounded-full bg-white/5 hover:bg-accent hover:text-dark flex items-center justify-center transition-all duration-300 text-white/60"
                >
                  <span [innerHTML]="social.icon"></span>
                </a>
              }
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="font-heading text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul class="space-y-3">
              @for (link of quickLinks; track link.label) {
                <li>
                  <a
                    [routerLink]="link.path"
                    class="text-white/50 hover:text-accent transition-colors text-sm font-body flex items-center gap-2 group"
                  >
                    <span class="w-0 group-hover:w-3 h-px bg-accent transition-all duration-300"></span>
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Customer Service -->
          <div>
            <h3 class="font-heading text-lg font-semibold text-white mb-6">Customer Service</h3>
            <ul class="space-y-3">
              @for (link of serviceLinks; track link.label) {
                <li>
                  <a
                    [routerLink]="link.path"
                    class="text-white/50 hover:text-accent transition-colors text-sm font-body flex items-center gap-2 group"
                  >
                    <span class="w-0 group-hover:w-3 h-px bg-accent transition-all duration-300"></span>
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
            <h3 class="font-heading text-lg font-semibold text-white mb-6">Stay Updated</h3>
            <p class="text-white/50 text-sm mb-4 font-body">Subscribe for exclusive offers and spice tips.</p>
            <div class="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                class="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-body placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
                aria-label="Email for newsletter"
              />
              <button
                class="px-5 py-3 bg-accent hover:bg-accent-dark text-dark font-semibold text-sm rounded-lg transition-colors font-body"
                aria-label="Subscribe to newsletter"
              >
                Join
              </button>
            </div>
            <div class="mt-6 space-y-2">
              <p class="text-white/40 text-xs font-body flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91 98765 43210
              </p>
              <p class="text-white/40 text-xs font-body flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                hello&#64;aqdas.in
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-white/30 text-xs font-body">
            &copy; 2026 AQDAS Spices. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <a routerLink="/privacy" class="text-white/30 hover:text-white/60 text-xs font-body transition-colors">Privacy Policy</a>
            <a routerLink="/terms" class="text-white/30 hover:text-white/60 text-xs font-body transition-colors">Terms of Service</a>
            <a routerLink="/refund" class="text-white/30 hover:text-white/60 text-xs font-body transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop All', path: '/shop' },
    { label: 'Categories', path: '/categories' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  readonly serviceLinks = [
    { label: 'My Account', path: '/profile' },
    { label: 'My Orders', path: '/orders' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Shipping Info', path: '/shipping' },
    { label: 'FAQs', path: '/faq' },
  ];

  readonly socialLinks = [
    {
      label: 'Instagram',
      url: 'https://instagram.com',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    },
    {
      label: 'Facebook',
      url: 'https://facebook.com',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    },
    {
      label: 'WhatsApp',
      url: 'https://wa.me/919876543210',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    },
  ];
}
