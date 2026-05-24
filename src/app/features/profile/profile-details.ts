import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser, selectAuthLoading } from '../../store/auth/auth.selectors';
import { AuthActions } from '../../store/auth/auth.actions';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface AvatarPreset {
  id: string;
  name: string;
  svg: string;
}

@Component({
  selector: 'app-profile-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SpinnerComponent],
  host: { 'class': 'block' },
  styles: `
    .profile-details-wrap {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: relative;
    }

    .ambient-glow {
      position: absolute;
      right: -5%;
      top: 10%;
      width: 40%;
      height: 40%;
      background: radial-gradient(circle, rgba(0,168,89,0.04), transparent 70%);
      filter: blur(80px);
      pointer-events: none;
    }

    /* ─── Section Cards ─── */
    .section-card {
      background: var(--theme-cream);
      backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 4%, transparent);
      border-radius: 2rem;
      padding: 2rem;
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    @media (min-width: 640px) {
      .section-card { padding: 2.5rem; }
    }

    .section-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,168,89,0.2), transparent);
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--theme-dark);
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .section-desc {
      font-size: 0.875rem;
      color: var(--theme-dark-light);
      margin-bottom: 2rem;
    }

    /* ─── Avatar Presets ─── */
    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .avatar-grid { grid-template-columns: repeat(6, 1fr); }
    }

    .avatar-btn {
      position: relative;
      aspect-ratio: 1;
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      border: 2px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      background: color-mix(in srgb, var(--theme-white) 40%, transparent);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      overflow: hidden;
    }

    .avatar-btn:hover {
      border-color: rgba(0, 168, 89, 0.3);
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -8px rgba(0, 168, 89, 0.15);
    }

    .avatar-btn.selected {
      border-color: #00a859;
      background: rgba(0, 168, 89, 0.06);
      box-shadow: 0 8px 20px -6px rgba(0, 168, 89, 0.25);
    }

    .avatar-btn.selected::after {
      content: '';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #00a859, #16a34a);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-btn.selected::before {
      content: '✓';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      z-index: 1;
    }

    .avatar-svg {
      width: 100%;
      height: 100%;
      color: #00a859;
    }

    .avatar-label {
      position: absolute;
      bottom: 0.5rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--theme-dark-light);
      background: var(--theme-cream-dark);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      opacity: 0;
      transition: opacity 0.2s ease;
      white-space: nowrap;
    }

    .avatar-btn:hover .avatar-label {
      opacity: 1;
    }

    /* ─── Form ─── */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .form-grid { grid-template-columns: 1fr 1fr; }
      .col-span-2 { grid-column: span 2; }
      .col-span-3 { grid-column: span 3; }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--theme-dark-light);
    }

    .form-input {
      width: 100%;
      padding: 0.95rem 1.25rem;
      background: color-mix(in srgb, var(--theme-white) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
      border-radius: 1rem;
      font-size: 0.9rem;
      color: var(--theme-dark);
      outline: none;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      border-color: #00a859;
      box-shadow: 0 0 0 4px rgba(0, 168, 89, 0.08);
      background: var(--theme-white);
    }

    .form-input::placeholder { color: var(--theme-dark-light); opacity: 0.6; }

    .form-input:disabled {
      background: color-mix(in srgb, var(--theme-dark) 3%, transparent);
      color: var(--theme-dark-light);
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-error {
      font-size: 0.75rem;
      color: #ef4444;
      font-weight: 500;
    }

    .input-wrap {
      position: relative;
    }

    .verified-badge {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(0, 168, 89, 0.1);
      color: #00a859;
      padding: 0.25rem 0.625rem;
      border-radius: 0.375rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .section-divider {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--theme-dark);
      padding-top: 1.5rem;
      margin-top: 1rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
    }

    /* ─── Submit Button ─── */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 2rem;
      margin-top: 1rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-dark) 8%, transparent);
    }

    .save-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #00a859, #16a34a);
      border: none;
      border-radius: 1rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 8px 24px -8px rgba(0, 168, 89, 0.4);
      position: relative;
      overflow: hidden;
    }

    .save-btn::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 20%;
      height: 200%;
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(30deg);
      transition: none;
    }

    .save-btn:hover:not(:disabled)::before {
      left: 150%;
      transition: left 0.8s;
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -8px rgba(0, 168, 89, 0.5);
    }

    .save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .save-btn:active:not(:disabled) {
      transform: translateY(-1px);
    }
  `,
  template: `
    <div class="profile-details-wrap">
      <div class="ambient-glow"></div>

      <!-- Avatar Selection -->
      <div class="section-card">
        <h2 class="section-title">Spice Up Your Profile</h2>
        <p class="section-desc">Choose a premium, spice-themed signature avatar to customize your presence.</p>

        <div class="avatar-grid">
          @for (avatar of avatarPresets; track avatar.id) {
            <button 
              type="button"
              (click)="selectPresetAvatar(avatar.svg)"
              class="avatar-btn"
              [class.selected]="selectedAvatar() === avatar.svg"
              [attr.aria-label]="'Select ' + avatar.name + ' avatar'">
              <div class="avatar-svg" [innerHTML]="getSafeSvg(avatar.svg)"></div>
              <span class="avatar-label">{{ avatar.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Personal Information -->
      <div class="section-card">
        <h2 class="section-title">Personal Details</h2>

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <div class="form-grid">
            <!-- Display Name -->
            <div class="form-group">
              <label for="displayName" class="form-label">Display Name</label>
              <input 
                id="displayName" 
                type="text" 
                formControlName="displayName" 
                class="form-input"
                placeholder="E.g., Anshad M.V." 
              />
              @if (profileForm.get('displayName')?.invalid && profileForm.get('displayName')?.touched) {
                <span class="form-error">Display name is required.</span>
              }
            </div>

            <!-- Email (Disabled) -->
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrap">
                <input 
                  type="email" 
                  [value]="user()?.email" 
                  disabled 
                  class="form-input"
                />
                @if (user()?.emailVerified) {
                  <span class="verified-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Verified
                  </span>
                }
              </div>
            </div>

            <!-- Phone Number -->
            <div class="form-group">
              <label for="phoneNumber" class="form-label">Phone Number</label>
              <input 
                id="phoneNumber" 
                type="tel" 
                formControlName="phoneNumber" 
                class="form-input"
                placeholder="E.g., +91 98765 43210" 
              />
            </div>

            <h3 class="section-divider col-span-2">Default Shipping Address</h3>

            <!-- Street Address -->
            <div class="form-group col-span-2">
              <label for="address" class="form-label">Street Address</label>
              <input 
                id="address" 
                type="text" 
                formControlName="address" 
                class="form-input"
                placeholder="Street address, apartment, flat number, etc." 
              />
            </div>

            <!-- City -->
            <div class="form-group">
              <label for="city" class="form-label">City</label>
              <input 
                id="city" 
                type="text" 
                formControlName="city" 
                class="form-input"
                placeholder="E.g., Kochi" 
              />
            </div>

            <!-- Postal Code -->
            <div class="form-group">
              <label for="postalCode" class="form-label">Postal Code</label>
              <input 
                id="postalCode" 
                type="text" 
                formControlName="postalCode" 
                class="form-input"
                placeholder="E.g., 682001" 
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button 
              type="submit" 
              [disabled]="profileForm.invalid || loading()"
              class="save-btn">
              @if (loading()) {
                <app-spinner size="sm" />
                <span>Saving Profile...</span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>Save Changes</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProfileDetailsComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly loading = this.store.selectSignal(selectAuthLoading);
  readonly selectedAvatar = signal<string>('');

  readonly profileForm = this.fb.group({
    displayName: ['', [Validators.required]],
    phoneNumber: [''],
    address: [''],
    city: [''],
    postalCode: ['']
  });

  readonly avatarPresets: AvatarPreset[] = [
    {
      id: 'cardamom',
      name: 'Cardamom',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" class="rounded-full select-none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradCardamom" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#355E3B"/><stop offset="100%" stop-color="#1A2F1D"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#gradCardamom)"/><ellipse cx="50" cy="50" rx="14" ry="24" transform="rotate(-20 50 50)" fill="#FFF" opacity="0.15"/><ellipse cx="50" cy="50" rx="12" ry="22" transform="rotate(-20 50 50)" fill="#4A7A53" stroke="#FFF" stroke-width="2"/><path d="M47,32 C49,38 49,46 47,56 C46,62 48,68 50,68 C52,68 54,62 53,56 C51,46 51,38 53,32" fill="none" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/><path d="M42,40 Q46,45 42,50 Q46,55 42,60" fill="none" stroke="#D4A017" stroke-width="1" stroke-linecap="round" opacity="0.6"/><path d="M58,40 Q54,45 58,50 Q54,55 58,60" fill="none" stroke="#D4A017" stroke-width="1" stroke-linecap="round" opacity="0.6"/></svg>`
    },
    {
      id: 'saffron',
      name: 'Saffron',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" class="rounded-full select-none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradSaffron" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#9A0505"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#gradSaffron)"/><path d="M50,75 C50,75 35,45 35,35 A15,15 0 0,1 65,35 C65,45 50,75 50,75 Z" fill="#FFF" opacity="0.15"/><path d="M50,70 Q45,55 42,32" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><path d="M50,70 Q50,52 52,28" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/><path d="M50,70 Q55,55 60,34" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/><circle cx="42" cy="30" r="2" fill="#FFF"/><circle cx="52" cy="26" r="2" fill="#FBBF24"/><circle cx="60" cy="32" r="2" fill="#EF4444"/></svg>`
    },
    {
      id: 'cinnamon',
      name: 'Cinnamon',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" class="rounded-full select-none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradCinnamon" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#D4A017"/><stop offset="100%" stop-color="#5C3A21"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#gradCinnamon)"/><rect x="42" y="22" width="10" height="56" rx="5" transform="rotate(-30 47 50)" fill="#FFF" opacity="0.2"/><path d="M38,28 L60,66 A6,6 0 0,1 50,72 L28,34 A6,6 0 0,1 38,28 Z" fill="#4E311B" stroke="#FFF" stroke-width="1.5"/><path d="M46,24 L68,62 A6,6 0 0,1 58,68 L36,30 A6,6 0 0,1 46,24 Z" fill="#784E2D" stroke="#FFF" stroke-width="1.5"/><path d="M43,30 C45,35 49,42 53,50" fill="none" stroke="#FFF" stroke-width="1" stroke-linecap="round" opacity="0.5"/></svg>`
    },
    {
      id: 'star-anise',
      name: 'Star Anise',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" class="rounded-full select-none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradAnise" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4F46E5"/><stop offset="100%" stop-color="#1E1B4B"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#gradAnise)"/><g transform="translate(50,50) scale(1.1)"><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(0)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(0)"/><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(45)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(45)"/><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(90)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(90)"/><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(135)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(135)"/><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(180)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(180)"/><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(225)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(225)"/><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(270)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(270)"/><path d="M0,0 Q-4,-14 0,-28 Q4,-14 0,0" fill="#D4A017" stroke="#FFF" stroke-width="1" transform="rotate(315)"/><circle cx="0" cy="-18" r="2" fill="#FFF" transform="rotate(315)"/><circle cx="0" cy="0" r="5" fill="#4B3B24" stroke="#FFF" stroke-width="1"/></g></svg>`
    },
    {
      id: 'cloves',
      name: 'Cloves',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" class="rounded-full select-none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradCloves" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DB2777"/><stop offset="100%" stop-color="#580F2E"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#gradCloves)"/><rect x="46" y="35" width="8" height="42" rx="4" fill="#3D1225" stroke="#FFF" stroke-width="1.5"/><circle cx="50" cy="30" r="10" fill="#E23C85" stroke="#FFF" stroke-width="1.5"/><g stroke="#FFF" stroke-width="1.5" stroke-linecap="round"><line x1="42" y1="36" x2="36" y2="30"/><line x1="58" y1="36" x2="64" y2="30"/><line x1="44" y1="24" x2="40" y2="18"/><line x1="56" y1="24" x2="60" y2="18"/></g></svg>`
    },
    {
      id: 'pepper',
      name: 'Pepper',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" class="rounded-full select-none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradPepper" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#030712"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#gradPepper)"/><circle cx="50" cy="50" r="16" fill="#1F2937" stroke="#FFF" stroke-width="2"/><circle cx="52" cy="48" r="14" fill="#F3F4F6" opacity="0.1"/><path d="M42,50 A8,8 0 1,0 58,50 A8,8 0 1,0 42,50" fill="none" stroke="#D4A017" stroke-width="1" stroke-dasharray="2,2"/><circle cx="28" cy="34" r="5" fill="#4B5563" stroke="#FFF" stroke-width="1"/><circle cx="70" cy="64" r="7" fill="#1F2937" stroke="#FFF" stroke-width="1"/><circle cx="72" cy="32" r="4" fill="#6B7280" stroke="#FFF" stroke-width="1"/></svg>`
    }
  ];

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.profileForm.patchValue({
          displayName: u.displayName || '',
          phoneNumber: u.phoneNumber || '',
          address: u.shippingAddress?.address || '',
          city: u.shippingAddress?.city || '',
          postalCode: u.shippingAddress?.postalCode || ''
        });
        if (u.photoURL) {
          this.selectedAvatar.set(u.photoURL);
        }
      }
    });
  }

  getSafeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  selectPresetAvatar(svg: string): void {
    this.selectedAvatar.set(svg);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const val = this.profileForm.value;

    const updatedDetails = {
      displayName: val.displayName ?? undefined,
      photoURL: this.selectedAvatar() || undefined,
      phoneNumber: val.phoneNumber ?? undefined,
      shippingAddress: {
        address: val.address ?? '',
        city: val.city ?? '',
        postalCode: val.postalCode ?? ''
      }
    };

    this.store.dispatch(AuthActions.updateProfile(updatedDetails));
  }
}