import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { BreakingNewsService } from '../../core/services/breaking-news.service';
import { NewsService } from '../../core/services/news.service';
import { NotificationService } from '../../core/services/notification.service';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';
import { NewsFormComponent } from './components/news-form/news-form.component';
import { NewsListComponent } from './components/news-list/news-list.component';
import { CategoryManagementComponent } from './components/category-management/category-management.component';
import { AuthorManagementComponent } from './components/author-management/author-management.component';

type AdminTab = 'haberler' | 'kategoriler' | 'yazarlar' | 'istatistikler';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, NewsListComponent, NewsFormComponent, CategoryManagementComponent, AuthorManagementComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  private readonly newsService = inject(NewsService);
  private readonly breakingNewsService = inject(BreakingNewsService);
  protected readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly list = signal<NewsDetailDto[]>([]);
  protected readonly activeEdit = signal<NewsDetailDto | null>(null);
  protected readonly breakingTitles = this.breakingNewsService.titles;
  protected readonly listError = signal('');

  protected readonly activeTab = signal<AdminTab>('haberler');

  protected readonly statCards = computed(() => {
    const items = this.list();
    const total = items.length;
    const published = items.filter((item) => {
      const s = String(item.status).trim().toLowerCase();
      return s === 'published' || s === '2';
    }).length;
    const draft = total - published;
    const totalViews = items.reduce((acc, item) => acc + (item.viewCount || 0), 0);

    return [
      { label: 'Toplam Haber', value: String(total) },
      { label: 'Yayinda', value: String(published) },
      { label: 'Taslak', value: String(draft) },
      { label: 'Toplam Okunma', value: String(totalViews) },
    ];
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNews();
    }
  }

  protected setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    if (tab === 'haberler') {
      this.loadNews();
    }
  }

  private loadNews(): void {
    this.listError.set('');
    this.newsService.getAllNews().subscribe((response) => {
      if (response.success) {
        this.list.set(response.data);
      } else {
        this.listError.set(response.message || 'Haber listesi yuklenemedi.');
        this.notificationService.show(response.message || 'Haber listesi yüklenemedi.', 'error');
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
    this.notificationService.show('Haber başarıyla kaydedildi.', 'success');
    this.activeEdit.set(null);
    this.loadNews();
  }

  protected removeNews(item: NewsDetailDto): void {
    this.listError.set('');
    if (item.id == null || item.id < 1) {
      this.notificationService.show('Haberin sunucu kimliği (id) yok; güncelleme/silme yapılamaz.', 'warning');
      return;
    }

    if (!confirm(`"${item.title}" başlıklı haberi silmek istediğinize emin misiniz?`)) return;

    this.newsService.deleteNews(item).subscribe({
      next: (response) => {
        if (!response.success) {
          const msg =
            response.errors && response.errors.length > 0
              ? response.errors.join(' • ')
              : response.message || 'Haber silinemedi.';
          this.notificationService.show(msg, 'error');
          return;
        }
        this.notificationService.show('Haber başarıyla silindi.', 'success');
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
    this.notificationService.show(`"${item.title}" son dakika durumu değiştirildi.`, 'success');
  }
}
