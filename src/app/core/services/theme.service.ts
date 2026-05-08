import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'yalinnews-theme';

  readonly theme = signal<ThemeMode>('light');

  constructor() {
    this.initializeTheme();
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: ThemeMode, persist = true): void {
    this.theme.set(theme);
    this.applyThemeClass(theme);

    if (persist && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.setTheme(savedTheme, false);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.setTheme(mediaQuery.matches ? 'dark' : 'light', false);

    mediaQuery.addEventListener('change', (event) => {
      const hasStoredPreference = localStorage.getItem(this.storageKey);
      if (!hasStoredPreference) {
        this.setTheme(event.matches ? 'dark' : 'light', false);
      }
    });
  }

  private applyThemeClass(theme: ThemeMode): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }
}
