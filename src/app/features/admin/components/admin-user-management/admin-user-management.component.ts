import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: boolean;
}

export interface OperationClaim {
  id: number;
  name: string;
}

export interface UserOperationClaim {
  id: number;
  userId: number;
  operationClaimId: number;
}

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border border-border p-8 text-text-primary">
      <div class="mb-8 flex items-center justify-between border-b border-border pb-4">
        <h2 class="font-display text-xl font-bold">Kullanıcı Yönetimi</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left font-ui text-sm">
          <thead class="border-b border-border text-[11px] uppercase tracking-widest text-text-secondary">
            <tr>
              <th class="pb-3 pr-4 font-medium">Ad Soyad</th>
              <th class="pb-3 pr-4 font-medium">E-posta</th>
              <th class="pb-3 pr-4 font-medium">Yetkiler</th>
              <th class="pb-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/50">
            @for (user of users(); track user.id) {
              <tr class="transition-colors hover:bg-surface/50">
                <td class="py-4 pr-4">{{ user.firstName }} {{ user.lastName }}</td>
                <td class="py-4 pr-4">{{ user.email }}</td>
                <td class="py-4 pr-4">
                  <div class="flex gap-2 flex-wrap">
                    @for (claim of getUserClaims(user.id); track claim.id) {
                      <span class="inline-flex items-center gap-1 rounded border border-accent-main/20 bg-accent-main/10 px-2 py-0.5 text-xs text-accent-main">
                        {{ getClaimName(claim.operationClaimId) }}
                        <button (click)="removeUserClaim(claim)" class="hover:text-red-500 ml-1">
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    }
                  </div>
                </td>
                <td class="py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <select
                      #claimSelect
                      class="bg-surface border border-border text-xs px-2 py-1 rounded"
                    >
                      <option value="">Yetki Seç...</option>
                      @for (claim of availableClaims(); track claim.id) {
                        <option [value]="claim.id">{{ claim.name }}</option>
                      }
                    </select>
                    <button
                      (click)="addUserClaim(user.id, claimSelect.value); claimSelect.value = ''"
                      class="text-xs px-3 py-1 bg-accent-main text-white rounded hover:bg-accent-secondary transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminUserManagementComponent implements OnInit {
  private readonly http = inject(HttpClient);
  
  protected users = signal<User[]>([]);
  protected allClaims = signal<OperationClaim[]>([]);
  protected userClaims = signal<UserOperationClaim[]>([]);
  
  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    // Fetch users
    this.http.get<any>(`${environment.apiBaseUrl}/api/Users/getall`).subscribe(res => {
      if (res.success) this.users.set(res.data);
    });

    // Fetch operation claims
    this.http.get<any>(`${environment.apiBaseUrl}/api/OperationClaims/getall`).subscribe(res => {
      if (res.success) this.allClaims.set(res.data);
    });

    // Fetch user operation claims
    this.http.get<any>(`${environment.apiBaseUrl}/api/UserOperationClaims/getall`).subscribe(res => {
      if (res.success) this.userClaims.set(res.data);
    });
  }

  protected getUserClaims(userId: number): UserOperationClaim[] {
    return this.userClaims().filter(c => c.userId === userId);
  }

  protected getClaimName(claimId: number): string {
    const claim = this.allClaims().find(c => c.id === claimId);
    return claim ? claim.name : 'Unknown';
  }

  protected availableClaims() {
    return this.allClaims();
  }

  protected addUserClaim(userId: number, claimIdStr: string) {
    if (!claimIdStr) return;
    const claimId = parseInt(claimIdStr, 10);
    
    // Check if user already has this claim
    const hasClaim = this.userClaims().some(c => c.userId === userId && c.operationClaimId === claimId);
    if (hasClaim) return;

    const payload = { userId, operationClaimId: claimId };
    this.http.post<any>(`${environment.apiBaseUrl}/api/UserOperationClaims/add`, payload).subscribe(res => {
      if (res.success) {
        this.loadData();
      }
    });
  }

  protected removeUserClaim(claim: UserOperationClaim) {
    this.http.post<any>(`${environment.apiBaseUrl}/api/UserOperationClaims/delete`, claim).subscribe(res => {
      if (res.success) {
        this.loadData();
      }
    });
  }
}
