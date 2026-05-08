import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { NewsService } from '../../core/services/news.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FALLBACK_NEWS_IMAGE } from '../../shared/constants/media.constants';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';
import { slugify } from '../../shared/utils/slug.util';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './news-detail.component.html',
})
export class NewsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsService = inject(NewsService);
  private readonly analytics = inject(AnalyticsService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly news = signal<NewsDetailDto | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string>('');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    const slugParam = (this.route.snapshot.paramMap.get('slug') ?? '').trim();
    this.analytics.track('page_view', { page: 'news_detail', slug: slugParam });

    this.newsService.getNewsByDetails().subscribe({
      next: (response) => {
        if (!response.success) {
          this.error.set(response.message || 'Haber detay bilgisi alinamadi.');
          this.isLoading.set(false);
          return;
        }

        const records = response.data ?? [];
        const matched = records.find((item) => slugify(item.title) === slugParam) ?? records[0] ?? null;
        this.news.set(matched);
        if (matched) {
          this.analytics.track('news_open', {
            source: 'detail_page',
            title: matched.title,
            category: matched.categoryName,
          });
        }

        if (!matched) {
          this.error.set('Detay gosterilecek haber bulunamadi.');
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Detay verisi yuklenirken hata olustu.');
        this.isLoading.set(false);
      },
    });
  }

  protected onHeroImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = FALLBACK_NEWS_IMAGE;
  }
}
