import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

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

  protected readonly list = signal<NewsDetailDto[]>([]);
  protected readonly activeEdit = signal<NewsDetailDto | null>(null);
  protected readonly breakingTitles = this.breakingNewsService.titles;

  protected readonly statCards = computed(() => {
    const items = this.list();
    const total = items.length;
    const published = items.filter((item) => item.status === 'Published').length;
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
    this.newsService.getNewsByDetails().subscribe((response) => {
      if (response.success) {
        this.list.set(response.data);
      }
    });
  }

  protected startEdit(item: NewsDetailDto): void {
    this.activeEdit.set(item);
  }

  protected clearEdit(): void {
    this.activeEdit.set(null);
  }

  protected saveNews(item: NewsDetailDto): void {
    const editing = this.activeEdit();
    if (editing) {
      this.list.update((current) =>
        current.map((news) => (news.title === editing.title ? { ...news, ...item } : news)),
      );
    } else {
      this.list.update((current) => [item, ...current]);
    }
    this.activeEdit.set(null);
  }

  protected removeNews(item: NewsDetailDto): void {
    this.list.update((current) => current.filter((news) => news.title !== item.title));
    this.breakingNewsService.remove(item.title);
    if (this.activeEdit()?.title === item.title) {
      this.activeEdit.set(null);
    }
  }

  protected toggleBreaking(item: NewsDetailDto): void {
    this.breakingNewsService.toggle(item.title);
  }
}
