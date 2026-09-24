# Güvenlik ve Kod İnceleme Raporu

Bu rapor, `dunasava-cms-render` reposunun baştan sona incelenmesiyle hazırlandı.
Rapor iki bölümden oluşur:

1. **Bu branch'te düzeltilenler.** Bunlar küçük kapsamlı ve güvenli değişikliklerdir.
2. **Düzeltilmeyip önerilenler.** Bunlar riskli ya da büyük değişiklik gerektiren bulgulardır. Öncelik sırasıyla (kritik / yüksek / orta / düşük) listelendi.

---

## 1. Bu branch'te yapılan düzeltmeler

| # | Önem | Dosya | Sorun | Yapılan düzeltme |
|---|------|-------|-------|------------------|
| D1 | Kritik (işlevsel) | `api/boot.ts`, `api/lib/vite.ts` | Production'da `/uploads/*` istekleri `UPLOADS_ORIGIN` adresine (varsayılanı sunucunun kendi adresi `https://dunasava-cms.onrender.com`) proxy'leniyordu. Sunucu kendine istek atıyor, bu da sonsuz bir döngü oluşturuyordu: istekler zaman aşımına kadar birikiyor, sonunda yer tutucu görsel dönüyordu. Ayrıca `serveStatic({ root: uploadsDir })` dosyayı yanlış yolda arıyordu: `/var/data/uploads/uploads/<dosya>`. Bu yüzden yüklenen görseller diskte olsa bile sunulamıyordu. | Diskte bulunan dosyalar artık doğrudan statik handler ile sunuluyor. `rewriteRequestPath` ile `/uploads` öneki kaldırıldı. Proxy, sunucunun kendi host'una ve `x-dunasava-upload-proxy` başlığını taşıyan isteklere hiç gitmiyor (döngü koruması). Proxy yanıtından `set-cookie`, `content-encoding` ve `content-length` başlıkları temizleniyor. |
| D2 | Yüksek | `api/boot.ts` | Admin panelinden SVG yüklenebiliyor ve bu dosyalar admin paneliyle aynı origin'den sunuluyordu. İçine `<script>` gömülmüş bir SVG doğrudan açıldığında admin oturumuyla işlem yapabilirdi (stored XSS). | `/uploads/*` yanıtlarına `Content-Security-Policy: default-src 'none'; …; sandbox` ve `X-Content-Type-Options: nosniff` eklendi. `<img>` içinde gösterim etkilenmiyor. |
| D3 | Yüksek | `api/cms-router.ts` | `assetUpload` herhangi bir `mimeType` kabul ediyordu. Görsel olmayan içerik `.jpg` uzantısıyla diske yazılabiliyordu. | `mimeType` artık yalnızca `image/*` biçiminde olabilir. `fileName` en fazla 255 karakter. |
| D4 | Yüksek | `api/local-auth.ts`, `api/lib/env.ts` | Oturum JWT'si `admin e-posta + şifre` değerinden türetilen bir anahtarla imzalanıyordu. Ele geçirilen tek bir çerez, admin şifresine karşı çevrimdışı kaba kuvvet saldırısına imkân veriyordu. | Yeni, isteğe bağlı `SESSION_SECRET` ortam değişkeni eklendi. Değişken tanımlıysa JWT bu anahtarla imzalanıyor. Tanımlı değilse eski yöntem kullanılıyor, yani mevcut kurulum bozulmuyor. `render.yaml` dosyasına `generateValue: true` ile eklendi, `.env.example` güncellendi. |
| D5 | Orta | `api/local-auth.ts` | JWT süresi **1 yıl**dı, çerez süresi ise 12 saat. Çalınan bir token bir yıl boyunca geçerli kalıyordu. | JWT süresi `Session.maxAgeMs` (12 saat) ile eşitlendi. |
| D6 | Orta | `api/local-auth.ts` | Şifre `===` ile karşılaştırılıyordu (zamanlama saldırısı). Ortam değişkenleri boşken giriş kontrolü açıkça reddedilmiyordu. | SHA-256 ve `timingSafeEqual` ile sabit süreli karşılaştırmaya geçildi. `ADMIN_EMAIL` veya `ADMIN_PASSWORD` boşsa giriş her zaman reddediliyor. |
| D7 | Orta (işlevsel) | `db/seed.ts` | Seed her açılışta ve her deploy'da tüm kütüphane görsellerini `isVisible: true` yapıyordu. Admin panelinde gizlenen ya da "silinen" görseller her deploy sonrası geri geliyordu. | Görünürlük yalnızca bu seed sürümünün (`seed.galleryAssets.v3`) ilk çalışmasında sıfırlanıyor. |
| D8 | Düşük | `api/lib/bootstrap.ts` | `ALTER TABLE sections MODIFY sectionType …` her açılışta iki kez çalışıyordu. | Tekrarlanan sorgu kaldırıldı. `ensureSectionTypeEnum` işi zaten yapıyor. |

