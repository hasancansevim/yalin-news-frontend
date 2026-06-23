import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Comment {
  id?: number;
  newsId: number;
  userId: number;
  userName?: string;
  content: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/Comments`;

  getAllByNewsId(newsId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getallbynewsid?newsId=${newsId}`);
  }

  add(comment: Comment): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, comment);
  }
}
