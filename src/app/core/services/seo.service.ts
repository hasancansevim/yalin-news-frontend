import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoTags {
  title: string;
  description: string;
  image?: string;
  url?: string;
  author?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private readonly siteName = 'YalınNews';
  private readonly defaultDescription = 'Güncel haberler ve son dakika gelişmeleri.';

  updatePageMeta(tags: SeoTags): void {
    const pageTitle = tags.title?.trim() || this.siteName;
    const description = tags.description?.trim() || this.defaultDescription;
    const documentTitle = pageTitle.includes(this.siteName)
      ? pageTitle
      : `${pageTitle} | ${this.siteName}`;

    this.title.setTitle(documentTitle);
    this.meta.updateTag({ name: 'description', content: description });

    if (tags.author) {
      this.meta.updateTag({ name: 'author', content: tags.author });
      this.meta.updateTag({ property: 'article:author', content: tags.author });
    }

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    if (tags.image) {
      this.meta.updateTag({ property: 'og:image', content: tags.image });
    }

    if (tags.url) {
      this.meta.updateTag({ property: 'og:url', content: tags.url });
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    if (tags.image) {
      this.meta.updateTag({ name: 'twitter:image', content: tags.image });
    }

    if (tags.author) {
      this.meta.updateTag({ name: 'twitter:creator', content: tags.author });
    }
  }
}
