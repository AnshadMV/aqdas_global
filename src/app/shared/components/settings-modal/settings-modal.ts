import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { SettingsService, AppSettings } from '../../../core/services/settings.service';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-settings-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-window glass scale-in">
        
        <!-- Header -->
        <div class="modal-header">
          <div class="brand-badge">
            <span class="logo-dot"></span>
            <span class="brand-text">AQDAS PREMIUM</span>
          </div>
          <h2 id="modal-title" class="modal-title">Personalize Your Experience</h2>
          <p class="modal-subtitle">Welcome! Customize how AQDAS looks and operates for you.</p>
          
          <!-- Progress Bar -->
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" [style.width.%]="step() === 1 ? 50 : 100"></div>
            <div class="progress-text">Step {{ step() }} of 2</div>
          </div>
        </div>

        <!-- Step 1: Design & Styles (1/2) -->
        @if (step() === 1) {
          <div class="modal-body step-content">
            
            <!-- 1. Accent Brand Color -->
            <div class="setting-group">
              <label class="setting-label">Accent Brand Color (Theme Skin)</label>
              <div class="color-options">
                @for (c of colors; track c.id) {
                  <button 
                    (click)="selectedColor.set(c.id)"
                    class="color-btn"
                    [class.active]="selectedColor() === c.id"
                    [style.background-color]="c.hex"
                    [attr.aria-label]="c.name"
                    type="button"
                  >
                    @if (selectedColor() === c.id) {
                      <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    }
                  </button>
                }
              </div>
              <p class="setting-hint">Applies standard and accent styling highlights. (Vibrant Red selected by default)</p>
            </div>

            <!-- 2. Size & Layout Scaling -->
            <div class="setting-group">
              <label class="setting-label">Size & Layout Scaling</label>
              <div class="scale-options">
                @for (s of scales; track s.value) {
                  <button
                    (click)="selectedScale.set(s.value)"
                    class="scale-btn"
                    [class.active]="selectedScale() === s.value"
                    type="button"
                  >
                    <span class="scale-name">{{ s.label }}</span>
                    <span class="scale-ratio">{{ s.ratio }}</span>
                  </button>
                }
              </div>
              <p class="setting-hint">Controls font sizes and padding densities. (Extra Small 0.75x selected by default)</p>
            </div>

            <!-- 3. Primary Font Typography -->
            <div class="setting-group">
              <label class="setting-label">Primary Font Typography</label>
              <div class="font-options">
                @for (f of fonts; track f.id) {
                  <button
                    (click)="selectedFont.set(f.id)"
                    class="font-btn"
                    [class.active]="selectedFont() === f.id"
                    [style.font-family]="f.family"
                    type="button"
                  >
                    <span class="font-display">Aa</span>
                    <span class="font-name">{{ f.name }}</span>
                  </button>
                }
              </div>
              <p class="setting-hint">Adjusts headings and body typeface. (Playfair Serif selected by default)</p>
            </div>

            <!-- 4. Global Black/White Theme -->
            <div class="setting-group">
              <label class="setting-label">Unified Global Theme</label>
              <div class="theme-options">
                <button
                  (click)="selectedTheme.set('light')"
                  class="theme-btn"
                  [class.active]="selectedTheme() === 'light'"
                  type="button"
                >
                  <span class="theme-icon sun">☀️</span>
                  <span class="theme-name">White Theme</span>
                </button>
                <button
                  (click)="selectedTheme.set('dark')"
                  class="theme-btn"
                  [class.active]="selectedTheme() === 'dark'"
                  type="button"
                >
                  <span class="theme-icon moon">🌙</span>
                  <span class="theme-name">Black Theme</span>
                </button>
              </div>
              <p class="setting-hint">Toggles global background theme colors. (White theme by default)</p>
            </div>

          </div>

          <div class="modal-footer">
            <button (click)="nextStep()" class="btn-primary" type="button">
              Continue to Account Type
              <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        }

        <!-- Step 2: User Types (2/2) -->
        @if (step() === 2) {
          <div class="modal-body step-content">
            
            <div class="setting-group text-center">
              <label class="setting-label mb-4">Select Your Shopping Mode</label>
              
              <div class="mode-options">
                <!-- Normal Mode -->
                <button
                  (click)="selectedUserType.set('normal')"
                  class="mode-card"
                  [class.active]="selectedUserType() === 'normal'"
                  type="button"
                >
                  <div class="mode-badge">STANDARD</div>
                  <div class="mode-icon-wrap">
                    🛍️
                  </div>
                  <h3 class="mode-title">Normal Spices Buyer</h3>
                  <p class="mode-desc">Perfect for homes, retail quantities, recipes, and fine kitchen culinary dining spices.</p>
                  <ul class="mode-features">
                    <li>✓ Regular small packages (50g – 250g)</li>
                    <li>✓ Standard shopping cart and wishlist</li>
                    <li>✓ No minimum order quantities (MOQ)</li>
                    <li>✓ Standard shipping & checkout flows</li>
                  </ul>
                </button>

                <!-- Wholesale Mode -->
                <button
                  (click)="selectedUserType.set('wholesale')"
                  class="mode-card wholesale"
                  [class.active]="selectedUserType() === 'wholesale'"
                  type="button"
                >
                  <div class="mode-badge gold">B2B WHOLESALE</div>
                  <div class="mode-icon-wrap gold-glow">
                    💼
                  </div>
                  <h3 class="mode-title">Bulk Buyers & Wholesale</h3>
                  <p class="mode-desc">Best for restaurants, resellers, catering, commercial bakeries, and export bulk cardamom contracts.</p>
                  <ul class="mode-features">
                    <li>✓ Commercial bulk packaging (5kg – 10kg crates)</li>
                    <li>✓ Wholesale B2B quick-order sheet grid</li>
                    <li>✓ 20% flat volume discount active</li>
                    <li>✓ Freight shipping weight & crate estimators</li>
                  </ul>
                </button>
              </div>

            </div>

          </div>

          <div class="modal-footer">
            <button (click)="prevStep()" class="btn-secondary" type="button">
              <svg class="arrow-icon rotate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
            <button (click)="saveSettings()" class="btn-primary btn-save" type="button">
              Save & Launch Shop
              <svg class="check-icon-large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        }

      </div>
    </div>
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-window {
      width: min(100%, 46rem);
      max-height: calc(100dvh - 3rem);
      background: color-mix(in srgb, var(--theme-cream) 92%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 10%, transparent);
      border-radius: 2rem;
      box-shadow: 
        0 30px 60px -15px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      outline: none;
    }

    .modal-header {
      padding: 2rem 2.25rem 1.25rem;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.15);
      border-radius: 100px;
      padding: 0.35rem 0.85rem;
      margin-bottom: 1rem;
    }

    .logo-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ef4444;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }

    .brand-text {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #ef4444;
    }

    .modal-title {
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--theme-dark);
      margin-bottom: 0.5rem;
    }

    .modal-subtitle {
      font-size: 0.95rem;
      color: var(--theme-dark-light);
      margin-bottom: 1.5rem;
    }

    .progress-bar-wrap {
      position: relative;
      height: 4px;
      background: color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 10px;
      margin-top: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .progress-bar-fill {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      background: #ef4444;
      border-radius: 10px;
      transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .progress-text {
      position: absolute;
      right: 0;
      top: -1.5rem;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--theme-dark-light);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .modal-body {
      padding: 1.5rem 2.25rem 2rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .setting-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--theme-dark);
    }

    .setting-hint {
      font-size: 0.75rem;
      color: var(--theme-dark-light);
      opacity: 0.8;
    }

    /* Colors Options */
    .color-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .color-btn {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1.2);
    }

    .color-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .color-btn.active {
      transform: scale(1.08);
      border-color: var(--theme-dark);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-dark) 20%, transparent);
    }

    .check-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    /* Scale Options */
    .scale-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .scale-options {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .scale-btn {
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      color: var(--theme-dark-light);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.3s;
    }

    .scale-btn:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.04);
    }

    .scale-btn.active {
      background: #ef4444;
      border-color: #ef4444;
      color: white;
      box-shadow: 0 8px 20px -6px rgba(239, 68, 68, 0.35);
    }

    .scale-name {
      font-size: 0.8rem;
      font-weight: 700;
    }

    .scale-ratio {
      font-size: 0.7rem;
      opacity: 0.8;
      font-weight: 600;
    }

    /* Font Options */
    .font-options {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .font-options {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .font-btn {
      padding: 0.85rem 1.25rem;
      border-radius: 1.25rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      color: var(--theme-dark);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s;
      text-align: left;
    }

    .font-btn:hover {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.04);
    }

    .font-btn.active {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .font-btn.active .font-display {
      background: #ef4444;
      color: white;
    }

    .font-display {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--theme-dark) 6%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--theme-dark-light);
      transition: all 0.3s;
    }

    .font-name {
      font-size: 0.9rem;
      font-weight: 700;
    }

    /* Theme Options */
    .theme-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .theme-btn {
      padding: 1rem;
      border-radius: 1.25rem;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      color: var(--theme-dark);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 0.9rem;
      transition: all 0.3s;
    }

    .theme-btn:hover {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.04);
    }

    .theme-btn.active {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .theme-icon {
      font-size: 1.2rem;
    }

    /* Step 2: B2B Mode Options */
    .mode-options {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    @media (min-width: 640px) {
      .mode-options {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .mode-card {
      position: relative;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      background: color-mix(in srgb, var(--theme-white) 60%, transparent);
      border-radius: 1.75rem;
      padding: 2rem 1.5rem;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.05);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .mode-card:hover {
      transform: translateY(-4px);
      border-color: #ef4444;
      box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.08);
    }

    .mode-card.active {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.03);
      box-shadow: 
        0 16px 36px -12px rgba(239, 68, 68, 0.1),
        0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .mode-card.wholesale:hover {
      border-color: var(--theme-accent-dark, #fbbf24);
    }

    .mode-card.wholesale.active {
      border-color: #fbbf24;
      background: rgba(251, 191, 36, 0.03);
      box-shadow: 
        0 16px 36px -12px rgba(251, 191, 36, 0.1),
        0 0 0 3px rgba(251, 191, 36, 0.15);
    }

    .mode-badge {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 0.3rem 0.75rem;
      border-radius: 100px;
      background: color-mix(in srgb, var(--theme-dark) 6%, transparent);
      color: var(--theme-dark-light);
      margin-bottom: 1.25rem;
    }

    .mode-badge.gold {
      background: rgba(251, 191, 36, 0.12);
      color: #b58a13;
      border: 1px solid rgba(251, 191, 36, 0.2);
    }

    .mode-icon-wrap {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 1.25rem;
      background: rgba(239, 68, 68, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.85rem;
      margin-bottom: 1.25rem;
      transition: all 0.3s;
    }

    .gold-glow {
      background: rgba(251, 191, 36, 0.1);
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.15);
    }

    .mode-card.active .mode-icon-wrap {
      transform: scale(1.1) rotate(5deg);
    }

    .mode-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--theme-dark);
      margin-bottom: 0.5rem;
    }

    .mode-desc {
      font-size: 0.8rem;
      color: var(--theme-dark-light);
      line-height: 1.5;
      margin-bottom: 1.5rem;
      height: 3rem;
    }

    .mode-features {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: left;
      width: 100%;
      border-top: 1px dashed color-mix(in srgb, var(--theme-dark) 8%, transparent);
      padding-top: 1.25rem;
    }

    .mode-features li {
      font-size: 0.75rem;
      color: var(--theme-dark-light);
      font-weight: 600;
    }

    /* Modal Footer */
    .modal-footer {
      padding: 1.5rem 2.25rem 2rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      height: 3.25rem;
      padding-inline: 1.75rem;
      border-radius: 1.125rem;
      font-weight: 700;
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.1);
      cursor: pointer;
    }

    .btn-primary {
      background: #ef4444;
      color: white;
      box-shadow: 0 10px 24px -8px rgba(239, 68, 68, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px -8px rgba(239, 68, 68, 0.55);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-save {
      background: linear-gradient(135deg, var(--theme-dark), #1e293b);
      box-shadow: 0 10px 24px -8px rgba(30, 41, 59, 0.4);
    }

    .btn-save:hover {
      background: linear-gradient(135deg, #1e293b, var(--theme-dark));
      box-shadow: 0 14px 30px -8px rgba(30, 41, 59, 0.55);
    }

    .btn-secondary {
      border: 1px solid color-mix(in srgb, var(--theme-dark) 12%, transparent);
      background: color-mix(in srgb, var(--theme-white) 40%, transparent);
      color: var(--theme-dark-light);
    }

    .btn-secondary:hover {
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
      color: var(--theme-dark);
      border-color: color-mix(in srgb, var(--theme-dark) 20%, transparent);
    }

    .arrow-icon, .check-icon-large {
      width: 1.125rem;
      height: 1.125rem;
    }

    .arrow-icon.rotate {
      transform: rotate(0deg);
      transition: transform 0.3s;
    }

    .btn-secondary:hover .arrow-icon.rotate {
      transform: translateX(-3px);
    }

    .btn-primary:hover .arrow-icon:not(.rotate) {
      transform: translateX(3px);
    }

    /* Scales & Transitions */
    .scale-in {
      animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .step-content {
      animation: fadeIn 0.35s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class SettingsModalComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  
  readonly user = this.store.selectSignal(selectCurrentUser);
  
  readonly step = signal<1 | 2>(1);

  // Selection signals initialized to requested defaults
  readonly selectedColor = signal<string>('red');
  readonly selectedScale = signal<number>(12); // Extra Small 0.75x maps to 12px
  readonly selectedFont = signal<string>('playfairseriff');
  readonly selectedTheme = signal<'light' | 'dark'>('light');
  readonly selectedUserType = signal<'normal' | 'wholesale'>('normal');

  readonly colors = [
    { id: 'red', name: 'Premium Red (Active default)', hex: '#ef4444' },
    { id: 'emerald', name: 'Kerala Cardamom Green', hex: '#00a859' },
    { id: 'amber', name: 'Estate Ginger Amber', hex: '#f59e0b' },
    { id: 'crimson', name: 'Chili Crimson', hex: '#dc2626' },
    { id: 'indigo', name: 'Wild Indigo Blue', hex: '#4f46e5' },
  ];

  readonly scales = [
    { value: 12, label: 'Extra Small (Default)', ratio: '0.75x' },
    { value: 14, label: 'Small Scale', ratio: '0.85x' },
    { value: 16, label: 'Medium / Default', ratio: '1.00x' },
    { value: 18, label: 'Large Comfort', ratio: '1.15x' },
  ];

  readonly fonts = [
    { id: 'playfairseriff', name: 'Playfair Serif', family: "'Playfair Display', serif" },
    { id: 'Poppins', name: 'Poppins Sans', family: "'Poppins', sans-serif" },
    { id: 'Inter', name: 'Inter Minimalist', family: "'Inter', sans-serif" },
    { id: 'system-ui', name: 'System Default', family: 'system-ui' },
  ];

  nextStep(): void {
    this.step.set(2);
  }

  prevStep(): void {
    this.step.set(1);
  }

  saveSettings(): void {
    // Determine mapping layout density
    let density: 'comfortable' | 'standard' | 'compact' | 'extra-small' = 'extra-small';
    if (this.selectedScale() === 14) density = 'compact';
    if (this.selectedScale() === 16) density = 'comfortable';
    if (this.selectedScale() === 18) density = 'comfortable'; // uses comfortable scale with larger font

    const appSettings: AppSettings = {
      fontSize: this.selectedScale(),
      fontFamily: this.selectedFont(),
      density: density,
      primaryColor: this.selectedColor(),
      theme: this.selectedTheme(),
      userType: this.selectedUserType()
    };

    // Save locally
    this.settingsService.updateSettings(appSettings);

    // Save to Database (Firestore) if user is logged in
    const currentUser = this.user();
    if (currentUser) {
      this.authService.updateUserProfile(currentUser.uid, {
        userType: this.selectedUserType()
      }).subscribe({
        next: () => {
          this.toast.success(`Preferences synced! Active B2B Mode: ${this.selectedUserType().toUpperCase()}`);
        },
        error: (err) => {
          console.error('Failed to sync settings to profile', err);
          this.toast.error('Local preferences active. Database sync failed.');
        }
      });
    } else {
      this.toast.success(`Welcome! Active Mode: ${this.selectedUserType().toUpperCase()}`);
    }
  }
}
