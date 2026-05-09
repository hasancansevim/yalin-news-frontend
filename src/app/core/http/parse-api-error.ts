import { HttpErrorResponse } from '@angular/common/http';

/**
 * HTTP hata govdesinden kullaniciya gosterilecek satirlari cikarir.
 * FluentValidation metni, ProblemDetails ve ApiResponse.message desteklenir.
 */
export function parseHttpErrorMessages(err: HttpErrorResponse): string[] {
  const raw = err.error;

  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text) {
      return [];
    }
    const fluent = parseFluentValidationText(text);
    if (fluent.length) {
      return dedupeMessages(fluent);
    }
    if (text.startsWith('{')) {
      try {
        return dedupeMessages(parseProblemDetailsObject(JSON.parse(text) as unknown));
      } catch {
        return dedupeMessages([stripHtmlToOneLine(text) || text]);
      }
    }
    if (looksLikeHtml(text)) {
      const plain = extractTextFromDeveloperExceptionHtml(text);
      if (plain) {
        const fromPlain = parseFluentValidationText(plain);
        if (fromPlain.length) {
          return dedupeMessages(fromPlain);
        }
        const dotnet = parseDotNetExceptionSummaries(plain);
        if (dotnet.length) {
          return dedupeMessages(dotnet);
        }
        return dedupeMessages([plain.slice(0, 2000)]);
      }
      return dedupeMessages(['Sunucu hatasi (HTML yanit). Ayrinti icin tarayici ag sekmesine bakin.']);
    }
    if (/exception\s*:/i.test(text)) {
      const dotnet = parseDotNetExceptionSummaries(text);
      if (dotnet.length) {
        return dedupeMessages(dotnet);
      }
    }
    return dedupeMessages([text]);
  }

  if (raw && typeof raw === 'object') {
    return dedupeMessages(parseProblemDetailsObject(raw));
  }

  return [];
}

function dedupeMessages(messages: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of messages) {
    const t = m.trim();
    if (!t || seen.has(t)) {
      continue;
    }
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** Ornek: "FluentValidation... Validation failed: -- CategoryId: ... Severity: Error -- ..." */
/**
 * ASP.NET DeveloperExceptionPage / duz metindeki "SomeException: mesaj at ..." bloklari.
 */
function parseDotNetExceptionSummaries(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n');
  const re = /([\w.]+Exception)\s*:\s*([^\n]+)/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalized)) !== null) {
    const exName = m[1] ?? '';
    let summary = (m[2] ?? '').split(/\s+at\s+/)[0]?.trim() ?? '';
    if (!summary) {
      continue;
    }

    if (/DbUpdateConcurrencyException/i.test(exName)) {
      summary =
        'Kayit bulunamadi veya baskasi tarafindan guncellendi. Sayfayi yenileyip tekrar deneyin.';
    } else if (/yetkiniz yok/i.test(summary)) {
      summary =
        'Bu islem icin yetkiniz yok. Backend tarafinda kullaniciniza News guncelleme/silme (SecuredOperation) izni verilmeli.';
    }

    out.push(summary);
  }

  return out;
}

function parseFluentValidationText(text: string): string[] {
  if (!/validation\s+failed/i.test(text)) {
    return [];
  }
  const after = text.split(/validation\s+failed\s*:/i)[1] ?? text;
  return after
    .split(/\s*--\s+/)
    .map((s) =>
      s
        .replace(/\s*Severity:\s*Error\s*$/i, '')
        .replace(/\s*Severity:\s*Warning\s*$/i, '')
        .trim(),
    )
    .filter((s) => s.length > 0 && !/^FluentValidation\b/i.test(s) && !/^at\s+/i.test(s));
}

function parseProblemDetailsObject(body: unknown): string[] {
  if (!body || typeof body !== 'object') {
    return [];
  }

  const o = body as Record<string, unknown>;
  const out: string[] = [];

  if (typeof o['message'] === 'string' && o['message'].trim()) {
    const m = o['message'].trim();
    const fluent = parseFluentValidationText(m);
    if (fluent.length) {
      return fluent;
    }
    const dotnet = parseDotNetExceptionSummaries(m);
    if (dotnet.length) {
      return dotnet;
    }
    out.push(m);
  }

  const errors = o['errors'];
  if (errors && typeof errors === 'object') {
    for (const [key, val] of Object.entries(errors as Record<string, unknown>)) {
      const prefix = key ? `${key}: ` : '';
      if (Array.isArray(val)) {
        for (const msg of val) {
          if (typeof msg === 'string' && msg.trim()) {
            out.push(`${prefix}${msg.trim()}`);
          }
        }
      } else if (typeof val === 'string' && val.trim()) {
        out.push(`${prefix}${val.trim()}`);
      }
    }
  }

  if (out.length) {
    return out;
  }

  if (typeof o['title'] === 'string' && o['title'].trim()) {
    out.push(o['title'].trim());
  }
  if (typeof o['detail'] === 'string' && o['detail'].trim()) {
    out.push(o['detail'].trim());
  }

  return out;
}

function looksLikeHtml(text: string): boolean {
  return /<\s*html|<\s*body|<\s*div|<\s*pre/i.test(text);
}

function stripHtmlToOneLine(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** ASP.NET DeveloperExceptionPage icindeki exception metnini kabaca cikarir. */
function extractTextFromDeveloperExceptionHtml(html: string): string {
  const pre = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (pre?.[1]) {
    return pre[1].replace(/<[^>]+>/g, '').trim();
  }
  return stripHtmlToOneLine(html);
}
