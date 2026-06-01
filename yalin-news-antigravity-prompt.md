# YalinNews — Antigravity Frontend Redesign Prompt

## Proje Bağlamı

YalinNews, yapay zeka destekli Türkçe bir haber platformudur. Backend (.NET 8 Web API) ve tüm Angular servisleri/modelleri değişmeden kalıyor. Sadece görsel katman yeniden tasarlanacak. Mevcut Angular 17 Signals mimarisi, routing yapısı, HTTP servisleri ve veri modelleri tamamen korunacak.

---

## Mevcut Veri Modelleri (Değişmeyecek)

```typescript
// News modeli
{
  id: number
  title: string
  spotText: string      // 1-2 cümlelik özet
  content: string
  imageUrl: string
  publishDate: string
  categoryId: number
  authorId: number
  status: number        // 1=Draft, 2=Published
  viewCount: number
}

// Category modeli
{ id: number, name: string }
// Kategoriler: Teknoloji(1), Ekonomi & Finans(2), Dünya Gündemi(3),
//              Yazılım & Yapay Zeka(4), Oyun Dünyası(5), Bilim(6)

// Author modeli
{ id: number, firstName: string, lastName: string,
  biography: string, imageUrl: string, isActive: boolean }
```

---

## Tasarım Yönü: "Editorial Dark Luxury"

### Referans Nokta
The Guardian'ın editoryal grid anlayışı + Financial Times'ın tipografik ciddiyeti + Le Monde'un Fransız soğukluğu. Ama hepsi **koyu, derin, Türkçe bir medya kimliğiyle** yeniden yorumlanmış.

### Renk Paleti
```
Arkaplan (ana):     #0A0A0B   — neredeyse siyah, soğuk
Yüzey (kartlar):    #111113   — bir ton açık
Kenarlık:           #1E1E22   — ince, nefes alan separator
Accent (ana):       #C8A96E   — antik altın, gazeteciliğin rengi
Accent (ikincil):   #4A7FA5   — soğuk çelik mavisi
Metin (birincil):   #F0EDE8   — kırık beyaz, göz yormayan
Metin (ikincil):    #8A8680   — warm gray
Kategori badge:     Her kategori için farklı, soluk ton
```

### Tipografi
```
Display / Başlık:   "Playfair Display" — serif, gazeteci ağırlığı
UI / Navigation:    "DM Mono" — monospace, teknik soğukluk
Body / İçerik:      "Source Serif 4" — okunabilirlik odaklı serif
Kategori etiket:    "DM Mono" uppercase tracked
```

---

## Sayfa Tasarımları

### 1. Ana Sayfa (Home)

**Header / Navbar:**
- Sol: `YALIN` logotype — Playfair Display, letter-spacing: -0.02em, altın renk
- Orta: Kategori navigasyonu — DM Mono, uppercase, 11px, tracked. Aktif kategori altın alt çizgi ile
- Sağ: Tarih + Dark/Light toggle + arama ikonu
- Navbar altında ince bir `#C8A96E` gradient çizgi (1px)
- Scroll'da navbar `backdrop-blur` + hafif transparan arkaplan

**Hero Section (En son haber):**
- Tam genişlik, yükseklik vh*75
- Haberin görseli full-bleed arkaplan, üstünde `linear-gradient(to top, #0A0A0B 40%, transparent)`
- Sol altta: Kategori badge (DM Mono, uppercase) → Başlık (Playfair Display, 52px, max 2 satır) → spotText → Yazar adı + tarih + okuma süresi
- Sağ altta: Büyük okunma sayısı — `1.2K` formatında, DM Mono, soluk altın
- Hover'da görsel çok hafif zoom (scale 1.02, transition 800ms ease)

**İkincil Haberler Grid:**
- Hero'nun hemen altında 3 kolonlu grid
- Her kart: görsel (aspect-ratio 16/9) + kategori etiketi + başlık (Playfair, 18px) + spotText + yazar + tarih
- Kartlar arası separator: `#1E1E22` renk, 1px
- Hover: kart hafif yukarı (translateY -4px) + başlık rengi kırık beyazdan altına döner

**Kategori Şeridi:**
- Grid'den sonra yatay scroll kategori şeridi
- Her kategori: büyük numara (DM Mono, 48px, soluk) + kategori adı + "→" oku
- Tıklayınca o kategorinin haberleri aşağıda listelenir

**Load More:**
- Buton değil — sayfanın altında ince çizgi ve `"Daha fazla yükle ↓"` metni, DM Mono
- Hover'da çizgi altın renge döner

---

### 2. Haber Detay Sayfası

**Layout:** Tek kolon, merkezi hizalı, max-width: 720px

