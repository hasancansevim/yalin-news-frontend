import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, retry, timeout, TimeoutError, forkJoin } from 'rxjs';

import { parseHttpErrorMessages } from '../http/parse-api-error';
import { environment } from '../../../environments/environment';
import { NamedEntityOption } from '../../shared/models/named-entity-option';
import { NewsDetailDto } from '../../shared/models/news-detail-dto';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  /** HTTP hata / validasyon satirlari (basarili yanitta yok) */
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly getAllUrl = `${this.apiBaseUrl}/api/news/getall`;
  private readonly addUrl = `${this.apiBaseUrl}/api/News/add`;
  private readonly updateUrl = `${this.apiBaseUrl}/api/News/update`;
  private readonly deleteUrl = `${this.apiBaseUrl}/api/News/delete`;
  private readonly categoriesUrl = `${this.apiBaseUrl}/api/categories/getall`;
  private readonly categoriesFallbackUrl = `${this.apiBaseUrl}/api/categories`;
  private readonly categoriesLegacyFallbackUrl = `${this.apiBaseUrl}/categories`;
  private readonly authorsUrl = `${this.apiBaseUrl}/api/authors/getall`;
  private readonly authorsFallbackUrl = `${this.apiBaseUrl}/api/Authors/getall`;
  private readonly authorsFallback2Url = `${this.apiBaseUrl}/api/Author/getall`;

  getNewsByDetails(page: number = 1, pageSize: number = 10): Observable<ApiResponse<NewsDetailDto[]>> {
    const url = `${this.apiBaseUrl}/api/News/getnewsbydetails?page=${page}&pageSize=${pageSize}`;
    return this.http.get<ApiResponse<NewsDetailDto[]>>(url).pipe(
      timeout(8000),
      retry(1),
      map((response) => this.withNormalizedNewsIds(response)),
      catchError(() =>
        of({
          success: false,
          message: 'Haber servisine su an ulasilamiyor.',
          data: [],
        }),
      ),
    );
  }

  getAllNews(): Observable<ApiResponse<NewsDetailDto[]>> {
    const cacheBuster = `?_t=${new Date().getTime()}`;
    const url = `${this.getAllUrl}${cacheBuster}`;
    const news$ = this.http.get<ApiResponse<NewsDetailDto[]>>(url).pipe(
      timeout(8000),
      retry(1),
      map((response) => this.withNormalizedNewsIds(response)),
      catchError(() =>
        of({
          success: false,
          message: 'Haber servisine su an ulasilamiyor.',
          data: [],
        } as ApiResponse<NewsDetailDto[]>),
      ),
    );

    const categories$ = this.getCategoryOptions();
    const authors$ = this.getAuthorOptions();

    return forkJoin({
      newsResponse: news$,
      categories: categories$,
      authors: authors$
    }).pipe(
      map(({ newsResponse, categories, authors }) => {
        if (!newsResponse.success || !newsResponse.data) return newsResponse;
        
        newsResponse.data = newsResponse.data.map(item => {
          let statusStr = item.status;
          if (item.status === 1 || String(item.status) === '1') statusStr = 'Draft';
          if (item.status === 2 || String(item.status) === '2') statusStr = 'Published';

          const cat = categories.find(c => c.id === item.categoryId);
          const auth = authors.find(a => a.id === item.authorId);

          return {
            ...item,
            status: statusStr,
            categoryName: cat ? cat.name : (item.categoryName || 'Bilinmeyen'),
            authorName: auth ? auth.name : (item.authorName || 'Bilinmeyen')
          };
        });

        return newsResponse;
      })
    );
  }

  addNews(payload: NewsDetailDto): Observable<ApiResponse<NewsDetailDto>> {
    const body = this.toNewsApiBody(payload, false);
    return this.http.post<ApiResponse<NewsDetailDto>>(this.addUrl, body).pipe(
      timeout(30_000),
      catchError((err) => of(this.mapMutationFailure<NewsDetailDto>(err))),
    );
  }

  updateNews(payload: NewsDetailDto): Observable<ApiResponse<NewsDetailDto>> {
    const body = this.toNewsApiBody(payload, true);
    return this.http.put<ApiResponse<NewsDetailDto>>(this.updateUrl, body).pipe(
      timeout(30_000),
      catchError((err) => of(this.mapMutationFailure<NewsDetailDto>(err))),
    );
  }

  deleteNews(payload: NewsDetailDto): Observable<ApiResponse<null>> {
    const body = this.toNewsApiBody(payload, true);
    return this.http
      .delete<ApiResponse<null>>(this.deleteUrl, {
        body,
      })
      .pipe(
        timeout(30_000),
        catchError((err) => of(this.mapMutationFailure<null>(err))),
      );
  }

  getCategories(): Observable<string[]> {
    return this.getCategoryOptions().pipe(
      map((opts) => opts.map((o) => o.name)),
    );
  }

  getCategoryOptions(): Observable<NamedEntityOption[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.categoriesUrl).pipe(
      timeout(8000),
      retry(1),
      map((response) => this.parseNamedEntityResponse(response)),
      catchError(() =>
        this.http.get<ApiResponse<unknown[]>>(this.categoriesFallbackUrl).pipe(
          timeout(8000),
          retry(1),
          map((response) => this.parseNamedEntityResponse(response)),
          catchError(() =>
            this.http.get<ApiResponse<unknown[]>>(this.categoriesLegacyFallbackUrl).pipe(
              timeout(8000),
              retry(1),
              map((response) => this.parseNamedEntityResponse(response)),
              catchError(() => of([])),
            ),
          ),
        ),
      ),
    );
  }

  getAuthorOptions(): Observable<NamedEntityOption[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.authorsUrl).pipe(
      timeout(8000),
      retry(1),
      map((response) => this.parseNamedEntityResponse(response)),
      catchError(() =>
        this.http.get<ApiResponse<unknown[]>>(this.authorsFallbackUrl).pipe(
          timeout(8000),
          retry(1),
          map((response) => this.parseNamedEntityResponse(response)),
          catchError(() =>
            this.http.get<ApiResponse<unknown[]>>(this.authorsFallback2Url).pipe(
              timeout(8000),
              retry(1),
              map((response) => this.parseNamedEntityResponse(response)),
              catchError(() => of([])),
            ),
          ),
        ),
      ),
    );
  }

  private parseNamedEntityResponse(response: ApiResponse<unknown[]> | null | undefined): NamedEntityOption[] {
    if (!response?.success || !Array.isArray(response.data)) {
      return [];
    }

    const out: NamedEntityOption[] = [];
    for (const item of response.data) {
      const parsed = this.extractNamedEntity(item);
      if (parsed) {
        out.push(parsed);
      }
    }
    return out;
  }

  private extractNamedEntity(item: unknown): NamedEntityOption | null {
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const idRaw = record['id'] ?? record['categoryId'] ?? record['userId'];
      const id = typeof idRaw === 'number' ? idRaw : Number(idRaw);
      if (!Number.isFinite(id) || id <= 0) {
        return null;
      }

      const name =
        this.coerceString(record['name']) ??
        this.coerceString(record['categoryName']) ??
        this.coerceString(record['authorName']) ??
        this.coerceString(record['title']) ??
        this.joinAuthorName(record);
      if (!name) {
        return null;
      }
      return { id, name: name.trim() };
    }

    return null;
  }

  private joinAuthorName(record: Record<string, unknown>): string | null {
    const first = this.coerceString(record['firstName']);
    const last = this.coerceString(record['lastName']);
    if (first || last) {
      return [first, last].filter(Boolean).join(' ').trim();
    }
    return this.coerceString(record['fullName']);
  }

  private coerceString(v: unknown): string | null {
    if (typeof v === 'string' && v.trim()) {
      return v.trim();
    }
    return null;
  }

  /** API sozlesmesi: cogu .NET projesinde 1=Taslak, 2=Yayinda (liste filtreleriyle uyumlu). */
  private withNormalizedNewsIds(response: ApiResponse<NewsDetailDto[]>): ApiResponse<NewsDetailDto[]> {
    if (!response.success || !Array.isArray(response.data)) {
      return response;
    }
    return {
      ...response,
      data: response.data.map((item) => this.normalizeNewsItemIds(item)),
    };
  }

  private normalizeNewsItemIds(item: NewsDetailDto): NewsDetailDto {
    if (item.id != null && item.id > 0) {
      return this.normalizeRelatedIds(item);
    }
    const raw = item as unknown as Record<string, unknown>;
    const id = coercePositiveInt(raw['id'] ?? raw['newsId'] ?? raw['Id'] ?? raw['NewsId']);
    const merged = id != null ? { ...item, id } : item;
    return this.normalizeRelatedIds(merged);
  }

  private normalizeRelatedIds(item: NewsDetailDto): NewsDetailDto {
    const raw = item as unknown as Record<string, unknown>;
    let categoryId = item.categoryId;
    if (categoryId == null || categoryId < 1) {
      const c = coercePositiveInt(raw['categoryId'] ?? raw['CategoryId']);
      if (c != null) {
        categoryId = c;
      }
    }
    let authorId = item.authorId;
    if (authorId == null || authorId < 1) {
      const a = coercePositiveInt(raw['authorId'] ?? raw['AuthorId']);
      if (a != null) {
        authorId = a;
      }
    }
    if (categoryId != null || authorId != null) {
      return {
        ...item,
        ...(categoryId != null ? { categoryId } : {}),
        ...(authorId != null ? { authorId } : {}),
      };
    }
    return item;
  }

  private mapStatusToApi(status: string | number): number {
    const s = String(status).trim().toLowerCase();
    if (s === 'published' || s === '2') {
      return 2;
    }
    if (s === 'draft' || s === '1') {
      return 1;
    }
    const n = Number(status);
    return Number.isFinite(n) ? n : 1;
  }

  private toNewsApiBody(detail: NewsDetailDto, isUpdate: boolean): Record<string, unknown> {
    const body: Record<string, unknown> = {
      title: detail.title,
      content: detail.content,
      imageUrl: detail.imageUrl,
      publishDate: detail.publishDate,
      categoryName: detail.categoryName,
      authorName: detail.authorName,
      categoryId: detail.categoryId ?? 0,
      authorId: detail.authorId ?? 0,
      spotText: detail.spotText,
      viewCount: detail.viewCount,
      status: this.mapStatusToApi(detail.status),
    };

    if (isUpdate && detail.id != null && detail.id > 0) {
      body['id'] = detail.id;
    }

    return body;
  }

  private mapMutationFailure<T>(err: unknown): ApiResponse<T> {
    if (err instanceof TimeoutError) {
      return {
        success: false,
        message: 'Sunucu belirlenen surede yanit vermedi. Baglantiyi kontrol edin.',
        data: null as T,
      };
    }

    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return {
          success: false,
          message:
            'APIye ulasilamadi. Gelistirmede apiBaseUrl bos olmali ve `ng serve` proxy kullanilmali; ya da backend CORS izinlerini kontrol edin.',
          data: null as T,
        };
      }

      const lines = parseHttpErrorMessages(err);
      const message =
        lines.length > 0
          ? lines.join(' • ')
          : this.legacyFormatHttpErrorPayload(err) || err.message || `Islem basarisiz (HTTP ${err.status}).`;
      return {
        success: false,
        message,
        errors: lines.length ? lines : undefined,
        data: null as T,
      };
    }

    return {
      success: false,
      message: 'Beklenmeyen bir hata olustu.',
      data: null as T,
    };
  }

  private legacyFormatHttpErrorPayload(err: HttpErrorResponse): string {
    const raw = err.error;
    if (raw == null) {
      return '';
    }

    if (typeof raw === 'string') {
      const text = raw.trim();
      if (!text.startsWith('{')) {
        return text;
      }
      try {
        const lines = parseProblemDetailsObjectFlat(JSON.parse(text) as unknown);
        return lines.join(' ');
      } catch {
        return text;
      }
    }

    if (typeof raw === 'object') {
      return parseProblemDetailsObjectFlat(raw).join(' ');
    }

    return '';
  }
}

