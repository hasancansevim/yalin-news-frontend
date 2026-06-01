import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './news.service';
import { Author } from '../../shared/models/author';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  getAll(): Observable<ApiResponse<Author[]>> {
    return this.http.get<ApiResponse<Author[]>>(`${this.apiBaseUrl}/api/Authors/getall`).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Yazarlar yüklenemedi.', data: [] } as ApiResponse<Author[]>))
    );
  }

  add(author: Author): Observable<ApiResponse<Author>> {
    return this.http.post<ApiResponse<Author>>(`${this.apiBaseUrl}/api/Authors/add`, author).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Yazar eklenemedi.', data: null as any } as ApiResponse<Author>))
    );
  }

  update(author: Author): Observable<ApiResponse<Author>> {
    return this.http.put<ApiResponse<Author>>(`${this.apiBaseUrl}/api/Authors/update`, author).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Yazar güncellenemedi.', data: null as any } as ApiResponse<Author>))
    );
  }

  delete(author: Author): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/api/Authors/delete`, { body: author }).pipe(
      timeout(8000),
      catchError(() => of({ success: false, message: 'Yazar silinemedi.', data: null } as ApiResponse<null>))
    );
  }
}
