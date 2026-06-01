import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../../../core/services/category.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="border border-border p-8">
        <div class="mb-8 flex items-center justify-between border-b border-border pb-4">
          <h2 class="font-display text-xl font-bold text-text-primary">Kategori Yönetimi</h2>
          <button type="button" class="h-8 px-4 font-ui text-[11px] uppercase tracking-widest border border-accent-main bg-accent-main text-bg-main hover:bg-transparent hover:text-accent-main" (click)="startAdd()">Yeni Kategori Ekle</button>
        </div>

        @if (isEditing()) {
          <div class="border border-border p-6 mb-8 bg-surface/50">
            <h3 class="font-display text-lg font-bold text-text-primary mb-4">{{ activeEdit()?.id === 0 ? 'Yeni Kategori' : 'Kategori Düzenle' }}</h3>
            <div class="flex gap-4">
              <input type="text" [(ngModel)]="editName" placeholder="Kategori Adı" class="flex-1 border-b border-border bg-transparent px-0 py-2 font-body text-[16px] text-text-primary outline-none transition-colors focus:border-accent-main" />
              <button type="button" class="px-6 py-2 font-ui text-[11px] uppercase tracking-widest border border-accent-main bg-accent-main text-bg-main hover:bg-transparent hover:text-accent-main" (click)="save()">Kaydet</button>
              <button type="button" class="px-6 py-2 font-ui text-[11px] uppercase tracking-widest border border-border text-text-secondary hover:border-text-primary hover:text-text-primary" (click)="cancelEdit()">İptal</button>
            </div>
          </div>
        }

        <div class="space-y-3">
          @for (item of categories(); track item.id) {
            <div class="flex items-center justify-between gap-6 border-b border-border py-4 transition-colors hover:bg-surface/50 px-4 -mx-4">
              <div class="font-display text-[16px] font-bold text-text-primary">{{ item.name }}</div>
              <div class="flex items-center gap-2">
                <button type="button" class="h-8 px-4 font-ui text-[11px] uppercase tracking-widest transition-all border border-accent-main text-accent-main hover:bg-accent-main hover:text-bg-main" (click)="startEdit(item)">Düzenle</button>
                <button type="button" class="h-8 w-8 flex items-center justify-center border border-border text-text-secondary transition-all hover:border-[#E05C5C] hover:text-[#E05C5C]" (click)="deleteCategory(item)" title="Sil">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="text-center p-8 text-text-secondary font-body">Kategori bulunamadı.</div>
          }
        </div>
      </div>
    </div>
  `
})
export class CategoryManagementComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly notificationService = inject(NotificationService);

  readonly categories = signal<Category[]>([]);
  readonly activeEdit = signal<Category | null>(null);
  readonly isEditing = signal(false);
  editName = '';

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(res => {
      if (res.success) this.categories.set(res.data);
      else this.notificationService.show(res.message || 'Kategoriler yüklenemedi', 'error');
    });
  }

  startAdd() {
    this.activeEdit.set({ id: 0, name: '' });
    this.editName = '';
    this.isEditing.set(true);
  }

  startEdit(cat: Category) {
    this.activeEdit.set({ ...cat });
    this.editName = cat.name;
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.activeEdit.set(null);
    this.isEditing.set(false);
  }

  save() {
    const cat = this.activeEdit();
    if (!cat) return;
    if (!this.editName.trim()) {
      this.notificationService.show('Kategori adı boş olamaz', 'warning');
      return;
    }
    
    cat.name = this.editName.trim();
    if (cat.id === 0) {
      this.categoryService.add(cat).subscribe(res => {
        if (res.success) {
          this.notificationService.show('Kategori başarıyla eklendi', 'success');
          this.loadCategories();
          this.cancelEdit();
        } else {
          this.notificationService.show(res.message || 'Hata oluştu', 'error');
        }
      });
    } else {
      this.categoryService.update(cat).subscribe(res => {
        if (res.success) {
          this.notificationService.show('Kategori başarıyla güncellendi', 'success');
          this.loadCategories();
          this.cancelEdit();
        } else {
          this.notificationService.show(res.message || 'Hata oluştu', 'error');
        }
      });
    }
  }

  deleteCategory(cat: Category) {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    this.categoryService.delete(cat).subscribe(res => {
      if (res.success) {
        this.notificationService.show('Kategori silindi', 'success');
        this.loadCategories();
      } else {
        this.notificationService.show(res.message || 'Hata oluştu', 'error');
      }
    });
  }
}
