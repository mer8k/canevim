# Can Evim — tüm operasyon kanıtları

28 Ekim 2026 · Next.js 16.3.6 / React 19.2.4 · Yerel QA tamamlandı; canlı hedef durumu aşağıdadır

Canlı yayın doğrulandı; commit 5cebf2bf36bdd02f6491435561858b8690ad08e3.

## Üç ayrı başlangıç / sonuç sınırı

1. İlk başlangıç: **2 sayfa, 348.150 byte**. .audit/baseline.json ve baseline-html.json.
2. İkinci tur başlangıcı / ilk tur sonu: **7 sayfa, 2.211.399 byte**. .audit/round2/baseline.json ve before-final-metrics.json. Bu, ilk başlangıçla aynı veri değildir.
3. Güncel kapsam: **17 kanonik URL, 14 bağımsız makale**. Derlenmiş 17/17 dosya; tam HTML toplamı 4.416.214 byte. İlk başlangıca oran 12.68 kat; ikinci tur başlangıcına oran 2.00 kat.

HTML toplamı yeni sayfaları içerir; tek sayfa veya sıkıştırılmış ağ transferi büyümesi değildir. Rapor/.audit/404/noindex arşiv toplamdan çıkarılır.

| Kanonik URL | Derlenmiş HTML byte | Görünür toplam kelime | Ana makale kelimesi |
|---|---:|---:|---:|
| / | 121.660 | 1.715 | Bekleniyor |
| /menu | 256.306 | 474 | Bekleniyor |
| /sile-serpme-kahvalti | 264.495 | 1.446 | 1.049 |
| /sile-gozleme | 261.394 | 1.436 | 1.038 |
| /sile-doga-kahvaltisi | 259.406 | 1.394 | 1.017 |
| /sile-restoran | 259.870 | 1.433 | 1.055 |
| /ulasim | 357.984 | 2.748 | 309 |
| /sile-koy-kahvaltisi | 265.367 | 1.551 | 1.151 |
| /sile-cocuk-oyun-alanli-kahvalti | 263.623 | 1.576 | 1.172 |
| /sile-grup-ve-organizasyon-kahvaltisi | 265.860 | 1.574 | 1.175 |
| /agva-sile-yolu-kahvalti-molasi | 260.777 | 1.532 | 1.154 |
| /sile-kumbaba-cavus-kahvalti | 260.983 | 1.552 | 1.171 |
| /cekmekoy-umraniye-sile-kahvalti-rotasi | 261.962 | 1.555 | 1.179 |
| /sile-kahvalti-fiyatlari | 266.012 | 1.592 | 1.192 |
| /sile-mihlama | 265.722 | 1.559 | 1.156 |
| /sile-ev-yapimi-manti | 263.509 | 1.562 | 1.180 |
| /sile-cay-tatli-molasi | 261.284 | 1.583 | 1.202 |

14 makalenin her birinde en az 800 kelime kontrolü geçti. Makale sayımı karşılaştırma/SSS dahil ana article alanıdır; ortak planlayıcı, tam menü ve alt bilgi hariçtir. Kaynak paragraf sayısı derlenmiş kelime sayısı yerine kullanılmaz.

## Mobil Lighthouse: ilk başlangıç / ilk tur / ikinci tur

| Kategori | İlk başlangıç | İlk tur sonu | İkinci tur final |
|---|---:|---:|---:|
| Performans | 86 | 87 | 99 |
| Erişilebilirlik | 100 | 100 | 100 |
| En iyi uygulamalar | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 |

Final ölçüm yerel: http://127.0.0.1:3100/. LCP 2.07 sn; TBT 53 ms; CLS 0.0027. 98–100 performans hedefi bu koşuda sağlandı. İlk iki sütun yerel koşulardır; canlı final kullanıldığında sunucu ve sıkıştırma koşulları farklıdır. Kanıt: .audit/round2/lighthouse-final-summary.json. Mobil laboratuvar koşusu gerçek kullanıcı Core Web Vitals veya GSC sonucu değildir.

Canlı https://www.canevimsile.com/ mobil Lighthouse: performans 96, erişilebilirlik 100, SEO 100. LCP 2.43 sn, TBT 55 ms, CLS 0.0000. Ölçüm: 2026-10-28T10:07:42.925Z. Kanıt: .audit/round2/lighthouse-live-summary.json. Bu bir laboratuvar koşusudur.

Canlı 98–100 performans hedefi sağlanmadı; açık madde olarak korunuyor. Bağımsız Google PageSpeed API ölçümü HTTP 429 kota yanıtı nedeniyle alınmadı; ek bir puan üretilmedi. Ölçüm geçmişi: 26 Ekim önceki sürüm canlı: 93; 28 Ekim düzeltme öncesi canlı: 26; 28 Ekim düzeltme öncesi yerel: 83. Bu kayıtlar korunuyor; faz sırası tanısı ve ölçüm sınırları .audit/vercel-setup-2026-10-28/performance-diagnosis.md içindedir. Tek koşu kalıcı performans garantisi değildir.

## Gerçek GSC bulgusu

