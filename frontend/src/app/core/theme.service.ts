import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { OtelRumService } from './otel-rum.service';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly rum = inject(OtelRumService);
  private readonly currentTheme = signal<Theme>(this.getInitialTheme());
  readonly theme = computed(() => this.currentTheme());

  constructor() { this.apply(this.currentTheme()); }

  toggle(): void { this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark'); }

  setTheme(theme: Theme): void {
    if (theme === this.currentTheme()) return;
    this.currentTheme.set(theme);
    localStorage.setItem('app_theme', theme);
    this.apply(theme);
    this.rum.recordThemeSwitch(theme);
  }

  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('app_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(theme: Theme): void { this.document.documentElement.classList.toggle('dark', theme === 'dark'); }
}
