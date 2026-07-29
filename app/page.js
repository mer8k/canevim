'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const todayStr = "29 Temmuz 2026, Çarşamba";
  const tomorrowStr = "30 Temmuz 2026, Perşembe";

  const [selectedDate, setSelectedDate] = useState("Bugün (29 Temmuz)");
  const [customDateVal, setCustomDateVal] = useState("2026-07-29");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [selectedGuests, setSelectedGuests] = useState("2 Kişi (Serpme Kahvaltı)");
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    note: ''
  });

  const mapsUrl = "https://www.google.com/maps/dir//Can+Evim+%C5%9Eile,+%C3%9Cvezli,+Alemda%C4%9F+%C5%9Eile+Yolu+No:+193,+34980+%C5%9Eile%2F%C4%B0stanbul/@41.1664895,29.5977184,14z/data=!4m8!4m7!1m0!1m5!1m1!1s0x409fd5b99f0c193b:0x275f89d0fdeb1d23!2m2!1d29.4258912!2d41.1104673?entry=ttu&g_ep=EgoyMDI2MDcyNy4wIKXMDSoASAFQAw%3D%3D";
  const instagramUrl = "https://www.instagram.com/canevimsile/";

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const dateText = selectedDate === "Özel Tarih" ? customDateVal : selectedDate;
    const text = `Merhaba Can Evim Şile, Masa Rezervasyonu Talebi:\n\n👤 Ad Soyad: ${formData.name}\n📞 Telefon: ${formData.phone || 'Belirtilmedi'}\n📅 Tarih: ${dateText}\n⏰ Saat: ${selectedTime}\n👥 Kişi Sayısı: ${selectedGuests}\n📝 Not: ${formData.note || 'Yok'}`;
    const url = `https://wa.me/905374975062?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const reviews = [
    {
      name: "Zeynep BAYRAK",
      meta: "Google Değerlendirmesi",
      text: "Güler yüzle, hızlıca, taptaze, dolu dolu serpme kahvaltımız, termosla çayımız hemen geldi. Doyduk, dolduk taştık. Her şey çok lezzetliydi ellerine emeğine sağlık çok teşekkür ederiz."
    },
    {
      name: "Gözde Genç",
      meta: "Google Değerlendirmesi",
      text: "Bugünü harika bir kahvaltıyla taçlandırdık. İlgi ve alaka mükemmeldi. Özellikle o muhteşem menemeni mutlaka denemelisiniz, lezzeti anlatılmaz yaşanır! Emeği geçen herkesin eline sağlık."
    },
    {
      name: "Şerife Acar",
      meta: "Google Değerlendirmesi",
      text: "Hafta sonu denize giderken yol üstünde ayak üstü uğradığımız bir mekan. Kahvaltı çeşidi ve kalitesi çok iyiydi. Özellikle yediğimiz menemenin tadı tekrar gitmemize sebep olacak lezzette idi."
    },
    {
      name: "Sedat Kütük",
      meta: "Google Değerlendirmesi",
      text: "Yeni açılmış sıcak bir aile mekanı. Gözlemeleri anne eli değmiş gibi sıcacık ve lezzetli. Çalışanlar güler yüzlü ve ilgili. Ailenizle keyifle kahvaltı yapabileceğiniz huzurlu bir ortam."
    },
    {
      name: "Yusuf Uygun",
      meta: "Yerel Rehber · Google Değerlendirmesi",
      text: "Gözleme ve saç kavurma denedik. Her iki ürünün de lezzeti gayet başarılıydı. Gözlemenin yanında turşu ve söğüş ikram etmeleri hoş bir detay. Sıcak ekmek servisi harikaydı."
    },
    {
      name: "Volkan Şimşek",
      meta: "Yerel Rehber · Google Değerlendirmesi",
      text: "Çatal-kaşık servisinden, pişinin altına konulan kağıda kadar her şey özenle düşünülmüş. Kahvaltının lezzetinden ve kalitesinden son derece memnun kaldık."
    }
  ];

  const timeOptions = ["09:00", "10:00", "11:30", "13:00", "15:00", "17:00", "19:00", "21:00"];
  const guestOptions = [
    "2 Kişi (Serpme Kahvaltı)",
    "3-4 Kişi (Aile Masası)",
    "5-8 Kişi (Grup Kahvaltısı)",
    "8+ Kalabalık Etkinlik"
  ];

  return (
    <main>
      {/* HERO SECTION */}
      <div className="hero-wrapper" id="anasayfa">
        <div className="container">
          <div className="hero-card">
            <div className="hero-bg-img" style={{ backgroundImage: "url('/assets/images/serpme_kahvalti.jpg')" }}></div>
            <div className="hero-content">
              <div className="hero-badge-group">
                <span className="hero-eyebrow-badge">Alemdağ Şile Yolu · Üvezli Köyü Girişi</span>
                <span className="hero-rating-pill">★ 5.0 (80+ Değerlendirme)</span>
              </div>
              <h1>Doğanın içinde.<br/>Masada lezzet şöleni.</h1>
              <p>Alemdağ Şile Yolu No: 193 adresinde; sıcacık menemenli serpme köy kahvaltısı, el açması taze gözlemeler ve şömineli huzurlu ortam.</p>

              <a href="#rezervasyon" className="btn-hero-cta">
                Hemen Masa Ayırt ➔
              </a>
            </div>
          </div>

          {/* 4 SQUIRCLE ACTION ICON BUTTONS */}
          <div className="hero-action-bar">
            <a href={instagramUrl} target="_blank" rel="noopener" className="squircle-btn" aria-label="Instagram @canevimsile">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://wa.me/905374975062?text=Merhaba%20Can%20Evim%20%C5%9Eile%2C%20rezervasyon%20yapmak%20istiyorum." target="_blank" rel="noopener" className="squircle-btn" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.228-1.157z"/></svg>
            </a>
            <a href="tel:05374975062" className="squircle-btn" aria-label="Telefon Et">
              <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </a>
            <a href={mapsUrl} target="_blank" rel="noopener" className="squircle-btn" aria-label="Google Haritalar Yol Tarifi">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* HAKKIMIZDA */}
      <section className="section" id="hakkimizda">
        <div className="container">
          <div className="story">
            <div className="story-image">
              <img src="/assets/images/serpme_kahvalti.jpg" alt="Can Evim Şile Kahvaltı Masası" loading="lazy" />
            </div>
            <div className="story-text">
              <span className="section-tag">Hakkımızda</span>
              <h2>Doğanın ve lezzetin buluşma noktası.</h2>
              <p>Üvezli Köyü Girişi Alemdağ Şile Yolu Üzerinde No: 193 (3. Gözlemeci) adresindeki Can Evim Şile; yemyeşil bahçesi, şömineli sıcak iç mekanı ve eşsiz lezzetleriyle hizmet vermektedir.</p>
              <p>Özenle seçilmiş yöresel peynirler, puf puf pişiler, sahanda yumurtalar ve meşhur menemenimizle evinizdeki huzuru masanıza taşıyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LEZZET KATEGORİLERİ VİTRİNİ */}
      <section className="section section-soft" id="kategoriler">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Özel Mutfak</span>
            <h2>Lezzet Kategorilerimiz</h2>
            <p className="lead">Gözünüzün önünde hazırlanan el açması gözlemelerden zengin kahvaltılara kadar tüm çeşitlerimiz.</p>
          </div>

          <div className="category-showcase-grid">
            <Link href="/menu#cat-kahvalti" className="cat-card">
              <div className="cat-card-img">
                <img src="/assets/images/serpme_kahvalti.jpg" alt="Geleneksel Serpme Kahvaltılar" loading="lazy" />
              </div>
              <div className="cat-card-body">
                <span className="cat-card-tag">Zengin Çeşitler</span>
                <h3>Geleneksel Serpme Kahvaltılar</h3>
                <p>Sıcak menemen, pişi, muska böreği, peynir tabağı ve sınırsız çay ile.</p>
                <span className="cat-card-link">Menüyü Gör &rarr;</span>
              </div>
            </Link>

            <Link href="/menu#cat-sicaklar" className="cat-card">
              <div className="cat-card-img">
                <img src="/assets/images/menemen_mihlama.jpg" alt="Sıcaklar & Mıhlama" loading="lazy" />
              </div>
              <div className="cat-card-body">
                <span className="cat-card-tag">Tavada Sıcak</span>
                <h3>Sıcaklar & Karadeniz Mıhlaması</h3>
                <p>Trabzon tereyağlı uzayan mıhlama, taze sahanda menemen ve omletler.</p>
                <span className="cat-card-link">Menüyü Gör &rarr;</span>
              </div>
            </Link>

            <Link href="/menu#cat-tostlar" className="cat-card">
              <div className="cat-card-img">
                <img src="/assets/images/karisik_tost.jpg" alt="Tostlar & Izgara Köfte" loading="lazy" />
              </div>
              <div className="cat-card-body">
                <span className="cat-card-tag">Çıtır & Doyurucu</span>
                <h3>Çıtır Tostlar & Izgara Köfte</h3>
                <p>Bol kaşarlı, sucuklu özel tostlar ve ekmek arası ızgara anne köftesi.</p>
                <span className="cat-card-link">Menüyü Gör &rarr;</span>
              </div>
            </Link>

            <Link href="/menu#cat-gozleme" className="cat-card">
              <div className="cat-card-img">
                <img src="/assets/images/gozleme_kavurma.jpg" alt="El Açması Gözlemeler & Kavurma" loading="lazy" />
              </div>
              <div className="cat-card-body">
                <span className="cat-card-tag">Gözünüzün Önünde Açılır</span>
                <h3>El Açması Gözleme & Kavurma</h3>
                <p>İncecik elde açılan börek kıvamında gözlemeler ve sıcak saç kavurma.</p>
                <span className="cat-card-link">Menüyü Gör &rarr;</span>
              </div>
            </Link>

            <Link href="/menu#cat-tatli" className="cat-card">
              <div className="cat-card-img">
                <img src="/assets/images/tatli_kahve.jpg" alt="Ev Yapımı Tatlılar" loading="lazy" />
              </div>
              <div className="cat-card-body">
                <span className="cat-card-tag">El Yapımı İkram</span>
                <h3>Dilara Hanım'ın Ev Tatlıları</h3>
                <p>Taze İtalyan usulü Tiramisu ve özel Antep fıstıklı tatlı ikramları.</p>
                <span className="cat-card-link">Menüyü Gör &rarr;</span>
              </div>
            </Link>

            <Link href="/menu#cat-icecek" className="cat-card">
              <div className="cat-card-img">
                <img src="/assets/images/termos_cay.jpg" alt="İçecekler & Demleme Çay" loading="lazy" />
              </div>
              <div className="cat-card-body">
                <span className="cat-card-tag">Ferahlatıcı</span>
                <h3>Demleme Çay & İçecekler</h3>
                <p>Sıcaklığı koruyan termos çay, köpüklü yayık ayranı ve közde Türk kahvesi.</p>
                <span className="cat-card-link">Menüyü Gör &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* GALERİ */}
      <section className="section" id="galeri">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Fotoğraf Galerisi</span>
            <h2>Mekân ve Lezzetlerimiz</h2>
            <p className="lead">Can Evim Şile'nin huzurlu atmosferinden ve iştah açıcı lezzetlerinden kareler.</p>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="/assets/images/serpme_kahvalti.jpg" alt="Serpme Kahvaltı Masası" loading="lazy" />
              <div className="gallery-caption">Geleneksel Serpme Kahvaltı</div>
            </div>
            <div className="gallery-item">
              <img src="/assets/images/menemen_mihlama.jpg" alt="Sıcak Menemen & Mıhlama" loading="lazy" />
              <div className="gallery-caption">Menemen & Karadeniz Mıhlaması</div>
            </div>
            <div className="gallery-item">
              <img src="/assets/images/gozleme_kavurma.jpg" alt="El Açması Gözleme" loading="lazy" />
              <div className="gallery-caption">El Açması Köy Gözlemesi</div>
            </div>
            <div className="gallery-item">
              <img src="/assets/images/karisik_tost.jpg" alt="Tost & Izgara Köfte" loading="lazy" />
              <div className="gallery-caption">Çıtır Tostlar & Izgara Köfte</div>
            </div>
            <div className="gallery-item">
              <img src="/assets/images/somine.jpg" alt="Şömineli İç Mekan" loading="lazy" />
              <div className="gallery-caption">Şömineli İç Mekan</div>
            </div>
            <div className="gallery-item">
              <img src="/assets/images/tatli_kahve.jpg" alt="Ev Yapımı Tiramisu & Kahve" loading="lazy" />
              <div className="gallery-caption">Ev Yapımı Tiramisu & Kahve</div>
            </div>
          </div>
        </div>
      </section>

      {/* YORUMLAR SECTION */}
      <section className="section section-soft" id="yorumlar">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Misafir Değerlendirmeleri</span>
            <h2>5,0 Google Puanı</h2>
            <p className="lead">Google Haritalar üzerindeki gerçek misafir deneyimleri.</p>
          </div>

          <div className="reviews-grid">
            {reviews.map((r, idx) => (
              <div key={idx} className="review-card">
                <div>
                  <div className="rev-stars">★★★★★</div>
                  <p className="rev-quote">"{r.text}"</p>
                </div>
                <div>
                  <div className="rev-author">{r.name}</div>
                  <div className="rev-meta">{r.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REZERVASYON & İLETİŞİM — ULTRA LUXURY CUSTOM PILL PICKERS */}
      <section className="section" id="rezervasyon">
        <div className="container">
          <div className="contact-split">
            {/* LEFT CONTACT INFO */}
            <div className="contact-info" id="iletisim">
              <span className="section-tag">İletişim & Lokasyon</span>
              <h2>Bize Ulaşın.</h2>
              <p className="lead">Üvezli, Alemdağ Şile Yolu Cd. No: 193, 34980 Şile / İstanbul <br/><strong style={{ color: '#0284c7' }}>(Üvezli Sapağı 3. Gözlemeci)</strong></p>
              
              <ul className="info-list-luxury">
                <li>
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  </div>
                  <div>
                    <span className="label">Telefon & WhatsApp</span>
                    <span className="val"><a href="tel:05374975062">0537 497 50 62</a></span>
                  </div>
                </li>

                <li>
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </div>
                  <div>
                    <span className="label">Resmi Instagram</span>
                    <span className="val"><a href={instagramUrl} target="_blank" rel="noopener">@canevimsile</a></span>
                  </div>
                </li>

                <li>
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                  </div>
                  <div>
                    <span className="label">Çalışma Saatleri</span>
                    <span className="val">Her Gün: 08:00 – 00:00 <span className="status-live-dot">🟢 ŞU AN AÇIK</span></span>
                  </div>
                </li>

                <li>
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                  </div>
                  <div>
                    <span className="label">Otopark</span>
                    <span className="val">Ücretsiz Geniş Otopark Alanı</span>
                  </div>
                </li>
              </ul>

              <div className="contact-actions">
                <a href="tel:05374975062" className="btn-hero-cta" style={{ padding: "12px 28px", fontSize: "0.9rem" }}>Hemen Ara</a>
                <a href={mapsUrl} target="_blank" rel="noopener" className="btn-hero-cta" style={{ background: "#e4e4e7", color: "#09090b", padding: "12px 28px", fontSize: "0.9rem" }}>Google Haritalar Yol Tarifi</a>
              </div>
            </div>

            {/* RIGHT ULTRA-LUXURY FORM WITH CUSTOM SELECTION PILLS */}
            <div className="contact-form-box-luxury">
              <div className="form-header-badge">
                <span className="sparkle-icon">✨</span> Anında WhatsApp Onaylı Masa Rezervasyonu
              </div>
              <h3>Masa Rezervasyonu</h3>
              <p className="form-subtitle">Masayı sizin için hazırlayalım. Tarih ve saat seçip tek tıkla WhatsApp'tan gönderin.</p>

              <form onSubmit={handleWhatsAppSubmit}>
                {/* NAME INPUT */}
                <div className="form-group-luxury">
                  <label htmlFor="resName">
                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    id="resName"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* PHONE INPUT */}
                <div className="form-group-luxury">
                  <label htmlFor="resPhone">
                    <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="resPhone"
                    placeholder="Örn: 05xx xxx xx xx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* CUSTOM DATE SELECTION PILLS (NO UGLY BROWSER PICKER!) */}
                <div className="form-group-luxury">
                  <label>
                    <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                    Rezervasyon Tarihi *
                  </label>
                  <div className="option-pill-group">
                    <button
                      type="button"
                      className={`option-pill ${selectedDate === "Bugün (29 Temmuz)" ? "active" : ""}`}
                      onClick={() => setSelectedDate("Bugün (29 Temmuz)")}
                    >
                      📅 Bugün (29 Temmuz)
                    </button>
                    <button
                      type="button"
                      className={`option-pill ${selectedDate === "Yarın (30 Temmuz)" ? "active" : ""}`}
                      onClick={() => setSelectedDate("Yarın (30 Temmuz)")}
                    >
                      🌅 Yarın (30 Temmuz)
                    </button>
                    <button
                      type="button"
                      className={`option-pill ${selectedDate === "Bu Hafta Sonu" ? "active" : ""}`}
                      onClick={() => setSelectedDate("Bu Hafta Sonu")}
                    >
                      🌿 Bu Hafta Sonu
                    </button>
                    <button
                      type="button"
                      className={`option-pill ${selectedDate === "Özel Tarih" ? "active" : ""}`}
                      onClick={() => setSelectedDate("Özel Tarih")}
                    >
                      ✏️ Özel Tarih
                    </button>
                  </div>
                  {selectedDate === "Özel Tarih" && (
                    <input
                      type="text"
                      style={{ marginTop: 8 }}
                      placeholder="Örn: 15 Ağustos 2026"
                      value={customDateVal}
                      onChange={(e) => setCustomDateVal(e.target.value)}
                    />
                  )}
                </div>

                {/* CUSTOM TIME SELECTION PILLS */}
                <div className="form-group-luxury">
                  <label>
                    <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    Rezervasyon Saati *
                  </label>
                  <div className="option-pill-group time-grid">
                    {timeOptions.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`option-pill ${selectedTime === t ? "active" : ""}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CUSTOM GUEST COUNT PILLS */}
                <div className="form-group-luxury">
                  <label>
                    <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    Kişi Sayısı & Konsept *
                  </label>
                  <div className="option-pill-group">
                    {guestOptions.map((g) => (
                      <button
                        type="button"
                        key={g}
                        className={`option-pill ${selectedGuests === g ? "active" : ""}`}
                        onClick={() => setSelectedGuests(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SPECIAL NOTE */}
                <div className="form-group-luxury">
                  <label htmlFor="resNote">
                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    Özel İstek veya Not (Opsiyonel)
                  </label>
                  <textarea
                    id="resNote"
                    rows="2"
                    placeholder="Bahçe masası, şömine kenarı, bebek sandalyesi talebi vb."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-whatsapp-submit">
                  <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.228-1.157z"/></svg>
                  WhatsApp İle Masa Rezervasyonu Yap
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
