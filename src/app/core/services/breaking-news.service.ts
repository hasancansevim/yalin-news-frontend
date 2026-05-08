import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BreakingNewsService {
  readonly titles = signal<string[]>([]);

  toggle(title: string): void {
    this.titles.update((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [title, ...current].slice(0, 10),
    );
  }

  remove(title: string): void {
    this.titles.update((current) => current.filter((item) => item !== title));
  }
}
