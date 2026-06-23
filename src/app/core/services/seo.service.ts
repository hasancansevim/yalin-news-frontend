import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

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
  private readonly document = inject(DOCUMENT);

  private schemaScriptElement: HTMLScriptElement | null = null;

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

  setCanonicalUrl(url: string) {
    const head = this.document.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this.document.querySelector(`link[rel='canonical']`);
    if (!element) {
      element = this.document.createElement('link') as HTMLLinkElement;
      element.setAttribute('rel', 'canonical');
      head.appendChild(element);
    }
    element.setAttribute('href', url);
  }

  setNewsArticleSchema(news: any, slug: string) {
    this.removeNewsArticleSchema();

    const schema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": news.title,
      "description": news.spotText || news.content?.slice(0, 160),
      "image": news.imageUrl ? [news.imageUrl] : [],
      "datePublished": news.publishDate || news.publishedAt || new Date().toISOString(),
      "author": [{
        "@type": "Person",
        "name": news.authorName || (news.author ? news.author.name : 'YalınNews')
      }],
      "publisher": {
        "@type": "Organization",
        "name": this.siteName,
        "logo": {
          "@type": "ImageObject",
          "url": "https://yalinnews.vercel.app/favicon.ico"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://yalinnews.vercel.app/news/${slug}`
      }
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.schemaScriptElement = script;
    this.document.head.appendChild(script);
  }

  removeNewsArticleSchema() {
    if (this.schemaScriptElement && this.document.head.contains(this.schemaScriptElement)) {
      this.document.head.removeChild(this.schemaScriptElement);
      this.schemaScriptElement = null;
    }
  }
}
