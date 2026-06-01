import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './news.service';
import { Category } from '../../shared/models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  getAll(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiBaseUrl}/api/Categories/getall`).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Kategoriler yüklenemedi.', data: [] } as ApiResponse<Category[]>))
    );
  }

  add(category: Category): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.apiBaseUrl}/api/Categories/add`, category).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Kategori eklenemedi.', data: null as any } as ApiResponse<Category>))
    );
  }

  update(category: Category): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.apiBaseUrl}/api/Categories/update`, category).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Kategori güncellenemedi.', data: null as any } as ApiResponse<Category>))
    );
  }

  delete(category: Category): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/api/Categories/delete`, { body: category }).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Kategori silinemedi.', data: null } as ApiResponse<null>))
    );
  }
}