> **Deploy notu:** `SESSION_SECRET` ilk kez tanımlandığında mevcut admin oturumları geçersiz olur. Admin bir kez yeniden giriş yapmalıdır.

---

## 2. Düzeltilmeyen bulgular (öncelik sırasıyla)

### 🔴 Kritik

**K1. `render.yaml` → `preDeployCommand: npm run db:push` (`drizzle-kit push --force`)**
`--force` onay istemeden veri kaybettiren şema değişikliklerini uygular: kolon veya tablo silme, tip daraltma gibi. `db/schema.ts` içinde yapılacak bir yeniden adlandırma ya da silme, canlı veritabanında içerik kaybına yol açabilir. Uygulama açılışta `ensureDatabaseReady()` ile şemayı zaten idempotent biçimde oluşturuyor.
*Öneri:* `db:push --force` kaldırılmalı. Yerine `drizzle-kit generate` ile üretilen ve gözden geçirilen migration'lar `db:migrate` ile uygulanmalı. `.gitignore` şu an `db/migrations/*.sql` dosyalarını hariç tutuyor, bu da düzeltilmeli. Deploy hattını değiştirdiği için bu branch'te yapılmadı.

### 🟠 Yüksek

**Y1. Login uç noktasında deneme sınırı (rate limit) yok**
`auth.login` sınırsız deneme kabul ediyor ve tek bir admin hesabı var. Kaba kuvvet saldırısına açık.
*Öneri:* IP ve e-posta başına deneme sınırı eklenmeli (ör. 15 dakikada 10 hatalı deneme). Render arkasında gerçek IP'nin `x-forwarded-for` başlığından doğru okunması gerekiyor. Yanlış yapılandırılırsa admin kendini kilitleyebilir. Bu yüzden test edilmeden eklenmedi.

**Y2. Tek bir paylaşılan admin hesabı ve düz metin şifre (ortam değişkeninde)**
Kullanıcı yönetimi, şifre hash'i ve iki faktörlü doğrulama yok. Şifre değiştirmek için deploy gerekiyor. Oturumlar sunucu tarafında iptal edilemiyor: logout yalnızca çerezi siliyor, JWT süresi dolana kadar geçerli kalıyor.
*Öneri:* `users` tablosuna bcrypt veya argon2 ile hash'lenmiş şifre eklenmeli. Oturumlar veritabanında tutulmalı ya da token'a sürüm (`tokenVersion`) eklenmeli. Mimari bir değişiklik olduğu için yapılmadı.

**Y3. İletişim formu hiçbir yere gönderilmiyor**
`src/sections/ContactSection.tsx` → `handleSubmit` yalnızca "gönderildi" durumunu gösterip formu temizliyor. Ziyaretçi mesajları **kayboluyor**, ama kullanıcıya başarı mesajı gösteriliyor.
*Öneri:* Bir tRPC mutation eklenmeli (e-posta gönderimi veya DB kaydı). Rate limit ve bot koruması (captcha veya honeypot) da eklenmeli. Yeni bir özellik ve dış servis gerektirdiği için yapılmadı.