Kullanıcının sağladığı gsc-canevim-2026-10-26 paketi incelendi. Filtre “Son 16 ay”, mevcut günlük veri 2026-08-01–2026-10-24, 85 gündür; 16 aylık dolu geçmiş değildir. 250 sorgu, 13 sayfa satırı ve 20 sorgu filtresinden 60 sorgu–URL eşleşmesi incelendi. Filtre operatörü dışa aktarımda açık değil; gün+sorgu+sayfa serisi yok. Kaynaklar değiştirilmedi; manifest 78.482 byte, SHA-256 7489f9f32e7c70b953c960109a3ec96c780af99ba8ea316a2bc3335d76091e6b. Hash uyumu paket bütünlüğünü gösterir; GSC oturumuna bağımsız erişim veya ekran aktarımının doğruluğunu tasdik etmez. Mobil 136/154 tıklama (%88,3). Veri 24 Ekim'de biter; 25 Ekim dağıtımının etkisini ölçmez. Konum bugünün Google sırası değildir; mülk/sayfa/sorgu toplamları aynı kapsam sayılmadı.

| Kapsam | Tıklama | Gösterim | TO | Kaynak |
|---|---:|---:|---:|---|
| Günlük mülk toplamı | 154 | 10.135 | %1,52 | Grafik A2:E86 |
| HTTPS ana sayfa | 99 | 9.831 | %1,01 | sayfalar.csv:A2:E2 |
| Menü | 47 | 1.974 | %2,38 | sayfalar.csv:A3:E3 |
| şile kahvaltı sorgusu | 7 | 1.237 | %0,57 | sorgular.csv:A6:E6 |
| şile serpme kahvaltı sorgusu | 3 | 164 | %1,83 | sorgular.csv:A8:E8 |
| şile gözleme sorgusu | 0 | 143 | %0,00 | sorgular.csv:A26:E26 |


### 28 günlük karşılaştırma

Önceki dönem 2026-08-29–2026-09-25; son dönem 2026-09-26–2026-10-23.

| Kapsam | Önceki tıklama | Son tıklama | Önceki gösterim | Son gösterim |
|---|---:|---:|---:|---:|
| Mülk toplamı | 54 | 35 | 3142 | 3121 |
| Görünen markalı sorgular | 20 | 10 | 367 | 214 |
| Görünen markasız sorgular | 12 | 17 | 1587 | 1917 |
| Sorgu tablosunda temsil edilmeyen | 22 | 8 | 1188 | 990 |

Marka ayrımı görünen sorgu metninden türetildi; eksik sorgular marka/markasız diye dağıtılmadı. Önceki yılın sıfırları güvenilir bir büyüme bazına çevrilmedi.

### Ana sorgu ve URL kanıtı

| Sorgu | URL | Tıklama | Gösterim |
|---|---|---:|---:|
| şile kahvaltı | / | 4 | 1227 |
| şile kahvaltı | /menu | 2 | 140 |
| şile kahvaltı | /sile/sile-kahvalti-mekanlari | 1 | 15 |
| şile kahvaltı | / | 0 | 1 |
| şile kahvaltı mekanları | / | 11 | 1393 |
| şile kahvaltı mekanları | /menu | 5 | 180 |
| şile kahvaltı mekanları | /sile/sile-kahvalti-mekanlari | 0 | 9 |

İncelenen ana sorgularda eski rehberin ana sayfayı bastırdığı iddiası desteklenmiyor. Görünen markasız sorgular artarken toplam tıklama düşüyor; kayıp yalnız başlığa, sıralamaya veya tek bir sorgu grubuna bağlanmadı. Ayrı genel sorgu ve sayfa tabloları yapay biçimde birleştirilmedi.

### GSC işlemlerinde açık kalanlar

GSC aktarımındaki 14/17 dizin durumu, üç tarihsel canonical farkı ve sitemap'te iki keşif iddiası bağımsız doğrulanmadı. Üç canonical kaydı URL dışında başka kayıtlarla tamamen aynı; sitemap görselinde satır görünmüyor. Canlı HTTP kontrolü 17/17 doğru canonical gösterir; bu Google indeks durumu değildir. Önce bu kayıtların yeni URL Denetimi kanıtı gerekir; buna dayanarak kod değiştirilmedi.

İş sırası: üç kopya alanlı canonical kaydı ve üç bilinmiyor kaydını yeniden denetle; sitemap satırının gerçek keşif adedini görüntüle; ana sorgu için URL filtreli günlük grafikler al. Sonuçlar doğrulanmadan toplu canonical/yönlendirme değişikliği yapılmaz. Ayrıntılar .audit/gsc-review-2026-10-26/GSC-INCELEME.md ve EK-DOGRULAMA-PROMPTU.txt içindedir.


Paket scripts/import-gsc-evidence.mjs ile kaynağı değiştirmeden doğrulanıp içeri alındı. Eski 19 günlük kayıt .audit/round2/gsc-evidence-2026-08-19.json olarak korundu. Kanıt: .audit/round2/gsc-evidence.json. Kullanıcı dosyasının incelenmesi ile canlı GSC oturumuna erişim ayrı işlemlerdir. API çağrısı **0**; sitemap gönderimi veya indeksleme isteği yapılmadı.

## 10 çalışma alanı

