import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: { 'class': 'block' },
  styles: `
    .settings-wrap {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .settings-card {
      background: var(--theme-cream);
      backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-radius: 2rem;
      padding: 2rem;
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    .card-header {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .card-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
      color: var(--theme-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--theme-dark);
    }

    .card-desc {
      font-size: 0.85rem;
      color: var(--theme-dark-light);
      margin-top: 0.25rem;
    }

    /* ─── Grid Presets ─── */
    .presets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .preset-btn {
      background: color-mix(in srgb, var(--theme-cream-dark) 60%, transparent);
      border: 2px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      border-radius: 1.25rem;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      color: var(--theme-dark);
      font-weight: 600;
      text-align: center;
    }

    .preset-btn:hover {
      border-color: color-mix(in srgb, var(--theme-primary) 30%, transparent);
      background: var(--theme-cream);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -8px color-mix(in srgb, var(--theme-primary) 15%, transparent);
    }

    .preset-btn.active {
      border-color: var(--theme-primary);
      background: color-mix(in srgb, var(--theme-primary) 6%, transparent);
      color: var(--theme-primary);
      box-shadow: 0 8px 24px -10px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }

    .preset-label {
      font-size: 0.875rem;
      font-weight: 700;
    }

    .preset-sub {
      font-size: 0.75rem;
      color: var(--theme-dark-light);
      font-weight: 500;
    }

    .preset-btn.active .preset-sub {
      color: var(--theme-primary);
      opacity: 0.8;
    }

    /* ─── Color Dots ─── */
    .color-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
    }

    .color-btn {
      width: 4rem;
      height: 4rem;
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      border: 3px solid transparent;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .color-btn:hover {
      transform: scale(1.08) translateY(-2px);
    }

    .color-btn.active {
      transform: scale(1.05);
      border-color: var(--theme-dark);
      box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.15);
    }

    .color-dot {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .color-name {
      position: absolute;
      bottom: -1.75rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--theme-dark-light);
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s ease, bottom 0.3s ease;
    }

    .color-btn:hover .color-name, .color-btn.active .color-name {
      opacity: 1;
      bottom: -1.5rem;
    }

    /* ─── Preview Card ─── */
    .preview-card {
      background: var(--theme-cream-dark);
      border: 1px dashed color-mix(in srgb, var(--theme-dark) 10%, transparent);
      border-radius: 1.5rem;
      padding: 1.5rem;
      margin-top: 1rem;
      position: relative;
    }

    .preview-tag {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--theme-primary);
      background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
      padding: 2px 8px;
      border-radius: 100px;
    }

    .preview-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--theme-dark);
      margin-bottom: 0.5rem;
    }

    .preview-text {
      font-size: 0.875rem;
      color: var(--theme-dark-light);
      line-height: 1.6;
    }

    /* ─── Save Alert ─── */
    .alert-banner {
      background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-primary) 15%, transparent);
      border-radius: 1.5rem;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--theme-dark);
    }
  `,
  template: `
    <div class="settings-wrap">
      
      <!-- Live Typography Preview Card -->
      <div class="settings-card" style="border: 2px solid var(--theme-primary); background: color-mix(in srgb, var(--theme-cream) 95%, var(--theme-primary) 2%);">
        <div class="card-header">
          <div class="card-icon" style="background: var(--theme-primary); color: #fff;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12h20"/><path d="M20 12v8H4v-8"/><path d="m3 12 9-9 9 9"/></svg>
          </div>
          <div>
            <h2 class="card-title">Real-Time Canvas Preview</h2>
            <p class="card-desc">See the layout scaling, font selections, and brand primary color skin update dynamically below.</p>
          </div>
        </div>

        <div class="preview-card">
          <span class="preview-tag">Canvas Preview</span>
          <h3 class="preview-title">Authentic Indian Cardamom Spices</h3>
          <p class="preview-text">
            Experience the rich, aromatic legacy of premium hand-picked cardamom directly from the lush green hills of Kerala.
            Our spices are ground perfectly using state-of-the-art cold mills to retain their natural oils and robust flavor notes.
          </p>
          
          <div style="display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap;">
            <button style="background: var(--theme-primary); color: #fff; border: none; padding: 6px 14px; font-size: 0.75rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
              Shop Spices
            </button>
            <button style="background: transparent; border: 1px solid color-mix(in srgb, var(--theme-dark) 15%, transparent); color: var(--theme-dark); padding: 6px 14px; font-size: 0.75rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
              Learn More
            </button>
          </div>
        </div>
      </div>

      <!-- Theme Skin Accent Colors -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.32622 19.4754 5.48512 20.1706 5.26786 20.7812L5 21.5L5.71883 21.2396C6.32943 21.0224 7.02456 21.1813 7.5 21.6489C8.8038 22.9097 10.2745 22 12 22Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>
          </div>
          <div>
            <h2 class="card-title">Accent Brand Color (Theme Skin)</h2>
            <p class="card-desc">Skins the primary colors, action tags, buttons, and highlights across the entire app instantly.</p>
          </div>
        </div>

        <div class="color-presets">
          @for (color of colorOptions; track color.id) {
            <button 
              class="color-btn" 
              [class.active]="settings().primaryColor === color.id"
              [style.background]="color.bgColor"
              (click)="updatePrimaryColor(color.id)"
              [attr.aria-label]="'Set theme color to ' + color.name"
            >
              <div class="color-dot" [style.background]="color.hex"></div>
              <span class="color-name">{{ color.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Application Font Size & Layout Scaling -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
          </div>
          <div>
            <h2 class="card-title">Overall Size & Layout Scaling</h2>
            <p class="card-desc">Adjust the base sizing scale of elements, cards, layouts, and typography for customized viewing.</p>
          </div>
        </div>

        <div class="presets-grid">
          @for (size of sizeOptions; track size.value) {
            <button 
              class="preset-btn" 
              [class.active]="settings().fontSize === size.value"
              (click)="updateFontSize(size.value)"
            >
              <span class="preset-label" [style.font-size]="size.previewSize">{{ size.label }}</span>
              <span class="preset-sub">{{ size.scale }} scale</span>
            </button>
          }
        </div>
      </div>

      <!-- Typographical Font Family -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3v18"/><path d="M3 12h18"/><path d="M3 5h6"/><path d="M9 5v14"/><path d="M15 5h6"/><path d="M15 5v14"/></svg>
          </div>
          <div>
            <h2 class="card-title">Primary Font Typography</h2>
            <p class="card-desc">Change the body text and heading font families to your aesthetic preference.</p>
          </div>
        </div>

        <div class="presets-grid">
          @for (font of fontOptions; track font.id) {
            <button 
              class="preset-btn" 
              [class.active]="settings().fontFamily === font.id"
              [style.font-family]="font.family"
              (click)="updateFontFamily(font.id)"
            >
              <span class="preset-label">{{ font.name }}</span>
              <span class="preset-sub" style="font-family: inherit;">{{ font.desc }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Layout Spacing Density -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/><path d="M12 3v18"/></svg>
          </div>
          <div>
            <h2 class="card-title">Layout Spacing Density</h2>
            <p class="card-desc">Alter the density scaling factor (margins, paddings, gaps) between cards and buttons.</p>
          </div>
        </div>

        <div class="presets-grid">
          @for (density of densityOptions; track density.id) {
            <button 
              class="preset-btn" 
              [class.active]="settings().density === density.id"
              (click)="updateDensity(density.id)"
            >
              <span class="preset-label">{{ density.name }}</span>
              <span class="preset-sub">{{ density.desc }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Persistence Banner Alert -->
      <div class="alert-banner">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" stroke-width="2.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 0.9rem; font-weight: 700; color: var(--theme-dark);">Settings Saved Automatically</span>
          <span style="font-size: 0.75rem; color: var(--theme-dark-light); font-weight: 500;">All spacing density, typography face, canvas scaling, and theme colors are persisted inside local storage.</span>
        </div>
      </div>
      
    </div>
  `
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  
  readonly settings = this.settingsService.settings;

  readonly colorOptions = [
    { id: 'emerald', name: 'Emerald Spices', hex: '#00a859', bgColor: 'rgba(0, 168, 89, 0.08)' },
    { id: 'amber', name: 'Golden Honey', hex: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.08)' },
    { id: 'crimson', name: 'Red Chili', hex: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.08)' },
    { id: 'indigo', name: 'Royal Saffron', hex: '#4f46e5', bgColor: 'rgba(79, 70, 229, 0.08)' }
  ];

  readonly sizeOptions = [
    { value: 10, label: 'Tiny / Compact', scale: '0.62x', previewSize: '0.6rem' },
    { value: 12, label: 'Extra Small', scale: '0.75x', previewSize: '0.7rem' },
    { value: 14, label: 'Small Text', scale: '0.88x', previewSize: '0.8rem' },
    { value: 16, label: 'Standard size', scale: '1.00x', previewSize: '0.95rem' },
    { value: 18, label: 'Medium Zoom', scale: '1.12x', previewSize: '1.1rem' },
    { value: 20, label: 'Large Text', scale: '1.25x', previewSize: '1.25rem' },
    { value: 22, label: 'Extra Large', scale: '1.38x', previewSize: '1.4rem' }
  ];

  readonly fontOptions = [
    { id: 'Poppins', name: 'Poppins Font', family: "'Poppins', sans-serif", desc: 'Warm & Modern' },
    { id: 'Inter', name: 'Inter Sans', family: "'Inter', sans-serif", desc: 'Sleek & Clean' },
    { id: 'Playfair Display', name: 'Playfair Serif', family: "'Playfair Display', serif", desc: 'Elegant Classic' },
    { id: 'system-ui', name: 'System UI', family: 'system-ui, sans-serif', desc: 'Default OS font' }
  ];

  readonly densityOptions = [
    { id: 'comfortable', name: 'Comfortable Spacing', desc: 'Relaxed & Breathable' },
    { id: 'standard', name: 'Standard Layout', desc: 'Balanced Density' },
    { id: 'compact', name: 'Compact Spacing', desc: 'Maximum Data Density' }
  ] as const;

  updateFontSize(size: number): void {
    this.settingsService.updateSettings({ fontSize: size });
  }

  updateFontFamily(fontId: string): void {
    this.settingsService.updateSettings({ fontFamily: fontId });
  }

  updateDensity(densityId: 'comfortable' | 'standard' | 'compact'): void {
    this.settingsService.updateSettings({ density: densityId });
  }

  updatePrimaryColor(colorId: string): void {
    this.settingsService.updateSettings({ primaryColor: colorId });
  }
}
