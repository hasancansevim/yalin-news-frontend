import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, retry, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly newsUrl =
    `${environment.apiBaseUrl}/api/News/getnewsbydetails?page=1&pageSize=10`;

  getNewsByDetails(): Observable<ApiResponse<NewsDetailDto[]>> {
    return this.http.get<ApiResponse<NewsDetailDto[]>>(this.newsUrl).pipe(
      timeout(8000),
      retry(1),
      catchError(() =>
        of({
          success: false,
          message: 'Haber servisine su an ulasilamiyor.',
          data: [],
        }),
      ),
    );
  }
}