1. **Arama niyeti:** Genel kahvaltı ana sayfada; köy, mantı, mıhlama ve fiyat eski URL'leri ilgili yeni hedefte. 166 kalıcı 308 kuralı.
2. **GSC verisinin incelenmesi:** 85 günlük kullanıcı paketi: 154 tıklama, 10.135 gösterim. 60 sorgu–URL eşleşmesi; panel işlemleri ayrı.
3. **İçerik mimarisi:** 14 bağımsız makale; menü, aile, grup, bölgesel rota ve kapsam tabloları. Her makale için en az 800 kelime kontrolü.
4. **Yerel ulaşım:** 48 Google Haritalar başlangıcı ve doğru Üvezli varışı. Sabit, doğrulanmamış km/dakika yok.
5. **Arama görünümü:** Sayfaya özel title, description, canonical, Open Graph, Twitter ve #id rehberleri. Sıralama veya CTR garantisi yok.
6. **Yapısal veri:** 54 gerçek ürün, 9 menü bölümü; görünür içerikle aynı tek graf. 73–74 üst seviye düğüm.
7. **Masa planlayıcı:** Kişi sayısı, konsept ve tercihleri WhatsApp talebine dönüştürür; kullanıcı bütçesini çarpar. İşletme tarifesi veya kesin masa onayı değil.
8. **Dönüşüm ve ölçüm:** Mobil eylem barı, hassas veriyi dışlayan izinli olay kuyruğu ve geri alma. Gerçek GA4 / DebugView doğrulaması ayrı.
9. **Hız ve altyapı:** Statik içerik, duyarlı görseller, font/CSS iyileştirmeleri ve içerik hash'ine bağlı lastmod. Mobil performans 87 → 99.
10. **Kalite ve kanıt:** Build, özgün makale uzunluğu, schema, HTTP, tarayıcı, mobil ve dosya hash kayıtları. 203 HTTP kontrolü geçti.

app/growth-content.js ve expanded-experiences.js içerikleri; app/[experience]/page.js statik üretimi; GrowthContent.js karşılaştırma/bağlantı/görünür menüyü sağlar. Ana sayfa, home-content.js + ortak Header/MobileActions bileşenlerinden scripts/build-home.cjs ile derleme sırasında gerçek statik HTML üretilerek app/route.js üzerinden sunulur. Ana sayfada Next.js istemci framework isteği ve hidrasyonu yoktur; menü/rezervasyon public/home-ui.js ile çalışır. Detay sayfaları App Router kullanır; ana sayfaya dönüş yeni belge açar. Planlayıcı ve ana sayfa rota listesi IntersectionObserver ile yaklaşıldığında HTML/CSS olarak yüklenir; tam /ulasim içeriği sunucuda görünür. Üretilmiş HTML her build öncesi yeniden hazırlanır; Next scriptleri sonradan silinmez. Fiyat, tedarikçi, organik sertifika veya tesis özelliği doğrulanmadan eklenmez. 54 menü ürünü ve görünür SSS schema ile eşleşir. Sahte Offer, puan, 30 km hizmet alanı veya Wikidata yoktur. Düğüm sayısı sıralama/zengin sonuç garantisi değildir. Analitik dataLayer aktarımı Google alım kanıtı değildir; sıfır kayıp iddiası yoktur. Gerçek kimlik ve DebugView testi ayrıdır.

## Final QA

| Kontrol | Sonuç |
|---|---|
| build | Geçti |
| articles | Geçti |
| seo | Geçti |
| http | Geçti |
| browser | Geçti |
| lighthouse | Geçti |

HTTP: 203/203. Tarayıcı: Tüm kanonikler kontrol edildi. Kanıt zamanı build'den sonra olmalıdır. Eski başarılı koşu yeni final sonuç diye sunulmaz.

## 18 arama / ziyaret eşlemesi

| Arayış | Hedef | Kapsam | Karşılaştırma notu |
|---|---|---|---|
| Şile kahvaltı | / | Serpme, gözleme, restoran ve ziyaret planı | Genel kahvaltı niyetinin ana adresi |
| Şile serpme kahvaltı | /sile-serpme-kahvalti | Sıcaklar, soğuklar ve çay kapsamı | Kahvaltı tabağıyla karşılaştırın |
| Şile köy kahvaltısı | /sile-koy-kahvaltisi | Mevcut serpme menü içeriği | Ürün kaynağını ayrıca sorun |
| Şile kahvaltı fiyatları 2026 | /sile-kahvalti-fiyatlari | Kapsam tablosu ve güncel teklif | Yayımlanmış sayısal tarife yok |
| Şile gözleme | /sile-gozleme | Altı gözleme çeşidi | Porsiyon ve bulunurluğu sorun |
| Patatesli / peynirli gözleme | /sile-gozleme#peynirli | Patatesli, kaşarlı ve beyaz peynirli | İç harçları karşılaştırın |
| Otlu / pazılı gözleme | /sile-gozleme#pazili | Menüdeki pazılı çeşit | Diğer iç malzemeleri öğrenin |
| Kıymalı / sucuklu gözleme | /sile-gozleme#etli | İki ayrı etli seçenek | Porsiyon ve baharatı sorun |
| Şile doğa kahvaltısı | /sile-doga-kahvaltisi | Üvezli'de bahçe atmosferi | Hava ve masa uygunluğunu sorun |
| Şile aile kahvaltısı | /sile-cocuk-oyun-alanli-kahvalti | Aile masası için ziyaret soruları | Çocuk alanı doğrulanmış değil |
| Şile bahçe kahvaltısı | /sile-doga-kahvaltisi#bahce | Açık hava oturma talebi | Belirli masa garantisi verilmez |
| Şile restoran | /sile-restoran | Izgara, mantı ve diğer yemekler | Genel saat ile mutfak saati ayrılır |
| Şile öğle / akşam yemeği | /sile-restoran#ogle-aksam | Ziyaret saatine göre yemek planı | Son sipariş saatini öğrenin |
| Şile ızgara / sac kavurma | /sile-restoran#izgara | Et, tavuk ve sac kavurma seçenekleri | Garnitür ve porsiyonu karşılaştırın |
| Şile ev yapımı mantı | /sile-ev-yapimi-manti | Mantı, çıtır mantı ve çiğbörek | Servis biçimi ve fiyatı sorun |
| Yakınımdaki kahvaltı mekanları | /ulasim | Bulunduğunuz konumdan canlı rota | Mesafe ve süre haritada hesaplanır |
| Şile yolu üzeri kahvaltı | /cekmekoy-umraniye-sile-kahvalti-rotasi | İstanbul çıkış noktalarına göre rota | Üvezli adresini hedefleyin |
| Şile merkez / Ağva arası kahvaltı | /agva-sile-yolu-kahvalti-molasi | Şile ve Ağva çıkışlı yol tarifi | İşletme Üvezli'dedir |

