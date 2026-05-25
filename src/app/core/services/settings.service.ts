import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AppSettings {
  fontSize: number; // 12, 14, 16, 18, 20, 22
  fontFamily: string; // 'Poppins' | 'Inter' | 'Playfair Display' | 'system-ui' | 'playfairseriff'
  density: 'comfortable' | 'standard' | 'compact' | 'extra-small';
  primaryColor: string; // 'emerald' | 'amber' | 'crimson' | 'indigo' | 'red'
  theme: 'light' | 'dark';
  userType?: 'normal' | 'wholesale';
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isInitialized = signal<boolean>(false);

  readonly settings = signal<AppSettings>({
    fontSize: 12,
    fontFamily: 'playfairseriff',
    density: 'extra-small',
    primaryColor: 'red',
    theme: 'light',
    userType: 'normal'
  });

  private readonly colorsMap: Record<string, { primary: string; dark: string; light: string }> = {
    emerald: { primary: '#00a859', dark: '#008a48', light: '#33b97a' },
    amber: { primary: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
    crimson: { primary: '#dc2626', dark: '#b91c1c', light: '#f87171' },
    indigo: { primary: '#4f46e5', dark: '#4338ca', light: '#818cf8' },
    red: { primary: '#ef4444', dark: '#b91c1c', light: '#fca5a5' }
  };


  constructor() {
    this.loadSettings();
  }

  loadSettings(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const saved = localStorage.getItem('aqdas-app-settings');
        let parsed: Partial<AppSettings> = {};
        if (saved) {
          parsed = JSON.parse(saved) as Partial<AppSettings>;
          this.isInitialized.set(true);
        }

        // Check for backward-compatibility with standalone 'aqdas-theme'
        const savedTheme = localStorage.getItem('aqdas-theme') as 'light' | 'dark' | null;
        if (savedTheme) {
          parsed.theme = savedTheme;
        } else if (!parsed.theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          parsed.theme = 'dark';
        }

        this.settings.update(s => ({ ...s, ...parsed }));
      } catch (e) {
        console.error('Failed to parse app settings from localStorage', e);
      }
      this.applySettings(this.settings());
    }
  }

  updateSettings(updates: Partial<AppSettings>): void {
    this.settings.update(s => {
      const next = { ...s, ...updates };
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('aqdas-app-settings', JSON.stringify(next));
        this.isInitialized.set(true);
        this.applySettings(next);
      }
      return next;
    });
  }

  hasSavedSettings(): boolean {
    return this.isInitialized();
  }

  private applySettings(settings: AppSettings): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // 1. Font Size Scaling (Scales everything since Poppins/Playfair utilize rem values)
    document.documentElement.style.fontSize = `${settings.fontSize}px`;

    // 2. Font Family Updates
    let baseFont = "'Poppins', sans-serif";
    let headingsFont = "'Playfair Display', serif";

    if (settings.fontFamily === 'Inter') {
      baseFont = "'Inter', sans-serif";
      headingsFont = "'Inter', sans-serif";
    } else if (settings.fontFamily === 'Playfair Display' || settings.fontFamily === 'playfairseriff') {
      baseFont = "'Playfair Display', serif";
      headingsFont = "'Playfair Display', serif";
    } else if (settings.fontFamily === 'system-ui') {
      baseFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      headingsFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }

    document.documentElement.style.setProperty('--theme-font-base', baseFont);
    document.documentElement.style.setProperty('--theme-font-headings', headingsFont);

    // 3. Layout Spacing Density (Using CSS Variables for customized scale values)
    let spacingScale = '1';
    if (settings.density === 'standard') spacingScale = '0.92';
    if (settings.density === 'compact') spacingScale = '0.84';
    if (settings.density === 'extra-small') spacingScale = '0.75';
    document.documentElement.style.setProperty('--theme-spacing-scale', spacingScale);

    // 4. Accent Brand Colors
    const palette = this.colorsMap[settings.primaryColor] || this.colorsMap['emerald'];
    document.documentElement.style.setProperty('--theme-primary', palette.primary);
    document.documentElement.style.setProperty('--theme-primary-dark', palette.dark);
    document.documentElement.style.setProperty('--theme-primary-light', palette.light);

    // 5. General Theme (White / Black)
    if (settings.theme === 'dark' || settings.theme === 'black' as any) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aqdas-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aqdas-theme', 'light');
    }
  }
}
