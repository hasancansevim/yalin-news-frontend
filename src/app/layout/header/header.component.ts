import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ThemeService } from '../../core/services/theme.service';

import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected logout(): void {
    this.authService.logout();
    // Optional: redirect to home or login page if desired
  }
}
