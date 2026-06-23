import { CommonModule, DatePipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NewsService } from '../../core/services/news.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BreakingNewsService } from '../../core/services/breaking-news.service';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { CurrencyWidgetComponent } from '../../shared/components/currency-widget/currency-widget.component';
import { FALLBACK_NEWS_IMAGE } from '../../shared/constants/media.constants';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';
import { slugify } from '../../shared/utils/slug.util';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, NewsCardComponent, CurrencyWidgetComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly Math = Math;

  private readonly newsService = inject(NewsService);
  private readonly analytics = inject(AnalyticsService);
  private readonly breakingNewsService = inject(BreakingNewsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly news = signal<NewsDetailDto[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string>('');
  protected readonly selectedCategory = signal<string>('Tümü');
  protected readonly searchQuery = signal<string>('');

  protected readonly categories = signal<string[]>(['Tümü']);
  protected readonly displayLimit = signal<number>(8);
  protected readonly hasMore = computed(() => this.filteredNews().length > this.displayLimit() + 1);

  protected readonly filteredNews = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.news()
      .map((item) => {
        // Strip the [SON DAKİKA] tag for display
        const isBreaking = item.title.startsWith('[SON DAKİKA] ');
        return {
          ...item,
          title: isBreaking ? item.title.replace('[SON DAKİKA] ', '') : item.title,
          isBreaking // add a custom flag if we want to use it
        };
      })
      .filter((item) => {
        const matchesCategory =
          category === 'Tümü' ||
          category === 'Tum Kategoriler' ||
          item.categoryName.toLowerCase() === category.toLowerCase();

        if (!matchesCategory) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          item.title.toLowerCase().includes(query) ||
          item.spotText.toLowerCase().includes(query) ||
          item.authorName.toLowerCase().includes(query) ||
          item.categoryName.toLowerCase().includes(query)
        );
      });
  });

  protected readonly heroNews = computed(() => this.filteredNews()[0] ?? null);
  protected readonly gridNews = computed(() => this.filteredNews().slice(1, this.displayLimit() + 1));
  protected readonly breakingNews = computed(() => {
    return this.filteredNews().filter((item: any) => item.isBreaking);
  });
  protected readonly mostReadNews = computed(() =>
    [...this.news()].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
  );

  protected categoryTone(categoryName: string): string {
    const normalized = categoryName.toLowerCase();

    if (normalized.includes('teknoloji')) {
      return 'from-cyan-500/30 to-indigo-500/30 border-cyan-300/30 text-cyan-100';
    }
    if (normalized.includes('ekonomi')) {
      return 'from-emerald-500/30 to-teal-500/30 border-emerald-300/30 text-emerald-100';
    }
    if (normalized.includes('spor')) {
      return 'from-orange-500/30 to-amber-500/30 border-orange-300/30 text-orange-100';
    }

    return 'from-violet-500/30 to-fuchsia-500/30 border-violet-300/30 text-violet-100';
  }

  protected selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.displayLimit.set(8);
    this.syncFiltersToUrl();
    this.analytics.track('category_click', { category });
  }

  protected updateSearchQuery(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.displayLimit.set(8);
    this.syncFiltersToUrl();
    this.analytics.track('search', { query: value.trim() });
  }

  protected toSlug(title: string): string {
    return slugify(title);
  }

  protected trackNewsOpen(news: NewsDetailDto, source: 'hero' | 'breaking' | 'most_read'): void {
    this.analytics.track('news_open', {
      source,
      title: news.title,
      category: news.categoryName,
    });
  }

  protected onHeroImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = FALLBACK_NEWS_IMAGE;
  }

  getOptimizedImageUrl(url: string | undefined): string {
    if (!url) return FALLBACK_NEWS_IMAGE;
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}w=1920&q=75&fm=webp`;
    }
    return url;
  }

  ngOnInit(): void {
    this.seo.updatePageMeta({
      title: 'Ana Sayfa',
      description: 'En güncel dünya, teknoloji, ekonomi ve bilim haberlerini tarafsız ve sade bir şekilde sunan dijital haber platformu YalınNews.'
    });

    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    const queryCategory = this.route.snapshot.queryParamMap.get('category');
    const querySearch = this.route.snapshot.queryParamMap.get('q');
    if (queryCategory) {
      this.selectedCategory.set(queryCategory);
    }
    if (querySearch) {
      this.searchQuery.set(querySearch);
    }

    this.analytics.track('page_view', {
      page: 'home',
      q: querySearch ?? '',
      category: queryCategory ?? '',
    });

    this.newsService.getCategories().subscribe({
      next: (cats) => {
        const unique = new Set(cats);
        this.categories.set(['Tümü', ...Array.from(unique)]);
      }
    });

    this.loadNews();
  }

  private loadNews(): void {
    this.isLoading.set(true);
    this.error.set('');
    
    this.newsService.getNewsByDetails(1, 50).subscribe({
      next: (response) => {
        if (response.success) {
          const fetchedNews = (response.data ?? []).filter((n) => {
            const normalizedStatus = String(n.status).trim().toLowerCase();
            return normalizedStatus === 'published' || normalizedStatus === '2';
          });
          this.news.set(fetchedNews);
        } else {
          this.error.set(response.message || 'Haberler şu an yüklenemiyor.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Haberler alınırken bir hata oluştu.');
        this.isLoading.set(false);
      },
    });
  }

  protected loadMore(): void {
    if (this.hasMore()) {
      this.displayLimit.update(limit => limit + 8);
    }
  }

  private syncFiltersToUrl(): void {
    const category = this.selectedCategory();
    const query = this.searchQuery().trim();

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: category === 'Tümü' ? null : category,
        q: query || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