## Yayın kanıtı

Canlı yayın doğrulandı; commit 5cebf2bf36bdd02f6491435561858b8690ad08e3. Yetkili Vercel CLI üzerinden salt okunur sağlayıcı denetimi: canevim (prj_8rPWkNxgEbDuvay9AGltkI0XXLc6), deployment dpl_4CA5ChVzKEUEJMrQ6TRmUAAwimWR, tam Git SHA, production/READY durumu, alias ataması ve iki doğrulanmış alan adı eşleşti. Genel yayın kontrolleri 20/20; sağlayıcı kriterleri 11/11. Alan adının bağlı olduğu proje Vercel kayıtlarından doğrulandı. Kaynak: .audit/round2/application-release-verification.json. GitHub kaynağından yayın yapıldı; yerel GSC girdileri yüklenmedi.

## Yeniden üretme

- npm run build
- npm run test:seo
- node scripts/test-growth.mjs
- npm run test:content-dates
- node scripts/test-http.mjs (TEST_BASE_URL: production sunucusu)
- node scripts/test-browser.mjs (PLAYWRIGHT_MODULE / CHROME_PATH)
- node scripts/generate-growth-report.mjs --draft (açıkça bekleyen ölçümlü taslak)
- node scripts/generate-growth-report.mjs (taze final build / QA / Lighthouse zorunlu)
- node scripts/generate-growth-report.mjs --deployment <uygulama-yayını-kaydı.json> (rapor commit'inden ayrı, doğrulanmış uygulama yayınını sabitler)
- node scripts/test-report.mjs (yerel sunum, içerik/hash ve mobil planlayıcı)
- node scripts/verify-deployment.mjs --sha <tam commit> --wait-seconds 300 (push sonrası read-only)
- node scripts/verify-deployment.mjs --sha <tam commit> --vercel-project <prj_ID> --vercel-deployment <dpl_ID> --vercel-scope <takım> (yetkili CLI ile salt okunur proje/alan adı doğrulaması)
- node scripts/gsc-audit.mjs --help
- node scripts/import-gsc-evidence.mjs --input gsc-canevim-2026-10-26 (salt okunur paket içe aktarımı)

## İlk başlangıca göre byte / SHA-256

Git modified durumuna bağlı değildir: tracked/staged teslim dosyaları ve baseline yolları SHA-256 ile karşılaştırılır. Yeni kaynak dosyaları rapor üretiminden önce stage edilir. Kullanıcının untracked GSC klasörü, ZIP'i ve paket hazırlama betiği yayın kapsamı değildir. Commit/push kanıtı silmez. Yeni dosya before_bytes=0, silinen after_bytes=0. Rapor kendi hash'ini içine alamadığı için iki raporun hash'i dış .audit/file-evidence.json ve round2/file-evidence.json dosyalarındadır. HTML hash'leri final-metrics.json, QA hash'leri artifact-evidence.json içindedir.

| Dosya | before_bytes | after_bytes | SHA-256 (son durum) |
|---|---:|---:|---|
| .gitignore | 539 | 660 | f3e4ce36af89977f02406c31719d76193e5cee36331f068fea37b7fe502aac80 |
| GROWTH-INTERACTIVE-INTEGRATION.md | 0 | 15600 | bfd074b9a2e19a6c2d7939d9d4616248de1204ead47f7a4e7b78de3cccb8b551 |
| app/Header.js | 10100 | 11639 | f7cfd433bf032c087f1f496455e7388a48995d529c191453f52fcde296d878d5 |
| app/[experience]/page.js | 0 | 3174 | b66903131bccea56a5ca57fccf55c528220a0da60f5f3a4a5ccbade27cd4a1f6 |
| app/blog/page.js | 801 | 1281 | e3e60d00feb853c6cc21532e45e20361e2384420c86962de2b98d1a2065c4706 |
| app/components/BreakfastPlanner.js | 0 | 6936 | dd026df738bbb09bcffca2b6230ea436b8498e1ede7fe160535983d6664f004d |
| app/components/FadeIn.js | 1305 | 219 | 1bfb26aa98257fa3ccc97a157798d835c616aa4e2381caea2d6e34805a889322 |
| app/components/GrowthContent.js | 0 | 7313 | cee6ccc7686ac50f51067e7e216982304731a71a9f213f91d9292c7434d1041a |
| app/components/LazyInteractive.js | 0 | 1251 | 1c7736110d90856a1804b6535b1d14a09ddd42a74611beb784dc804636764b52 |
| app/components/MobileActions.js | 0 | 1348 | 7971203e1ebf3ca4b3d909e57d1b164e900032540967a80f2516871cb34127e0 |
| app/components/ReservationForm.js | 2602 | 2813 | 3810f5c3ccc87df769f6b35eabe8fbb8bedc5d528da4b095071049fcbbf58431 |
| app/components/RouteMatrix.js | 0 | 2883 | 531054cb0bf7bed1ca9d562d9991eb875f3de8feefa4190d1936d60a741800f6 |
| app/components/SiteLink.js | 0 | 361 | 32d94124fc58e6e37b9c53af866214c7dc0db954d2788754551a0fed9a8a4e4d |
| app/components/StaticImage.js | 0 | 326 | 82ac052212edb221edf39724d51a74d90a1f64419e1e60fd4e2b4c7b03fceb81 |
| app/content-dates.json | 0 | 24414 | 57668f24617352fad476534f241aae573c1ef13f7ae9aff27100fc785887ca40 |
| app/expanded-experiences.js | 0 | 93903 | e2a77e1f288e5d188cc8e2c225f9a8bc3b54e610e90dc2c916d444f076fa4eaf |
| app/globals.css | 229 | 398 | 53cdc71f8615fd4cc6c969913bdb748262bd1e945aeeab1cfd230b2daf3cad38 |
| app/growth-content.css | 0 | 9894 | 8ca17bdd97c1644c48aa492d868041b6c2b5c526e353b9c9dbe8d71b602c2524 |
| app/growth-content.js | 0 | 41668 | c3d7d965391bf9f5c56c21d62001bd54733a9cf5d949275419842dae9cec0150 |
| app/growth-interactive.css | 0 | 6611 | b6deba9fb884c16e220cdb78383b23142be7d1649b382d20ade87d2e581555d7 |
| app/growth-performance.css | 0 | 2033 | aa104ca770bb800fdf32f9eaffb5aa987adfb8c88907ef81c3b1acd3153b8bd5 |
| app/growth-routes.css | 0 | 3424 | 57e24647fc84cde8598c5982f1536fe185759cd84ef2f29349a737f97f8b0aa0 |
| app/growth-routes.js | 0 | 14919 | 0836f521dfbb18df80cf2892650e9238db43adf6805df282347f73f0b83e2f69 |
| app/growth-schema.js | 0 | 7425 | 5815211e83048670fc96aa20179f83f99be9cd18012d8a505374e3273fb2a586 |
| app/home-content.js | 0 | 25311 | 95bbd3a4a81bdaa4495a82bf68e0818834e69cc77e8e8c8d71ed14860691901b |
| app/interactive/[module]/page.js | 0 | 1160 | 2de08cae2a2fbab3c3af6465f7eb4811cf1ad42a075101990ca8d1ad0523ce13 |
| app/layout.js | 2457 | 1446 | 5505a684c3ac8701c71c3ac262822b5ac2f73c9dd0bcede4719a8f2e1b3292d5 |
| app/local-fonts-subset.css | 1862 | 2073 | 027eabb60ba2e61c17d754279db2f5edf7844262c0f634ce162bcd8c73801835 |
| app/menu/page.js | 17708 | 17184 | e2439022eeea6dad67faad205d4b75ebd28f312a8871f094496f5231ae8edab1 |
| app/mobile-actions.css | 0 | 2932 | 0567939bf7c54547a043b40d12ffbc6072be8798fbd0d7b0409588b20fc82c2d |
| app/page.js | 22875 | 0 | Silindi |
| app/robots.js | 214 | 235 | f66432a51359ca896b215afa27aec3ad1c44d7d77c0600715612c6ddad12ed75 |
| app/route.js | 0 | 372 | 55f33bb494faa64a7235e847f7fe5c74779cf23ce5fad911aab67760fc74e01b |
| app/seo-consolidation.mjs | 1616 | 3443 | f7f57e1a5ea161ec2b441c7ce4cedcb38b65c60add23c4085717d1d1880f1a30 |
| app/seo-routes.mjs | 0 | 1559 | b522d5ad90b0ebb22a43249509b7beacfa65e59776c98dd3714e6f8b785c93b6 |
| app/sitemap.js | 241 | 405 | acc5a36ea01aeb5d54b9e0c527d0e654543453aca3ac4081456845b2e4a94242 |
| app/ulasim/page.js | 0 | 4680 | 8fd4dc6a8e14b372f629ba975c2dc5d691be3c841c73170207ead0add27072b3 |
| next.config.mjs | 929 | 1764 | 63f0985e8771fc2ff3167bbc54149a3bad09a44372ff2c6d41ab082300b74207 |
| package-lock.json | 55450 | 53857 | 2c4be83a8c31cb95b05d21b05d6446615475a86bffb9a5c946b92e73c0a96627 |
| package.json | 367 | 928 | 8900efb7b740e91d1b9f0ca3e52d32c14b1d8e3f142630d3eb0f92ab33e84e6d |
| public/growth-loader.js | 0 | 2952 | bcd717aebde868b2cc889340f0274331b84c0654f844c43e4e2140b761c155c8 |
| public/growth.js | 0 | 10824 | d89977df35e24ce2e15445484376f8ffadade12c7276082b3b8a40c886ff2d35 |
| public/home-ui.js | 0 | 2300 | 161cfe9949ba29cf966c98e60d0f8d573675d7f68b5cd19d757bed443b0eb6cf |
| public/performance/content/bahce-card.avif | 0 | 11906 | 2795e4b816951ba58f782a49871893badc89b6ead0ca1a2da9260edcbe024fd8 |
| public/performance/content/gozleme-480.webp | 0 | 36322 | ab051f46e0a31ebc5b2cdafe4458379164536e37f3c363ecca7dcbea5d5a635f |
| public/performance/content/gozleme-960.webp | 0 | 96002 | a8fb89c56a7c8361cf408a9fe625dc974453a3482b70f92048432ce1493b55ab |
| public/performance/content/gozleme-card.avif | 0 | 14839 | 029b589d01d5b05b41d02b5cfe68ea21e05abae3ac7c185cfc9874f01b0228c4 |
| public/performance/content/sac-kavurma-480.webp | 0 | 24088 | a48255cbf665befbfdcb99b8bf92bd300e6fb7543717d7955ca08d40260cb3a4 |
| public/performance/content/sac-kavurma-960.webp | 0 | 65470 | 93a2f092fa187ab84da89443e02e12db16ee6630ab914558b287f52fe453f27b |
| public/performance/content/sac-kavurma-card.avif | 0 | 10600 | f370152fd56e61dd17e2189972ea00e35104a57893debeff5f9c3ce06457f19d |
| public/performance/content/serpme-card.avif | 0 | 13305 | af165bd728fd9f1fce76f45f3a68844c6063f8cf65b2d327931ef47407444389 |
| public/performance/fonts/canevim-wordmark.woff2 | 0 | 1136 | d3df4dfc0ad808d7273a4387b3f5b9860162658f2c990a9da75988e6c6d4ddb9 |
| public/performance/fonts/playfair-latin-400.woff2 | 0 | 18184 | 989a9735d43ea84ab4dd5af17d5bef457f5ba2ef7a7d5a7a21cdcde6abf6c507 |
| public/performance/fonts/playfair-tr-400.woff2 | 0 | 1768 | c147e6207fe61c7dfbb6a1a464b5d5462cb50193f9db0bcb1bfb37c9e3cf847e |
| public/performance/hero/home-mobile-480-fast.webp | 0 | 14366 | 5fdf68be1e92b8e57a41cc68eb8a076cc86b2a14d436133012a4e1b0cd82b674 |
| public/performance/hero/home-mobile-480.avif | 0 | 7996 | e3f60f32ac185be2f7d95b3617499aae9ce41defe0f00c837b4c0d433e6b5df4 |
| public/performance/hero/home-mobile-750.avif | 0 | 24750 | 81f3091b2b9c9c7f1aed61062a3c8fc6cd16ebcf2edf4c05a86a1737dc32c500 |
| public/performance/ui/interactive.css | 0 | 6611 | b6deba9fb884c16e220cdb78383b23142be7d1649b382d20ade87d2e581555d7 |
| public/performance/ui/routes.css | 0 | 3424 | 57e24647fc84cde8598c5982f1536fe185759cd84ef2f29349a737f97f8b0aa0 |
| scripts/build-growth.mjs | 0 | 1837 | bcab9b983bb44493db0e8b6528b7db44ca00ceb6b2e6bb2f5896be169f30a6a4 |
| scripts/build-home.cjs | 0 | 7687 | ddd971a237c127facd802af6694e00b40d4c5621b7263bb780a358ddf25451ec |
| scripts/compiled-pages.mjs | 0 | 248 | 16cfb3ff2f158074f4f062b9c6e0a1b1ceb5c6b8643048896fda85cdbcd8d50b |
| scripts/content-fingerprint.mjs | 0 | 350 | 7f70c6362eb87c8aa7b7ceddc8c7940989c6d949a5c5ca20251aed8dd8aa1e13 |
| scripts/generate-growth-report.mjs | 0 | 45928 | 6020ae8e2173e049985dbedc060ef7af0e63d21a4afab409a57ab76aade45b24 |
| scripts/growth-loader.cjs | 0 | 4427 | 0c2e4ae70954f6c569d5cc6610b098c72421064091995a500804028f1f48a4d1 |
| scripts/growth-runtime.cjs | 0 | 17697 | 4ed9f10d8405078db550755fe76c3bc7303b09aefa085872d3808433bbd52ae5 |
| scripts/gsc-audit.mjs | 0 | 14607 | 606c89fe740b6809ae1af5dbe74156c64478b174a8591c6fe3a184b8450c0097 |
| scripts/home-ui.cjs | 0 | 3577 | 780a3cff7cd30b4c335c9f0f7ec74c813034f1b072c515528decaef7fe33059c |
| scripts/import-gsc-evidence.mjs | 0 | 19815 | 4abc59fc4fad6ee299f2023f12e45a4af6be7b370909d016ede9531febbcc7b2 |
| scripts/seo-infra-check.mjs | 0 | 9132 | 952b18c6c99e02a0697e65e009f0e22e23c87027ff06afd8436ed22bf1421245 |
| scripts/test-browser.mjs | 0 | 47276 | 0c60824f62be7b47a9c4796f95c73ae6a2e20aaa8dffa62bad33d08521a905d1 |
| scripts/test-growth.mjs | 0 | 7148 | 0187e766f9ba21bd1dd52402799c078e0aae9cd818a721c65c39afde80a6504a |
| scripts/test-http.mjs | 0 | 9926 | 393207dde38fefbd4dc97af9ebf9ee2ab1f22baff7127804b73cd4833aa5c400 |
| scripts/test-links.mjs | 0 | 1592 | 15807d821044ebcce73c7416b5d5453191a59db8357682c4f47ff667b293d796 |
| scripts/test-report.mjs | 0 | 22592 | 56115f5f771e5511da764649500a96af14dbc1656e93b53d84e2e5c4c2667bc9 |
| scripts/update-content-dates.mjs | 0 | 4219 | b828ce97c8082df61e6754e15e0fc58a1d438955cd6d74e10eb5aeb58d9e0173 |
| scripts/verify-deployment.mjs | 0 | 20899 | d582ca53708dda207d84d15f95da4a5fdd0d9ad672852d8172b621ae07bfcc66 |

## İkinci tur başlangıcına göre farklar

Bu before değerleri ilk başlangıç değil .audit/round2/baseline.json değerleridir.

| Dosya | before_bytes | after_bytes | SHA-256 (son durum) |
|---|---:|---:|---|
| .gitignore | 549 | 660 | f3e4ce36af89977f02406c31719d76193e5cee36331f068fea37b7fe502aac80 |
| GROWTH-INTERACTIVE-INTEGRATION.md | 7111 | 15600 | bfd074b9a2e19a6c2d7939d9d4616248de1204ead47f7a4e7b78de3cccb8b551 |
| app/Header.js | 11457 | 11639 | f7cfd433bf032c087f1f496455e7388a48995d529c191453f52fcde296d878d5 |
| app/[experience]/page.js | 3024 | 3174 | b66903131bccea56a5ca57fccf55c528220a0da60f5f3a4a5ccbade27cd4a1f6 |
| app/blog/page.js | 1234 | 1281 | e3e60d00feb853c6cc21532e45e20361e2384420c86962de2b98d1a2065c4706 |
| app/components/GrowthContent.js | 6802 | 7313 | cee6ccc7686ac50f51067e7e216982304731a71a9f213f91d9292c7434d1041a |
| app/components/LazyInteractive.js | 0 | 1251 | 1c7736110d90856a1804b6535b1d14a09ddd42a74611beb784dc804636764b52 |
| app/components/SiteLink.js | 0 | 361 | 32d94124fc58e6e37b9c53af866214c7dc0db954d2788754551a0fed9a8a4e4d |
| app/components/StaticImage.js | 0 | 326 | 82ac052212edb221edf39724d51a74d90a1f64419e1e60fd4e2b4c7b03fceb81 |
| app/content-dates.json | 8934 | 24414 | 57668f24617352fad476534f241aae573c1ef13f7ae9aff27100fc785887ca40 |
| app/expanded-experiences.js | 0 | 93903 | e2a77e1f288e5d188cc8e2c225f9a8bc3b54e610e90dc2c916d444f076fa4eaf |
| app/globals.css | 370 | 398 | 53cdc71f8615fd4cc6c969913bdb748262bd1e945aeeab1cfd230b2daf3cad38 |
| app/growth-content.js | 41474 | 41668 | c3d7d965391bf9f5c56c21d62001bd54733a9cf5d949275419842dae9cec0150 |
| app/home-content.js | 0 | 25311 | 95bbd3a4a81bdaa4495a82bf68e0818834e69cc77e8e8c8d71ed14860691901b |
| app/interactive/[module]/page.js | 0 | 1160 | 2de08cae2a2fbab3c3af6465f7eb4811cf1ad42a075101990ca8d1ad0523ce13 |
| app/layout.js | 1480 | 1446 | 5505a684c3ac8701c71c3ac262822b5ac2f73c9dd0bcede4719a8f2e1b3292d5 |
| app/local-fonts-subset.css | 1862 | 2073 | 027eabb60ba2e61c17d754279db2f5edf7844262c0f634ce162bcd8c73801835 |
| app/menu/page.js | 17156 | 17184 | e2439022eeea6dad67faad205d4b75ebd28f312a8871f094496f5231ae8edab1 |
| app/mobile-actions.css | 0 | 2932 | 0567939bf7c54547a043b40d12ffbc6072be8798fbd0d7b0409588b20fc82c2d |
| app/page.js | 24234 | 0 | Silindi |
| app/route.js | 0 | 372 | 55f33bb494faa64a7235e847f7fe5c74779cf23ce5fad911aab67760fc74e01b |
| app/seo-consolidation.mjs | 3381 | 3443 | f7f57e1a5ea161ec2b441c7ce4cedcb38b65c60add23c4085717d1d1880f1a30 |
| app/seo-routes.mjs | 621 | 1559 | b522d5ad90b0ebb22a43249509b7beacfa65e59776c98dd3714e6f8b785c93b6 |
| app/ulasim/page.js | 4549 | 4680 | 8fd4dc6a8e14b372f629ba975c2dc5d691be3c841c73170207ead0add27072b3 |
| package-lock.json | 55450 | 53857 | 2c4be83a8c31cb95b05d21b05d6446615475a86bffb9a5c946b92e73c0a96627 |
| package.json | 806 | 928 | 8900efb7b740e91d1b9f0ca3e52d32c14b1d8e3f142630d3eb0f92ab33e84e6d |
| public/growth-loader.js | 0 | 2952 | bcd717aebde868b2cc889340f0274331b84c0654f844c43e4e2140b761c155c8 |
| public/home-ui.js | 0 | 2300 | 161cfe9949ba29cf966c98e60d0f8d573675d7f68b5cd19d757bed443b0eb6cf |
| public/performance/content/bahce-card.avif | 0 | 11906 | 2795e4b816951ba58f782a49871893badc89b6ead0ca1a2da9260edcbe024fd8 |
| public/performance/content/gozleme-card.avif | 0 | 14839 | 029b589d01d5b05b41d02b5cfe68ea21e05abae3ac7c185cfc9874f01b0228c4 |
| public/performance/content/sac-kavurma-card.avif | 0 | 10600 | f370152fd56e61dd17e2189972ea00e35104a57893debeff5f9c3ce06457f19d |
| public/performance/content/serpme-card.avif | 0 | 13305 | af165bd728fd9f1fce76f45f3a68844c6063f8cf65b2d327931ef47407444389 |
| public/performance/fonts/canevim-wordmark.woff2 | 0 | 1136 | d3df4dfc0ad808d7273a4387b3f5b9860162658f2c990a9da75988e6c6d4ddb9 |
| public/performance/fonts/playfair-latin-400.woff2 | 0 | 18184 | 989a9735d43ea84ab4dd5af17d5bef457f5ba2ef7a7d5a7a21cdcde6abf6c507 |
| public/performance/fonts/playfair-tr-400.woff2 | 0 | 1768 | c147e6207fe61c7dfbb6a1a464b5d5462cb50193f9db0bcb1bfb37c9e3cf847e |
| public/performance/hero/home-mobile-480-fast.webp | 0 | 14366 | 5fdf68be1e92b8e57a41cc68eb8a076cc86b2a14d436133012a4e1b0cd82b674 |
| public/performance/hero/home-mobile-480.avif | 0 | 7996 | e3f60f32ac185be2f7d95b3617499aae9ce41defe0f00c837b4c0d433e6b5df4 |
| public/performance/hero/home-mobile-750.avif | 0 | 24750 | 81f3091b2b9c9c7f1aed61062a3c8fc6cd16ebcf2edf4c05a86a1737dc32c500 |
| public/performance/ui/interactive.css | 0 | 6611 | b6deba9fb884c16e220cdb78383b23142be7d1649b382d20ade87d2e581555d7 |
| public/performance/ui/routes.css | 0 | 3424 | 57e24647fc84cde8598c5982f1536fe185759cd84ef2f29349a737f97f8b0aa0 |
| scripts/build-growth.mjs | 775 | 1837 | bcab9b983bb44493db0e8b6528b7db44ca00ceb6b2e6bb2f5896be169f30a6a4 |
| scripts/build-home.cjs | 0 | 7687 | ddd971a237c127facd802af6694e00b40d4c5621b7263bb780a358ddf25451ec |
| scripts/compiled-pages.mjs | 0 | 248 | 16cfb3ff2f158074f4f062b9c6e0a1b1ceb5c6b8643048896fda85cdbcd8d50b |
| scripts/content-fingerprint.mjs | 0 | 350 | 7f70c6362eb87c8aa7b7ceddc8c7940989c6d949a5c5ca20251aed8dd8aa1e13 |
| scripts/generate-growth-report.mjs | 28901 | 45928 | 6020ae8e2173e049985dbedc060ef7af0e63d21a4afab409a57ab76aade45b24 |
| scripts/growth-loader.cjs | 0 | 4427 | 0c2e4ae70954f6c569d5cc6610b098c72421064091995a500804028f1f48a4d1 |
| scripts/home-ui.cjs | 0 | 3577 | 780a3cff7cd30b4c335c9f0f7ec74c813034f1b072c515528decaef7fe33059c |
| scripts/import-gsc-evidence.mjs | 0 | 19815 | 4abc59fc4fad6ee299f2023f12e45a4af6be7b370909d016ede9531febbcc7b2 |
| scripts/seo-infra-check.mjs | 7616 | 9132 | 952b18c6c99e02a0697e65e009f0e22e23c87027ff06afd8436ed22bf1421245 |
| scripts/test-browser.mjs | 23268 | 47276 | 0c60824f62be7b47a9c4796f95c73ae6a2e20aaa8dffa62bad33d08521a905d1 |
| scripts/test-links.mjs | 1578 | 1592 | 15807d821044ebcce73c7416b5d5453191a59db8357682c4f47ff667b293d796 |
| scripts/test-report.mjs | 0 | 22592 | 56115f5f771e5511da764649500a96af14dbc1656e93b53d84e2e5c4c2667bc9 |
| scripts/update-content-dates.mjs | 3610 | 4219 | b828ce97c8082df61e6754e15e0fc58a1d438955cd6d74e10eb5aeb58d9e0173 |
| scripts/verify-deployment.mjs | 0 | 20899 | d582ca53708dda207d84d15f95da4a5fdd0d9ad672852d8172b621ae07bfcc66 |

## Kaynaklar

- [Can Evim menüsü](https://www.canevimsile.com/menu)
- [Rokethane](https://www.rokethane.com/)
- [Lotus restoran](https://lotussile.com/restoran/)
- [Şile Kamp menü](https://www.silekamp.com/menu)
- [Tripadvisor Şile](https://www.tripadvisor.com.tr/Restaurants-g29015513-Sile.html)
- [Google Maps URL belgeleri](https://developers.google.com/maps/documentation/urls/get-started)
- [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Vercel Git](https://vercel.com/docs/git)