**Y4. Çerezler `SameSite=None` ve CORS `credentials: true`**
`api/lib/cookies.ts` localhost dışında her zaman `SameSite=None` kullanıyor. Admin paneli zaten `dunasava-cms.onrender.com` adresine yönlendiriliyor, yani aynı site. Bu yüzden `None` gereksiz ve CSRF yüzeyini büyütüyor. tRPC'nin JSON gövdesi zorunluluğu şu an CSRF'yi fiilen engelliyor, ama bu dolaylı bir koruma.
*Öneri:* `SameSite=Lax` (veya `Strict`) kullanılmalı ve mutation'larda `Origin` başlığı doğrulanmalı. Farklı alan adından giriş yapılan bir akış varsa bozulabileceği için test edilmeden değiştirilmedi.

### 🟡 Orta

**O1. Global 50 MB gövde sınırı**
`bodyLimit({ maxSize: 50 MB })` herkese açık uç noktalar dahil tüm isteklere uygulanıyor. Kimliği doğrulanmamış istemciler büyük gövdelerle bellek ve CPU tüketebilir.
*Öneri:* Global sınır ~1 MB yapılmalı. Büyük sınır yalnızca `cms.assetUpload` için (ör. 15 MB) ve kimlik doğrulamadan sonra uygulanmalı. Upload'lar base64 içinde tRPC batch'iyle geldiği için dikkatli test gerekiyor.

**O2. Güvenlik başlıkları eksik**
HTML yanıtlarında `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors` (clickjacking), `Referrer-Policy` ve `Strict-Transport-Security` yok.
*Öneri:* Hono `secureHeaders()` middleware'i eklenmeli. CSP; GSAP, Google Fonts ve harici görsellerle uyumlu olacak şekilde test edilerek ayarlanmalı.

**O3. Admin tarafından girilen URL'ler doğrulanmıyor**
`assetCreate.url`, `imageUrl` alanları ve `whatsapp`/`contact_email` ayarları serbest metin. `WhatsAppButton` ve `Footer` bu değerleri `href` içine koyuyor. Şu an `https://wa.me/`, `mailto:` ve `tel:` önekleri sayesinde `javascript:` enjeksiyonu mümkün değil. Yine de sunucu tarafında şema doğrulaması (ör. `z.string().url()` veya `/uploads/` / `/assets/` önekleri) eklenmeli.

**O4. `autoTranslate` girdisine uzunluk sınırı yok**
Admin'e özel, ama sınırsız metin OpenAI maliyetini artırabilir. `z.string().max(…)` eklenmeli. OpenAI hata gövdesi de istemciye aynen iletiliyor. Genel bir hata mesajı döndürülüp ayrıntı loglanmalı.

**O5. Upload içeriği doğrulanmıyor**
`dataBase64` gerçekten bir görsel mi, kontrol edilmiyor. Dosya uzantısı yalnızca istemcinin bildirdiği MIME türünden türetiliyor. SVG'ler temizlenmiyor (sanitize). D2 ile SVG'lerin çalıştırılması engellendi, ama kalıcı çözüm için magic-byte kontrolü ve SVG sanitizasyonu (ör. DOMPurify) önerilir.

**O6. `UPLOADS_ORIGIN` proxy'si herkese açık**
`/uploads/*` isteklerini sabit bir origin'e yönlendiriyor. SSRF değil, ama her istek dış bir `fetch` tetikliyor. Proxy yalnızca gerçekten gerekli ortamlarda açık olmalı (ör. `UPLOADS_ORIGIN` açıkça tanımlıysa).

### 🟢 Düşük