**Üst:**
- Breadcrumb: `Ana Sayfa / Kategori / Başlık` — DM Mono, 11px, soluk
- Kategori badge + yayın tarihi
- Başlık: Playfair Display, 42px, line-height: 1.2
- spotText: Source Serif 4, 20px, italic, `#8A8680` renk — lede paragraf gibi
- Yazar kartı: küçük avatar + ad + biyografinin ilk cümlesi + "Yalin AI" rozeti (altın)

**Görsel:**
- Full-width, max-height: 480px, object-fit: cover
- Altta sağda kaynak linki (DM Mono, 10px)

**İçerik:**
- Source Serif 4, 18px, line-height: 1.8
- İlk paragraf dropcap (büyük harf, Playfair, altın renk)
- `---` separator → "Bu içerik Yalin AI tarafından özetlenmiştir" notu — italik, soluk

**Sağ kenar (sticky sidebar — desktop only):**
- "Bunları da okuyun" — aynı kategoriden 3 haber
- Okuma ilerlemesi: ince dikey progress bar, sol kenarda, altın renk

---

### 3. Admin Paneli

**Sidebar navigasyon:**
- Koyu arkaplan (`#0A0A0B`), sol tarafta sabit
- `YALIN ADMIN` logotype üstte
- Menü ikonları + etiketler: Haberler, Kategoriler, Yazarlar, İstatistikler
- Aktif öğe: sol kenarda altın dikey çizgi

**Haber Listesi:**
- Tablo değil — her haber bir satır kart
- Sol: küçük thumbnail + başlık + spotText (tek satır, ellipsis)
- Orta: Kategori badge + Yazar
- Sağ: Status pill (Draft=sarı, Published=yeşil) + viewCount + Onayla/Reddet butonları
- Onayla butonu: `border: 1px solid #C8A96E`, hover'da doluyor

**İstatistik kartları (üstte):**
- Toplam haber sayısı / Bugün eklenen / En çok okunan / Draft bekleyen
- Her kart: büyük sayı (DM Mono, 36px) + etiket + mini trend çizgisi

---

## Mikro-Etkileşimler

```
Sayfa yüklenme:   Navbar önce, sonra hero içeriği staggered fade-in (100ms aralıklı)
Kart hover:       translateY(-4px) + box-shadow derinleşir (200ms ease)
Başlık hover:     renk geçişi #F0EDE8 → #C8A96E (150ms)
Kategori seçimi:  Active tab altındaki çizgi kayar (sliding indicator)
Load more:        Yeni kartlar aşağıdan fade+slide ile gelir
Image yüklenme:   Blur-up efekti (önce blurlu placeholder, sonra net görsel)
```

---

## Kategori Renk Kodları

```typescript
const CATEGORY_COLORS = {
  1: { bg: '#1A1710', text: '#C8A96E', label: 'Teknoloji' },
  2: { bg: '#0F1A14', text: '#4CAF82', label: 'Ekonomi & Finans' },
  3: { bg: '#0F1318', text: '#4A7FA5', label: 'Dünya Gündemi' },
  4: { bg: '#150F1A', text: '#9B6ED4', label: 'Yazılım & Yapay Zeka' },
  5: { bg: '#1A0F0F', text: '#E05C5C', label: 'Oyun Dünyası' },
  6: { bg: '#0F1618', text: '#4ABFBF', label: 'Bilim' },
}
```

---

## Teknik Notlar (Angular 17)

- Tüm HTTP servisleri, modeller ve routing değişmez
- Sadece `.component.html` ve `.component.scss` dosyaları güncellenir
- CSS custom properties (`--color-accent`, `--font-display` vb.) `styles.scss`'de tanımlanır
- Google Fonts import: `Playfair+Display:wght@400;700;900`, `DM+Mono`, `Source+Serif+4:ital,wght@0,400;1,400`
- Angular Signals ile gelen reaktif state'ler korunur, sadece template güncellenir
- Dark mode varsayılan; Light mode toggle için `[data-theme="light"]` selector kullanılır

---

## Light Mode (Opsiyonel Toggle)

```
Arkaplan:   #FAFAF8   — kırık beyaz, gazete kağıdı tonu
Yüzey:      #F2F0EB
Kenarlık:   #E0DDD8
Metin:      #1A1A1A
Accent:     #8B6914   — altın koyulaşır
```

---

## Genel Ton

Bu bir blog değil. Bu bir **medya kurumu**. Her piksel bunu yansıtmalı:
- Fazla animasyon yok, var olanlar kasıtlı
- Fazla renk yok, var olanlar anlamlı  
- Her boşluk bir kararın sonucu
- Tipografi hiyerarşisi asla kırılmaz
- "Yapay zeka yaptı" değil, "editöryal ekip onayladı" hissi
