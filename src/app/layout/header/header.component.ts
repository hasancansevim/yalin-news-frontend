import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
