import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { NewsDetailDto } from '../../../../shared/models/news-detail-dto';

@Component({
  selector: 'app-admin-news-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-list.component.html',
})
export class NewsListComponent {
  @Input({ required: true }) newsList: NewsDetailDto[] = [];
  @Input() selectedTitle: string | null = null;
  @Input() breakingTitles: string[] = [];

  @Output() editNews = new EventEmitter<NewsDetailDto>();
  @Output() deleteNews = new EventEmitter<NewsDetailDto>();
  @Output() toggleBreaking = new EventEmitter<NewsDetailDto>();

  protected trackNews(item: NewsDetailDto): string | number {
    return item.id != null && item.id > 0 ? item.id : `${item.title}\u0000${item.publishDate}`;
  }

  protected isPublishedStatus(item: NewsDetailDto): boolean {
    const s = String(item.status).trim().toLowerCase();
    return s === 'published' || s === '2';
  }

  protected isBreaking(item: NewsDetailDto): boolean {
    return this.breakingTitles.includes(item.title);
  }
}
