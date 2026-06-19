import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Favorite {
  id?: number;
  newsId: number;
  userId: number;
}

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/Favorites`;

  getAllByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getallbyuserid?userId=${userId}`);
  }
  
  getAllByNewsId(newsId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getallbynewsid?newsId=${newsId}`);
  }

  add(favorite: Favorite): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, favorite);
  }

  delete(favorite: Favorite): Observable<any> {
    return this.http.request<any>('delete', `${this.apiUrl}/delete`, { body: favorite });
  }
}
