import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border animate-slideUp pointer-events-auto"
          [class]="getToastClasses(toast.type)"
        >
          @if (toast.type === 'success') {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          } @else if (toast.type === 'error') {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          }
          
          <p class="font-body text-sm font-semibold">{{ toast.message }}</p>
          
          <button (click)="toastService.remove(toast.id)" class="ml-2 text-dark/40 hover:text-dark transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-slideUp {
      animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
  `
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  getToastClasses(type: ToastType): string {
    switch (type) {
      case 'success': return 'bg-green-50/90 text-green-900 border-green-200/50';
      case 'error': return 'bg-red-50/90 text-red-900 border-red-200/50';
      default: return 'bg-white/90 text-dark border-dark/10';
    }
  }
}
