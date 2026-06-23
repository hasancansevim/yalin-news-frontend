import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, NewsCardComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  private authService = inject(AuthService);
  private seoService = inject(SeoService);

  favoriteNews = signal<NewsDetailDto[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.seoService.updateTitle('Favorilerim');
    this.loadFavorites();
  }

  private loadFavorites() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    this.favoriteService.getAllByUserId(user.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.favoriteNews.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Favoriler yüklenirken hata oluştu:', err);
        this.isLoading.set(false);
      }
    });
  }
}
