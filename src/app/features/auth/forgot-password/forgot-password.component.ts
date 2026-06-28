import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = signal('');
  isLoading = signal(false);
  message = signal('');
  isError = signal(false);

  onSubmit() {
    if (!this.email()) return;

    this.isLoading.set(true);
    this.message.set('');
    this.isError.set(false);

    this.authService.forgotPassword(this.email()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isError.set(false);
        this.message.set(res.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        this.email.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isError.set(true);
        this.message.set(err.error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    });
  }
}
