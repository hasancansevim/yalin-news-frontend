import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Author } from '../../../../shared/models/author';
import { AuthorService } from '../../../../core/services/author.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-author-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="border border-border p-8">
        <div class="mb-8 flex items-center justify-between border-b border-border pb-4">
          <h2 class="font-display text-xl font-bold text-text-primary">Yazar Yönetimi</h2>
          <button type="button" class="h-8 px-4 font-ui text-[11px] uppercase tracking-widest border border-accent-main bg-accent-main text-bg-main hover:bg-transparent hover:text-accent-main" (click)="startAdd()">Yeni Yazar Ekle</button>
        </div>

        @if (isEditing() && activeEdit()) {
          <div class="border border-border p-6 mb-8 bg-surface/50 grid gap-6">
            <h3 class="font-display text-lg font-bold text-text-primary">{{ activeEdit()?.id === 0 ? 'Yeni Yazar' : 'Yazar Düzenle' }}</h3>
            
            <div class="grid md:grid-cols-2 gap-6">
              <label class="space-y-2">
                <span class="font-ui text-[11px] uppercase tracking-widest text-text-secondary">Ad</span>
                <input type="text" [(ngModel)]="activeEdit()!.firstName" class="w-full border-b border-border bg-transparent px-0 py-2 font-body text-[16px] text-text-primary outline-none transition-colors focus:border-accent-main" />
              </label>
              <label class="space-y-2">
                <span class="font-ui text-[11px] uppercase tracking-widest text-text-secondary">Soyad</span>
                <input type="text" [(ngModel)]="activeEdit()!.lastName" class="w-full border-b border-border bg-transparent px-0 py-2 font-body text-[16px] text-text-primary outline-none transition-colors focus:border-accent-main" />
              </label>
            </div>
            
            <label class="space-y-2">
              <span class="font-ui text-[11px] uppercase tracking-widest text-text-secondary">E-posta</span>
              <input type="email" [(ngModel)]="activeEdit()!.email" class="w-full border-b border-border bg-transparent px-0 py-2 font-body text-[16px] text-text-primary outline-none transition-colors focus:border-accent-main" />
            </label>

            <label class="space-y-2">
              <span class="font-ui text-[11px] uppercase tracking-widest text-text-secondary">Biyografi</span>
              <textarea [(ngModel)]="activeEdit()!.biography" rows="2" class="w-full border border-border bg-transparent px-4 py-3 font-body text-[16px] text-text-primary outline-none transition-colors focus:border-accent-main resize-y"></textarea>
            </label>
            
            <label class="space-y-2">
              <span class="font-ui text-[11px] uppercase tracking-widest text-text-secondary">Görsel URL</span>
              <input type="text" [(ngModel)]="activeEdit()!.imageUrl" class="w-full border-b border-border bg-transparent px-0 py-2 font-body text-[16px] text-text-primary outline-none transition-colors focus:border-accent-main" />
            </label>

            <div class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="activeEdit()!.isActive" id="isActiveCheck" class="w-4 h-4 accent-accent-main bg-transparent border-border" />
              <label for="isActiveCheck" class="font-ui text-[11px] uppercase tracking-widest text-text-primary cursor-pointer">Aktif mi?</label>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t border-border">
              <button type="button" class="px-6 py-2 font-ui text-[11px] uppercase tracking-widest border border-border text-text-secondary hover:border-text-primary hover:text-text-primary" (click)="cancelEdit()">İptal</button>
              <button type="button" class="px-6 py-2 font-ui text-[11px] uppercase tracking-widest border border-accent-main bg-accent-main text-bg-main hover:bg-transparent hover:text-accent-main" (click)="save()">Kaydet</button>
            </div>
          </div>
        }

        <div class="space-y-3">
          @for (item of authors(); track item.id) {
            <div class="flex items-center justify-between gap-6 border-b border-border py-4 transition-colors hover:bg-surface/50 px-4 -mx-4">
              <div class="flex items-center gap-4">
                @if (item.imageUrl) {
                  <div class="h-12 w-12 shrink-0 rounded-full bg-surface overflow-hidden border border-border">
                    <img [src]="item.imageUrl" alt="" class="h-full w-full object-cover grayscale transition-all hover:grayscale-0" />
                  </div>
                } @else {
                  <div class="h-12 w-12 shrink-0 rounded-full bg-surface border border-border flex items-center justify-center font-display text-accent-main text-lg">{{ item.firstName.charAt(0) }}</div>
                }
                <div>
                  <div class="font-display text-[16px] font-bold text-text-primary">{{ item.firstName }} {{ item.lastName }}</div>
                  <div class="font-ui text-[11px] text-text-secondary">{{ item.email }}</div>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <span class="font-ui text-[10px] uppercase tracking-widest border px-2 py-0.5" [class]="item.isActive ? 'border-[#4CAF82] text-[#4CAF82]' : 'border-[#E05C5C] text-[#E05C5C]'">{{ item.isActive ? 'Aktif' : 'Pasif' }}</span>
                <div class="flex items-center gap-2">
                  <button type="button" class="h-8 px-4 font-ui text-[11px] uppercase tracking-widest transition-all border border-accent-main text-accent-main hover:bg-accent-main hover:text-bg-main" (click)="startEdit(item)">Düzenle</button>
                  <button type="button" class="h-8 w-8 flex items-center justify-center border border-border text-text-secondary transition-all hover:border-[#E05C5C] hover:text-[#E05C5C]" (click)="deleteAuthor(item)" title="Sil">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="text-center p-8 text-text-secondary font-body">Yazar bulunamadı.</div>
          }
        </div>
      </div>
    </div>
  `
})
export class AuthorManagementComponent implements OnInit {
  private readonly authorService = inject(AuthorService);
  private readonly notificationService = inject(NotificationService);

  readonly authors = signal<Author[]>([]);
  readonly activeEdit = signal<Author | null>(null);
  readonly isEditing = signal(false);

  ngOnInit() {
    this.loadAuthors();
  }

  loadAuthors() {
    this.authorService.getAll().subscribe(res => {
      if (res.success) this.authors.set(res.data);
      else this.notificationService.show(res.message || 'Yazarlar yüklenemedi', 'error');
    });
  }

  startAdd() {
    this.activeEdit.set({ id: 0, firstName: '', lastName: '', email: '', biography: '', imageUrl: '', isActive: true });
    this.isEditing.set(true);
  }

  startEdit(auth: Author) {
    this.activeEdit.set({ ...auth });
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.activeEdit.set(null);
    this.isEditing.set(false);
  }

  save() {
    const auth = this.activeEdit();
    if (!auth) return;
    if (!auth.firstName.trim() || !auth.lastName.trim()) {
      this.notificationService.show('Ad ve Soyad boş olamaz', 'warning');
      return;
    }
    
    if (auth.id === 0) {
      this.authorService.add(auth).subscribe(res => {
        if (res.success) {
          this.notificationService.show('Yazar başarıyla eklendi', 'success');
          this.loadAuthors();
          this.cancelEdit();
        } else {
          this.notificationService.show(res.message || 'Hata oluştu', 'error');
        }
      });
    } else {
      this.authorService.update(auth).subscribe(res => {
        if (res.success) {
          this.notificationService.show('Yazar başarıyla güncellendi', 'success');
          this.loadAuthors();
          this.cancelEdit();
        } else {
          this.notificationService.show(res.message || 'Hata oluştu', 'error');
        }
      });
    }
  }

  deleteAuthor(auth: Author) {
    if (!confirm('Bu yazarı silmek istediğinize emin misiniz?')) return;
    this.authorService.delete(auth).subscribe(res => {
      if (res.success) {
        this.notificationService.show('Yazar silindi', 'success');
        this.loadAuthors();
      } else {
        this.notificationService.show(res.message || 'Hata oluştu', 'error');
      }
    });
  }
}
