import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-3">
      <div class="relative flex items-center justify-center" [class]="getSizeClass()">
        <div class="absolute w-full h-full border-2 border-primary/20 rounded-full animate-ping" style="animation-duration: 2s;"></div>
        <div class="absolute w-full h-full border-2 border-primary/40 rounded-full animate-pulse" style="animation-duration: 1.5s;"></div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary w-1/2 h-1/2 animate-bounce" style="animation-duration: 2s;">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path>
          <path d="M12 2v6"></path>
        </svg>
      </div>
      @if (text()) {
        <p class="font-body text-sm text-dark/50 tracking-wider uppercase animate-pulse">{{ text() }}</p>
      }
    </div>
  `
})
export class SpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly text = input<string>('');

  getSizeClass(): string {
    switch (this.size()) {
      case 'sm': return 'w-8 h-8';
      case 'lg': return 'w-20 h-20';
      case 'md': default: return 'w-14 h-14';
    }
  }
}
