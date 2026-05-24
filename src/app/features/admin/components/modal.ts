import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-admin-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: { 'class': 'contents' },
  styles: `
    .modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      display: flex; align-items: center; justify-content: center; padding: 1.5rem;
      background: rgba(15, 23, 42, 0.4);
      animation: fadeIn 0.15s ease-out;
    }
    
    .modal-backdrop {
      position: absolute; inset: 0; background: transparent; cursor: pointer;
    }

    .modal-content {
      position: relative; background: var(--theme-cream); color: var(--theme-dark);
      border-radius: 2rem; width: 100%; z-index: 10;
      box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
      animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex; flex-direction: column; overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
    }

    /* Size options */
    .modal-size-sm { max-width: 26rem; }
    .modal-size-md { max-width: 42rem; }
    .modal-size-lg { max-width: 60rem; }

    .modal-header {
      padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-dark) 6%, transparent);
      background: var(--theme-cream);
    }

    .modal-title { font-size: 1.15rem; font-weight: 800; color: var(--theme-dark); letter-spacing: -0.01em; margin: 0; }
    
    .close-btn {
      width: 2.25rem; height: 2.25rem; border-radius: 0.75rem; border: none;
      background: color-mix(in srgb, var(--theme-dark) 4%, transparent); display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--theme-dark-light); transition: all 0.2s;
    }
    .close-btn:hover { background: color-mix(in srgb, var(--theme-dark) 8%, transparent); color: var(--theme-dark); }

    .modal-body {
      padding: 2rem; overflow-y: auto; max-height: calc(85vh - 5rem);
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `,
  template: `
    <div class="modal-overlay" role="dialog" aria-modal="true">
      <!-- Unblurred Backdrop overlay (flat translucent mask) -->
      <div class="modal-backdrop" (click)="close.emit()"></div>

      <div class="modal-content" [class]="'modal-size-' + size()">
        @if (title()) {
          <div class="modal-header">
            <h3 class="modal-title">{{ title() }}</h3>
            <button class="close-btn" (click)="close.emit()" aria-label="Close modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        }
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class AdminModalComponent {
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly close = output<void>();
}
