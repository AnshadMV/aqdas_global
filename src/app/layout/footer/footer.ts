import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { 'class': 'block' },
  styles: `
    .aq-footer {
      position: relative;
      background: linear-gradient(180deg, var(--theme-cream-dark) 0%, var(--theme-secondary) 100%);
      color: var(--theme-dark-light);
      overflow: hidden;
      padding-top: 6rem;
      padding-bottom: 3rem;
    }

    .aq-footer::before {
      content: '';
      position: absolute;
      top: -20%; left: -10%;
      width: 60%; height: 60%;
      background: radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 8%, transparent), transparent 70%);
      filter: blur(100px);
      pointer-events: none;
    }

    .aq-footer::after {
      content: '';
      position: absolute;
      bottom: -20%; right: -10%;
      width: 50%; height: 50%;
      background: radial-gradient(circle, rgba(245,158,11,0.05), transparent 70%);
      filter: blur(120px);
      pointer-events: none;
    }

    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      position: relative;
      z-index: 10;
    }

    @media (min-width: 640px) { .footer-container { padding: 0 2rem; } }
    @media (min-width: 1024px) { .footer-container { padding: 0 2.5rem; } }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3.5rem;
      padding-bottom: 4rem;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
    }

    @media (min-width: 768px) {
      .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 4rem; }
    }

    @media (min-width: 1024px) {
      .footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1.4fr; gap: 3rem; }
    }

    /* Brand */
    .footer-brand-logo { display: inline-flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1.5rem; text-decoration: none; }
    .footer-brand-name { font-size: 1.875rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.02em; }
    .footer-brand-tag { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--theme-primary); }
    .footer-brand-desc { font-size: 0.875rem; line-height: 1.7; color: var(--theme-dark-light); margin-bottom: 2rem; max-width: 320px; }

    .footer-socials { display: flex; align-items: center; gap: 0.75rem; }
    .social-link {
      display: flex; align-items: center; justify-content: center;
      width: 2.5rem; height: 2.5rem; border-radius: 50%;
      background: color-mix(in srgb, var(--theme-white) 4%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      color: var(--theme-dark-light);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .social-link:hover {
      background: color-mix(in srgb, var(--theme-primary) 15%, transparent);
      border-color: color-mix(in srgb, var(--theme-primary) 40%, transparent);
      color: var(--theme-primary);
      transform: translateY(-3px);
      box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--theme-primary) 25%, transparent);
    }

    /* Links */
    .footer-col-title {
      font-size: 0.8rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--theme-dark); margin-bottom: 1.75rem;
      position: relative; padding-bottom: 0.75rem;
    }
    .footer-col-title::after {
      content: ''; position: absolute; bottom: 0; left: 0;
      width: 24px; height: 2px;
      background: linear-gradient(90deg, var(--theme-primary), #f59e0b);
      border-radius: 2px;
    }

    .footer-links { display: flex; flex-direction: column; gap: 1.125rem; }
    .footer-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 0.875rem; color: var(--theme-dark-light);
      text-decoration: none; transition: all 0.3s ease; width: fit-content;
    }
    .footer-link-dot { width: 0; height: 1px; background: var(--theme-primary); transition: width 0.3s ease; }
    .footer-link:hover { color: var(--theme-dark); transform: translateX(4px); }
    .footer-link:hover .footer-link-dot { width: 12px; }

    /* Newsletter Card */
    .newsletter-card {
      background: color-mix(in srgb, var(--theme-white) 2%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-radius: 1.5rem;
      padding: 2rem;
      backdrop-filter: blur(12px);
      position: relative;
      overflow: hidden;
    }
    .newsletter-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-primary) 40%, transparent), transparent);
    }

    .newsletter-desc { font-size: 0.875rem; color: var(--theme-dark-light); margin-bottom: 1.5rem; line-height: 1.6; }
    .newsletter-form { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
    
    .newsletter-input {
      flex: 1; padding: 0.85rem 1.125rem;
      background: color-mix(in srgb, var(--theme-white) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 0.875rem;
      color: var(--theme-dark); font-size: 0.875rem; outline: none;
      transition: all 0.3s ease;
    }
    .newsletter-input::placeholder { color: color-mix(in srgb, var(--theme-dark) 35%, transparent); }
    .newsletter-input:focus { border-color: color-mix(in srgb, var(--theme-primary) 50%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 10%, transparent); }

    .newsletter-btn {
      padding: 0.85rem 1.5rem;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      border: none; border-radius: 0.875rem;
      color: white; font-weight: 600; font-size: 0.875rem;
      cursor: pointer; transition: all 0.3s ease; white-space: nowrap;
    }
    .newsletter-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--theme-primary) 40%, transparent); }

    .contact-list { display: flex; flex-direction: column; gap: 1.125rem; }
    .contact-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--theme-dark-light); }
    .contact-icon {
      display: flex; align-items: center; justify-content: center;
      width: 2.25rem; height: 2.25rem; border-radius: 0.6rem;
      background: color-mix(in srgb, var(--theme-white) 4%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      color: var(--theme-primary); flex-shrink: 0;
    }

    /* Bottom Bar */
    .footer-bottom {
      padding-top: 2.5rem;
      display: flex; flex-direction: column;
      align-items: center; justify-content: space-between; gap: 1.5rem;
    }
    @media (min-width: 768px) { .footer-bottom { flex-direction: row; gap: 2rem; } }
    
    .footer-copyright { font-size: 0.8rem; color: var(--theme-dark-light); opacity: 0.7; }
    .footer-legal-links { display: flex; align-items: center; gap: 1.5rem; }
    .legal-link { font-size: 0.8rem; color: var(--theme-dark-light); opacity: 0.7; text-decoration: none; transition: color 0.3s ease; }
    .legal-link:hover { color: var(--theme-dark); opacity: 1; }
  `,
  template: `
    <footer class="aq-footer">
      <div class="footer-container">
        
        <!-- Top Grid -->
        <div class="footer-grid">
          
          <!-- Brand Column -->
          <div>
            <a routerLink="/" class="footer-brand-logo" aria-label="AQDAS Home">
              <span class="footer-brand-name">AQDAS</span>
              <span class="footer-brand-tag">Spices</span>
            </a>
            <p class="footer-brand-desc">
              Bringing authentic Kerala spices directly from farmers to your kitchen since 2020. Naturally cultivated, handpicked, and carefully packed.
            </p>
            
            <div class="footer-socials">
              @for (social of socialLinks; track social.label) {
                <a [href]="social.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="social.label" class="social-link">
                  <span [innerHTML]="social.icon"></span>
                </a>
              }
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="footer-col-title">Quick Links</h3>
            <ul class="footer-links">
              @for (link of quickLinks; track link.label) {
                <li>
                  <a [routerLink]="link.path" class="footer-link">
                    <span class="footer-link-dot"></span>
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Customer Service -->
          <div>
            <h3 class="footer-col-title">Customer Service</h3>
            <ul class="footer-links">
              @for (link of serviceLinks; track link.label) {
                <li>
                  <a [routerLink]="link.path" class="footer-link">
                    <span class="footer-link-dot"></span>
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Newsletter & Contact -->
          <div>
            <div class="newsletter-card">
              <h3 class="footer-col-title" style="margin-bottom: 1.25rem;">Stay Updated</h3>
              <p class="newsletter-desc">Subscribe for exclusive offers, recipes, and spice tips.</p>
              
              <div class="newsletter-form">
                <input type="email" placeholder="Your email address" class="newsletter-input" aria-label="Email for newsletter" />
                <button class="newsletter-btn" aria-label="Subscribe to newsletter">Join</button>
              </div>

              <div class="contact-list">
                <div class="contact-item">
                  <div class="contact-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.4 5 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <span>+91 98765 43210</span>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <span>hello&#64;aqdas.in</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom">
          <p class="footer-copyright">&copy; 2026 AQDAS Spices. All rights reserved.</p>
          <div class="footer-legal-links">
            <a routerLink="/privacy" class="legal-link">Privacy Policy</a>
            <a routerLink="/terms" class="legal-link">Terms of Service</a>
            <a routerLink="/refund" class="legal-link">Refund Policy</a>
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

  readonly socialLinks: {
    label: string;
    url: string;
    icon: SafeHtml;
  }[];

  constructor(private sanitizer: DomSanitizer) {
    this.socialLinks = [
      {
        label: 'Instagram',
        url: 'https://instagram.com',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      `),
      },
      {
        label: 'Facebook',
        url: 'https://facebook.com',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      `),
      },
      {
        label: 'WhatsApp',
        url: 'https://wa.me/919876543210',
        icon: this.sanitizer.bypassSecurityTrustHtml(`
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
          viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.76-1-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
      `),
      },
    ];
  }
}