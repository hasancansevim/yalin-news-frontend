import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  
  isLoading = signal(false);
  message = signal('');
  isError = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tokenParam = params['token'];
      if (tokenParam) {
        this.token.set(tokenParam);
      } else {
        this.isError.set(true);
        this.message.set('Geçersiz veya eksik sıfırlama bağlantısı.');
      }
    });
  }

  onSubmit() {
    if (!this.token() || !this.newPassword() || !this.confirmPassword()) return;

    if (this.newPassword() !== this.confirmPassword()) {
      this.isError.set(true);
      this.message.set('Şifreler eşleşmiyor.');
      return;
    }

    this.isLoading.set(true);
    this.message.set('');
    this.isError.set(false);

    this.authService.resetPassword(this.token(), this.newPassword()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isError.set(false);
        this.message.set(res.message || 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isError.set(true);
        this.message.set(err.error?.message || 'Şifre sıfırlanırken bir hata oluştu.');
      }
    });
  }
}
