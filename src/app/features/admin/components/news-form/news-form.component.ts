import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NewsDetailDto } from '../../../../shared/models/news-detail-dto';

@Component({
  selector: 'app-admin-news-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './news-form.component.html',
})
export class NewsFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  @Input() editItem: NewsDetailDto | null = null;
  @Output() save = new EventEmitter<NewsDetailDto>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(8)]],
    categoryName: ['', Validators.required],
    authorName: ['', Validators.required],
    imageUrl: ['', Validators.required],
    spotText: ['', [Validators.required, Validators.minLength(12)]],
    content: ['', [Validators.required, Validators.minLength(40)]],
    status: ['Draft', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['editItem']) {
      return;
    }

    if (this.editItem) {
      this.form.patchValue({
        title: this.editItem.title,
        categoryName: this.editItem.categoryName,
        authorName: this.editItem.authorName,
        imageUrl: this.editItem.imageUrl,
        spotText: this.editItem.spotText,
        content: this.editItem.content,
        status: this.editItem.status,
      });
      return;
    }

    this.form.reset({
      title: '',
      categoryName: '',
      authorName: '',
      imageUrl: '',
      spotText: '',
      content: '',
      status: 'Draft',
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      ...value,
      publishDate: new Date().toISOString(),
      viewCount: this.editItem?.viewCount ?? 0,
    });
  }
}
