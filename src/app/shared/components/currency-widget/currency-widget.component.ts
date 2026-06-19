import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-currency-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-surface/50 border border-border text-xs font-ui font-medium text-text-secondary">
      <div class="flex items-center gap-1.5" *ngIf="rates()">
        <span class="text-text-primary">USD</span>
        <span class="text-accent-main">{{ (1 / rates()!.USD).toFixed(2) }} ₺</span>
      </div>
      <div class="w-px h-3 bg-border" *ngIf="rates()"></div>
      <div class="flex items-center gap-1.5" *ngIf="rates()">
        <span class="text-text-primary">EUR</span>
        <span class="text-accent-main">{{ (1 / rates()!.EUR).toFixed(2) }} ₺</span>
      </div>
      <div class="w-px h-3 bg-border" *ngIf="rates()"></div>
      <div class="flex items-center gap-1.5" *ngIf="rates()">
        <span class="text-text-primary">GBP</span>
        <span class="text-accent-main">{{ (1 / rates()!.GBP).toFixed(2) }} ₺</span>
      </div>
    </div>
  `
})
export class CurrencyWidgetComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly rates = signal<any>(null);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get('https://api.exchangerate-api.com/v4/latest/TRY').subscribe({
        next: (res: any) => {
          if (res && res.rates) {
            this.rates.set(res.rates);
          }
        },
        error: () => {
          // Fallback or silent ignore
        }
      });
    }
  }
}
