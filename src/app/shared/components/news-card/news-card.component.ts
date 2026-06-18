import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NewsDetailDto } from '../../models/news-detail-dto';
import { FALLBACK_NEWS_IMAGE } from '../../constants/media.constants';
import { slugify } from '../../utils/slug.util';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './news-card.component.html',
})
export class NewsCardComponent {
  @Input({ required: true }) news!: NewsDetailDto;
  protected readonly Math = Math;

  protected categoryTone(categoryName: string): string {
    const normalized = categoryName.toLowerCase();

    if (normalized.includes('teknoloji')) {
      return 'from-cyan-500/25 to-indigo-500/25 border-cyan-300/30 text-cyan-100';
    }
    if (normalized.includes('ekonomi')) {
      return 'from-emerald-500/25 to-teal-500/25 border-emerald-300/30 text-emerald-100';
    }
    if (normalized.includes('spor')) {
      return 'from-orange-500/25 to-amber-500/25 border-orange-300/30 text-orange-100';
    }

    return 'from-violet-500/25 to-fuchsia-500/25 border-violet-300/30 text-violet-100';
  }

  protected toSlug(title: string): string {
    return slugify(title);
  }

  protected onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = FALLBACK_NEWS_IMAGE;
  }
}
