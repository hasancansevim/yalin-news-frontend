import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { BreakingNewsService } from '../../core/services/breaking-news.service';
import { NewsService } from '../../core/services/news.service';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';
import { AdminAnalyticsComponent } from './components/analytics/admin-analytics.component';
import { NewsFormComponent } from './components/news-form/news-form.component';
import { NewsListComponent } from './components/news-list/news-list.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, NewsListComponent, NewsFormComponent, AdminAnalyticsComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  private readonly newsService = inject(NewsService);
  private readonly breakingNewsService = inject(BreakingNewsService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly list = signal<NewsDetailDto[]>([]);
  protected readonly activeEdit = signal<NewsDetailDto | null>(null);
  protected readonly breakingTitles = this.breakingNewsService.titles;
  protected readonly listError = signal('');

  protected readonly statCards = computed(() => {
    const items = this.list();
    const total = items.length;
    const published = items.filter((item) => {
      const s = String(item.status).trim().toLowerCase();
      return s === 'published' || s === '2';
    }).length;
    const draft = total - published;
    const breaking = this.breakingTitles().length;

    return [
      { label: 'Toplam Haber', value: String(total) },
      { label: 'Yayinda', value: String(published) },
      { label: 'Taslak', value: String(draft) },
      { label: 'Son Dakika', value: String(breaking) },
    ];
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNews();
    }
  }

  private loadNews(): void {
    this.listError.set('');
    this.newsService.getNewsByDetails().subscribe((response) => {
      if (response.success) {
        this.list.set(response.data);
      } else {
        this.listError.set(response.message || 'Haber listesi yuklenemedi.');
      }
    });
  }

  protected startEdit(item: NewsDetailDto): void {
    this.activeEdit.set(item);
  }

  protected clearEdit(): void {
    this.activeEdit.set(null);
  }

  protected afterSave(): void {
    this.activeEdit.set(null);
    this.loadNews();
  }

  protected removeNews(item: NewsDetailDto): void {
    this.listError.set('');
    if (item.id == null || item.id < 1) {
      this.listError.set(
        'Haberin sunucu kimligi (id) yok; guncelleme/silme yapilamaz. Listeyi yenileyin veya API yanitinda id alaninin geldiginden emin olun.',
      );
      return;
    }
    this.newsService.deleteNews(item).subscribe({
      next: (response) => {
        if (!response.success) {
          const msg =
            response.errors && response.errors.length > 0
              ? response.errors.join(' • ')
              : response.message || 'Haber silinemedi.';
          this.listError.set(msg);
          return;
        }
        this.list.update((current) => current.filter((news) => news.title !== item.title));
        this.breakingNewsService.remove(item.title);
        if (this.activeEdit()?.title === item.title) {
          this.activeEdit.set(null);
        }
      },
    });
  }

  protected toggleBreaking(item: NewsDetailDto): void {
    this.breakingNewsService.toggle(item.title);
  }
}
