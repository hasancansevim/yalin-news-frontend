import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NewsService } from '../../core/services/news.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SeoService } from '../../core/services/seo.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentService, Comment } from '../../core/services/comment.service';
import { FavoriteService, Favorite } from '../../core/services/favorite.service';

import { FALLBACK_NEWS_IMAGE } from '../../shared/constants/media.constants';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';
import { slugify } from '../../shared/utils/slug.util';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './news-detail.component.html',
})
export class NewsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsService = inject(NewsService);
  private readonly analytics = inject(AnalyticsService);
  private readonly seo = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly authService = inject(AuthService);
  private readonly commentService = inject(CommentService);
  private readonly favoriteService = inject(FavoriteService);

  protected readonly Math = Math;

  protected readonly news = signal<NewsDetailDto | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string>('');

  protected readonly comments = signal<Comment[]>([]);
  protected readonly newCommentText = signal<string>('');
  protected readonly isFavorite = signal<boolean>(false);
  private favoriteId: number | null = null;

  ngOnInit(): void {
    const slugParam = (this.route.snapshot.paramMap.get('slug') ?? '').trim();

    if (isPlatformBrowser(this.platformId)) {
      this.analytics.track('page_view', { page: 'news_detail', slug: slugParam });
    }

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
          if (isPlatformBrowser(this.platformId)) {
            this.analytics.track('news_open', {
              source: 'detail_page',
              title: matched.title,
              category: matched.categoryName,
            });
          }

          this.seo.updatePageMeta({
            title: matched.title,
            description: matched.spotText || matched.content.slice(0, 160),
            image: matched.imageUrl || FALLBACK_NEWS_IMAGE,
            url: `${environment.siteUrl}/news/${slugParam}`,
            author: matched.authorName,
          });

          this.loadComments(matched.id!);
          this.checkFavoriteStatus(matched.id!);
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

  private loadComments(newsId: number) {
    this.commentService.getAllByNewsId(newsId).subscribe(res => {
      if (res.success) {
        this.comments.set(res.data);
      }
    });
  }

  private checkFavoriteStatus(newsId: number) {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.favoriteService.getAllByNewsId(newsId).subscribe(res => {
      if (res.success) {
        const fav = res.data.find((f: any) => f.userId === userId);
        if (fav) {
          this.isFavorite.set(true);
          this.favoriteId = fav.id;
        }
      }
    });
  }

  protected toggleFavorite() {
    if (!this.authService.isLoggedIn()) {
      alert("Favoriye eklemek için giriş yapmalısınız.");
      return;
    }

    const n = this.news();
    if (!n) return;
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    if (this.isFavorite()) {
      // Remove
      if (this.favoriteId) {
        this.favoriteService.delete({ id: this.favoriteId, newsId: n.id!, userId }).subscribe(() => {
          this.isFavorite.set(false);
          this.favoriteId = null;
        });
      }
    } else {
      // Add
      this.favoriteService.add({ newsId: n.id!, userId }).subscribe(res => {
        this.isFavorite.set(true);
        // We'd ideally need the newly created ID, but we can refetch or ignore since we just need it for toggle
        this.checkFavoriteStatus(n.id!); 
      });
    }
  }

  protected submitComment() {
    if (!this.authService.isLoggedIn()) {
      alert("Yorum yapmak için giriş yapmalısınız.");
      return;
    }

    const text = this.newCommentText().trim();
    if (!text) return;

    const n = this.news();
    if (!n) return;

    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const newComment: Comment = {
      newsId: n.id!,
      userId: userId,
      content: text
    };

    this.commentService.add(newComment).subscribe(res => {
      if (res.success) {
        this.newCommentText.set('');
        this.loadComments(n.id!);
      }
    });
  }

  protected onHeroImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = FALLBACK_NEWS_IMAGE;
  }
}
