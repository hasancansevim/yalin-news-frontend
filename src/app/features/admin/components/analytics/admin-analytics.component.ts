import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';

import { NewsDetailDto } from '../../../../shared/models/news-detail-dto';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.component.html',
})
export class AdminAnalyticsComponent {
  private readonly items = signal<NewsDetailDto[]>([]);

  @Input({ required: true }) set newsList(value: NewsDetailDto[]) {
    this.items.set(value);
  }

  protected readonly topNews = computed(() =>
    [...this.items()]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5),
  );

  protected readonly totalViews = computed(() =>
    this.items().reduce((acc, item) => acc + item.viewCount, 0),
  );
}
