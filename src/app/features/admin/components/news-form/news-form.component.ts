import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { NewsService } from '../../../../core/services/news.service';
import { NamedEntityOption } from '../../../../shared/models/named-entity-option';
import { NewsDetailDto } from '../../../../shared/models/news-detail-dto';

@Component({
  selector: 'app-admin-news-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './news-form.component.html',
})
export class NewsFormComponent implements OnChanges, OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly newsService = inject(NewsService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  @Input() editItem: NewsDetailDto | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  protected readonly isSaving = signal(false);
  protected readonly isLookupsLoading = signal(false);
  protected readonly submitErrorLines = signal<string[]>([]);
  protected readonly categoryOptions = signal<NamedEntityOption[]>([]);
  protected readonly authorOptions = signal<NamedEntityOption[]>([]);

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(8)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    authorId: [0, [Validators.required, Validators.min(1)]],
    imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
    spotText: ['', [Validators.required, Validators.minLength(12)]],
    content: ['', [Validators.required, Validators.minLength(40)]],
    status: ['Draft', Validators.required],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLookups();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['editItem']) {
      return;
    }

    if (this.editItem) {
      this.form.patchValue({
        title: this.editItem.title,
        categoryId: this.editItem.categoryId ?? 0,
        authorId: this.editItem.authorId ?? 0,
        imageUrl: this.editItem.imageUrl,
        spotText: this.editItem.spotText,
        content: this.editItem.content,
        status: this.statusToFormSelect(this.editItem.status),
      });
      this.applyEditItemIdsFromNames();
      return;
    }

    this.form.reset({
      title: '',
      categoryId: 0,
      authorId: 0,
      imageUrl: '',
      spotText: '',
      content: '',
      status: 'Draft',
    });
    this.submitErrorLines.set([]);
  }

  protected submit(): void {
    this.submitErrorLines.set([]);

    if (!this.categoryOptions().length || !this.authorOptions().length) {
      this.submitErrorLines.set([
        !this.categoryOptions().length ? 'Kategori listesi yuklenemedi.' : '',
        !this.authorOptions().length ? 'Yazar listesi yuklenemedi.' : '',
      ].filter(Boolean));
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitErrorLines.set(['Lutfen tum zorunlu alanlari gecerli sekilde doldurun.']);
      return;
    }

    if (this.editItem != null && (this.editItem.id == null || this.editItem.id < 1)) {
      this.submitErrorLines.set([
        'Duzenlenen haberin id bilgisi yok. Admin listesini yenileyin; API getnewsbydetails yanitinda id donmelidir.',
      ]);
      return;
    }

    const value = this.form.getRawValue();
    const cat = this.categoryOptions().find((c) => c.id === value.categoryId);
    const auth = this.authorOptions().find((a) => a.id === value.authorId);
    const payload: NewsDetailDto = {
      title: value.title,
      content: value.content,
      imageUrl: value.imageUrl,
      spotText: value.spotText,
      status: value.status,
      categoryId: value.categoryId,
      authorId: value.authorId,
      categoryName: cat?.name ?? '',
      authorName: auth?.name ?? '',
      publishDate: new Date().toISOString(),
      viewCount: this.editItem?.viewCount ?? 0,
      ...(this.editItem?.id != null && this.editItem.id > 0 ? { id: this.editItem.id } : {}),
    };

    const request$ = this.editItem ? this.newsService.updateNews(payload) : this.newsService.addNews(payload);
    this.isSaving.set(true);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            const lines =
              response.errors?.length && response.errors.length > 0
                ? response.errors
                : response.message
                  ? [response.message]
                  : ['Kaydetme islemi tamamlanamadi.'];
            this.submitErrorLines.set(lines);
            return;
          }
          this.saved.emit();
          this.router.navigateByUrl('/admin');
        },
        error: () => {
          this.submitErrorLines.set(['Sunucuya ulasilamadi. Lutfen tekrar deneyin.']);
        },
      });
  }

  private statusToFormSelect(status: string | number | undefined): 'Draft' | 'Published' {
    const s = String(status ?? 'Draft').trim().toLowerCase();
    if (s === 'published' || s === '2') {
      return 'Published';
    }
    return 'Draft';
  }

  private loadLookups(): void {
    this.isLookupsLoading.set(true);
    forkJoin({
      categories: this.newsService.getCategoryOptions().pipe(catchError(() => of([] as NamedEntityOption[]))),
      authors: this.newsService.getAuthorOptions().pipe(catchError(() => of([] as NamedEntityOption[]))),
    })
      .pipe(finalize(() => this.isLookupsLoading.set(false)))
      .subscribe(({ categories, authors }) => {
        this.categoryOptions.set(categories);
        this.authorOptions.set(authors);
        this.applyEditItemIdsFromNames();
      });
  }

  /** API sadece isim donduruyorsa, secim listesinden id eslenir. */
  private applyEditItemIdsFromNames(): void {
    const item = this.editItem;
    if (!item) {
      return;
    }

    const cats = this.categoryOptions();
    const auths = this.authorOptions();
    let categoryId = item.categoryId ?? this.form.getRawValue().categoryId;
    if ((!categoryId || categoryId < 1) && item.categoryName) {
      const found = cats.find((c) => c.name === item.categoryName);
      categoryId = found?.id ?? 0;
    }

    let authorId = item.authorId ?? this.form.getRawValue().authorId;
    if ((!authorId || authorId < 1) && item.authorName) {
      const found = auths.find((a) => a.name === item.authorName);
      authorId = found?.id ?? 0;
    }

    if (categoryId > 0 || authorId > 0) {
      this.form.patchValue({
        categoryId: categoryId > 0 ? categoryId : this.form.getRawValue().categoryId,
        authorId: authorId > 0 ? authorId : this.form.getRawValue().authorId,
      });
    }
  }
}
