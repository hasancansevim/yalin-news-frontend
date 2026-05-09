import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BreakingNewsService {
  readonly titles = signal<string[]>([]);

  toggle(title: string): void {
    this.titles.update((current) =>
      current.includes(title) ? [] : [title]
    );
  }

  remove(title: string): void {
    this.titles.update((current) => current.filter((item) => item !== title));
  }
}
