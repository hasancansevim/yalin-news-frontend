# YalınNews Frontend App 📰✨

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

YalınNews Frontend projesi, kullanıcıların haberlere saniyeler içinde erişebildiği, gereksiz içeriklerden arındırılmış, modern, hızlı ve şık bir SPA (Single Page Application) haber portalı arayüzüdür. **Angular 17+** kullanılarak geliştirilmiştir.

## 🚀 Öne Çıkan Özellikler

- **Modern ve Yalın Tasarım:** Tailwind CSS kullanılarak geliştirilmiş, gereksiz görsel gürültüden uzak, tamamen odaklanmaya yönelik minimalist ve şık bir UI.
- **Karanlık Mod (Dark Mode) Desteği:** Sistem tercihine göre otomatik çalışan, göz yormayan karanlık mod entegrasyonu.
- **Dinamik İçerik Tüketimi:** Yapay zeka destekli botumuzun çektiği vurucu ve akıcı haberleri en optimum okuma deneyimiyle sunar.
- **Kullanıcı Etkileşimleri:**
  - Haberleri "Favorilere" ekleme yeteneği
  - Yorum yapabilme ve tartışmalara katılabilme
  - Rol bazlı panel yönetimi (Yöneticiler için özel Admin Paneli)
- **Responsive (Duyarlı) Tasarım:** Mobil, tablet ve masaüstü cihazlarla %100 uyumlu kusursuz okuma deneyimi.

## 🛠️ Teknoloji Yığını

- **Framework:** Angular 17+
- **Dil:** TypeScript
- **Stil Yönetimi:** Tailwind CSS (Modern, utility-first)
- **İkonlar:** Heroicons, FontAwesome
- **HTTP İstekleri:** Angular HttpClient (Interceptor'lar ile JWT güvenliği)
- **Güvenlik:** Rota Koruması (Auth Guards), Güvenli Depolama

## 📂 Proje Yapısı

Projemiz, kodun sürdürülebilirliğini sağlamak adına "Feature-based" (Özellik odaklı) modüler bir mimariyle tasarlanmıştır:

```text
src/
├── app/
│   ├── core/           # Uygulamanın belkemiği (Guards, Interceptors, Modeller, Temel Servisler)
│   ├── features/       # Bağımsız modüller (Admin, Auth, News, Profile, Favorites, Comments)
│   ├── shared/         # Tekrar kullanılabilir yapılar (Navbar, Footer, Ortak Bileşenler)
│   └── ...
├── assets/             # Statik dosyalar, logolar ve global stil tanımları
└── environments/       # Geliştirme (Local) ve Üretim (Prod) konfigürasyonları
```

## ⚙️ Ortam Değişkenleri (Environments)

Projeyi ayağa kaldırmadan önce, API bağlantısının doğru yapıldığından emin olun.
`src/environments/environment.ts` (ve `.prod.ts`) dosyaları şu şekilde yapılandırılmalıdır:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7001/api' // Backend API adresiniz
};
```

## 🚀 Kurulum & Geliştirme

Projeyi yerel ortamınızda (local) çalıştırmak için aşağıdaki adımları izleyin:

1. **Bağımlılıkları Yükleyin:**
```bash
npm install
```

2. **Geliştirme Sunucusunu Başlatın:**
```bash
npm start
```
(Ya da `ng serve` kullanabilirsiniz). Sunucu ayağa kalktıktan sonra tarayıcınızda `http://localhost:4200` adresine gidin.

3. **Üretim (Production) İçin Derleme:**
```bash
npm run build
```
Bu komut projeyi optimize ederek `dist/` klasörüne çıkarır.

## ☁️ Dağıtım (Deployment)

Proje, Vercel, Netlify veya Render gibi platformlara doğrudan deploy edilebilir.

**Vercel İçin:**
Yalnızca GitHub reponuzu bağlamanız yeterlidir. Vercel, Angular projesi olduğunu algılayacak ve `ng build` komutunu otomatik olarak koşacaktır.

## 🤝 Katkıda Bulunma

1. Projeyi **Fork** edin.
2. Yeni bir dal (branch) açın: `git checkout -b feature/harika-ozellik`
3. Değişikliklerinizi yapıp commit'leyin: `git commit -m 'feat: Harika bir özellik eklendi'`
4. Branch'inize push yapın: `git push origin feature/harika-ozellik`
5. GitHub üzerinden bir **Pull Request (PR)** açın.

---
*© 2026 YalinNews Projesi.*
