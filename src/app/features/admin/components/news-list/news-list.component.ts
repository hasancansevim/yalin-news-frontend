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

  @Output() editNews = new EventEmitter<NewsDetailDto>();
  @Output() deleteNews = new EventEmitter<NewsDetailDto>();
  @Output() toggleBreaking = new EventEmitter<NewsDetailDto>();
}