function coercePositiveInt(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
    return Math.trunc(v);
  }
  if (typeof v === 'string') {
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && n > 0) {
      return n;
    }
  }
  return undefined;
}

function parseProblemDetailsObjectFlat(body: unknown): string[] {
  if (!body || typeof body !== 'object') {
    return [];
  }

  const o = body as Record<string, unknown>;
  const messages: string[] = [];

  if (typeof o['message'] === 'string' && o['message'].trim()) {
    messages.push(o['message'].trim());
  }

  const errors = o['errors'];
  if (errors && typeof errors === 'object') {
    for (const [key, val] of Object.entries(errors as Record<string, unknown>)) {
      const prefix = key ? `${key}: ` : '';
      if (Array.isArray(val)) {
        for (const msg of val) {
          if (typeof msg === 'string' && msg.trim()) {
            messages.push(`${prefix}${msg.trim()}`);
          }
        }
      } else if (typeof val === 'string' && val.trim()) {
        messages.push(`${prefix}${val.trim()}`);
      }
    }
  }

  if (messages.length) {
    return messages;
  }

  if (typeof o['title'] === 'string' && o['title'].trim()) {
    messages.push(o['title'].trim());
  }
  if (typeof o['detail'] === 'string' && o['detail'].trim()) {
    messages.push(o['detail'].trim());
  }

  return messages;
}