**L1. Kullanılmayan (ölü) kod.** Silme işlemi bu oturumda yapılamadığı için dosyalar yerinde bırakıldı. Güvenle kaldırılabilir:
- `api/kimi/` (auth.ts, platform.ts, session.ts, types.ts): hiçbir yerden import edilmiyor, eski Kimi OAuth akışından kalma. `atob(state)` değerini doğrulamadan `redirect_uri` olarak kullanıyor ve `APP_SECRET` boşsa boş anahtarla JWT imzalıyor. Şu an çalışmıyor, ama yanlışlıkla yeniden bağlanırsa risk oluşturur.
- `api/queries/users.ts`: yalnızca `api/kimi` tarafından kullanılıyor.
- `api/lib/http.ts` (`HttpClient`): kullanılmıyor.
- `api/lib/env.ts` içindeki `appId`, `appSecret`, `kimiAuthUrl`, `kimiOpenUrl`, `ownerUnionId` ve `contracts/constants.ts` içindeki `Paths.oauthCallback`.
- `src/lib/media.ts` içindeki `getUploadsProxyOrigin` ve `REMOTE_CMS_ORIGIN`: hiçbir yerde kullanılmıyor (`resolveMediaUrl` ise `SmartImage` tarafından kullanılıyor).
- `db/relations.ts`: boş.

**L2. `kimi-plugin-inspect-react` production build'inde de aktif.** `vite.config.ts` içindeki `inspectAttr()` bileşen kaynak yollarını DOM'a ekleyebilir. Yalnızca `mode === 'development'` iken açılmalı.

**L3. `README.md` ve `info.md` şablondan kalma.** Projeyi, ortam değişkenlerini ve deploy adımlarını anlatmıyor. `package.json` adı hâlâ `my-app`.

**L4. Sabit kodlanmış değerler.** `https://dunasava-cms.onrender.com` birden fazla dosyada tekrar ediyor: `App.tsx`, `providers/trpc.tsx`, `contracts/cms.ts`, `boot.ts`. Render servis ID'si `AdminLayout.tsx` içinde yazılı. Gizli bilgi değiller, ama tek bir yapılandırmadan okunmaları bakım kolaylığı sağlar.

**L5. `api/queries/connection.ts` → `mode: "planetscale"`.** Standart MySQL için `"default"` kullanılmalı. `planetscale` modu ilişkisel sorgu davranışını değiştiriyor. Test edilmeden değiştirilmedi.

**L6. Çeviri tutarsızlıkları.** `ContactSection.tsx` içinde Sırpça (`sr`) yerine Türkçe metinler var, ör. `t('Geçersiz e-posta.', 'Geçersiz e-posta.', 'Invalid email.')`.

**L7. `assetList` herkese açık ve gizli görselleri de döndürüyor.** Filtreleme istemcide yapılıyor. Gizli içerik yok, ama gizlenen görsellerin listesi dışarı açık. Public sorguda `isVisible = true` filtresi, admin için ayrı bir sorgu önerilir.

**L8. Test yok.** `vitest` kurulu ama hiç test dosyası yok. En azından `local-auth`, upload doğrulaması ve `contracts/cms.ts` yardımcıları için birim testleri eklenmeli.

**L9. Bağımlılık denetimi.** `npm audit` sonuçları PR açıklamasında belirtildi. Sürüm yükseltmeleri kapsam dışı bırakıldı.

---

## Açıkta kalan anahtar / şifre taraması

Repoda (tüm git geçmişi dahil) `.env` dosyası, API anahtarı, veritabanı bağlantı dizesi ya da şifre **bulunamadı**. Gizli değerler `render.yaml` içinde `sync: false` ile Render panelinden yönetiliyor. `.gitignore` `.env*` dosyalarını doğru biçimde hariç tutuyor. Koddaki e-posta ve telefon numaraları site üzerinde zaten herkese açık iletişim bilgileri.
