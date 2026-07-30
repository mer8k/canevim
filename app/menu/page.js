'use client';

import { useState } from 'react';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const menuCategories = [
    {
      id: "cat-kahvalti",
      title: "KÖY KAHVALTISI",
      sub: "K A H V A L T I",
      desc: "Doğal köy peynirleri, ev reçelleri ve sınırsız termos çay ile.",
      badge: "Özel Kahvaltı",
      plates: [
        "/assets/images/serpme_kahvalti.jpg",
        "/assets/images/pisiler.jpg",
        "/assets/images/muska_borek.jpg"
      ],
      items: [
        {
          name: "Serpme Köy Kahvaltısı (İki Kişilik)",
          price: "1.700 ₺",
          desc: "Peynir tabağı, yeşil & siyah zeytin, acuka, çilek & portakal reçeli, çeri domates, salatalık, tereyağ, bal-kaymak, pişi (2 adet), muska böreği (2 adet), sahanda yumurta ve sınırsız termos çay."
        },
        {
          name: "Kahvaltı Tabağı (Tek Kişilik)",
          price: "800 ₺",
          desc: "Zengin peynir çeşitleri, zeytinler, acuka, reçeller, domates, salatalık, tereyağı, haşlanmış yumurta ve 2 adet çay."
        },
        {
          name: "İlave Kahvaltılık Porsiyon",
          price: "80 ₺",
          desc: "İlave ev reçeli, zeytin tabağı, özel acuka veya süzme peynir porsiyonu."
        }
      ]
    },
    {
      id: "cat-sicaklar",
      title: "TAVADA SICAKLAR & OMLETLER",
      sub: "S I C A K L A R",
      desc: "Bakır tavada cızbız pişen sıcak kahvaltılıklar ve omletler.",
      badge: "Tavadan Sıcak",
      plates: [
        "/assets/images/menemen_mihlama.jpg",
        "/assets/images/omlet.jpg",
        "/assets/images/tavada_sucuk.jpg"
      ],
      items: [
        {
          name: "Trabzon Mıhlama / Kuymak",
          price: "400 ₺",
          desc: "Trabzon tereyağı, uzayan kolot peyniri ve mısır unu ile sıcak bakır tavada."
        },
        {
          name: "Özel Sahanda Menemen",
          price: "300 ₺",
          desc: "Taptaze Şile bahçe domatesleri, biber ve taze yumurta ile."
        },
        {
          name: "Sucuklu Kasap Omlet",
          price: "350 ₺",
          desc: "Özel baharatlı kasap sucuklu sıcak sahanda omlet."
        },
        {
          name: "Bol Kaşarlı Omlet",
          price: "300 ₺",
          desc: "Eriyen bol kaşar peynirli veya ezine beyaz peynirli omlet."
        },
        {
          name: "Baharatlı Kıymalı Omlet",
          price: "400 ₺",
          desc: "Özel harçlı taze kıymalı sahanda omlet."
        },
        {
          name: "Sade Sahanda Omlet",
          price: "200 ₺",
          desc: "Taze çırpılmış sahanda sade tereyağlı omlet."
        },
        {
          name: "Tereyağlı Sahanda Yumurta",
          price: "200 ₺",
          desc: "Köy tereyağında göz yumurta."
        },
        {
          name: "Haşlanmış Köy Yumurtası",
          price: "60 ₺",
          desc: "Taze kıvamında haşlanmış köy yumurtası."
        },
        {
          name: "Cızbız Tavada Sucuk",
          price: "300 ₺",
          desc: "Cızbız tavada dilimlenmiş sıcak kasap sucuğu."
        },
        {
          name: "Çıtır Patates Kızartması",
          price: "200 ₺",
          desc: "Altın sarısı çıtır parmak patates kızartması."
        },
        {
          name: "Domates Soslu Biber Kızartması",
          price: "200 ₺",
          desc: "Ev yapımı domates soslu sıcak biber kızartması."
        },
        {
          name: "Puf Puf Pişi Tabağı (4 Adet)",
          price: "200 ₺",
          desc: "Sıcacık puf puf 4 adet el yapımı pişi."
        },
        {
          name: "El Açması Muska Börek (4 Adet)",
          price: "250 ₺",
          desc: "Çıtır el açması 4 adet muska böreği."
        },
        {
          name: "Özel Soslu Karışık Kızartma",
          price: "250 ₺",
          desc: "Kızarmış patates ve biber üzerine özel domates sosu."
        },
        {
          name: "Süzme Ev Mercimek Çorbası",
          price: "150 ₺",
          desc: "Sıcacık kıvamlı ev usulü süzme mercimek çorbası."
        }
      ]
    },
    {
      id: "cat-tostlar",
      title: "TOSTLAR & IZGARALAR",
      sub: "T O S T L A R",
      desc: "Izgaradan ve döküm tost makinesinden çıkan sıcak lezzetler.",
      badge: "Çıtır Lezzetler",
      plates: [
        "/assets/images/karisik_tost.jpg",
        "/assets/images/tost_kofte.jpg"
      ],
      items: [
        {
          name: "Çıtır Kaşarlı Tost",
          price: "200 ₺",
          desc: "Bol kaşar peynirli ve tereyağlı çıtır tost."
        },
        {
          name: "Kasap Sucuklu Tost",
          price: "250 ₺",
          desc: "Özel kasap sucuklu ve tereyağlı çıtır tost."
        },
        {
          name: "Karışık Tost (Kaşarlı & Sucuklu)",
          price: "280 ₺",
          desc: "Bol kaşar ve kasap sucuklu özel karışık tost."
        },
        {
          name: "Ekmek Arası Izgara Anne Köftesi",
          price: "350 ₺",
          desc: "Izgara dana köfteleri, taze domates ve yeşillikle ekmek arası."
        }
      ]
    },
    {
      id: "cat-gozleme",
      title: "EL AÇMASI GÖZLEME & KAVURMA",
      sub: "G Ö Z L E M E L E R",
      desc: "Sac üzerinde incecik elde açılan gözlemeler ve döküm et kavurma.",
      badge: "El Açması",
      plates: [
        "/assets/images/gozleme_kavurma.jpg",
        "/assets/images/sac_kavurma.jpg"
      ],
      items: [
        {
          name: "Patatesli Köy Gözlemesi",
          price: "250 ₺",
          desc: "Sac üzerinde elde açılan hamur ve özel baharatlı patates harcı."
        },
        {
          name: "Kaşarlı Köy Gözlemesi",
          price: "250 ₺",
          desc: "Eriyen bol kaşar peynirli sıcak el açması gözleme."
        },
        {
          name: "Baharatlı Kıymalı Gözleme",
          price: "280 ₺",
          desc: "Özel kıymalı harç ile elde açılan nefis köy gözlemesi."
        },
        {
          name: "Döküm Saçta Leziz Et Kavurma",
          price: "450 ₺",
          desc: "Lokum dana eti, domates ve biberle cızbız döküm saçta."
        }
      ]
    },
    {
      id: "cat-tatli",
      title: "TATLILAR & İÇECEKLER",
      sub: "T A T L I L A R",
      desc: "Dilara Hanım'ın el yapımı tatlıları ve demleme çay.",
      badge: "El Yapımı",
      plates: [
        "/assets/images/tatli_kahve.jpg",
        "/assets/images/termos_cay.jpg"
      ],
      items: [
        {
          name: "Dilara Hanım'ın Ev Yapımı Tiramisusu",
          price: "200 ₺",
          desc: "İtalyan usulü taze mascarpone kremalı el yapımı özel tiramisu."
        },
        {
          name: "Termos Demleme Çay",
          price: "150 ₺",
          desc: "Masada tüm kahvaltı boyunca sıcacık kalan büyük boy termos çay."
        },
        {
          name: "Közde Bol Köpüklü Türk Kahvesi",
          price: "90 ₺",
          desc: "Taze çekilmiş köpüklü Türk kahvesi. Su ve lokum ikramı ile."
        }
      ]
    }
  ];

  const filteredCategories = activeCategory === "all" 
    ? menuCategories 
    : menuCategories.filter(c => c.id === activeCategory);

  return (
    <main className="perfect-menu-page">
      {/* REFINED COMPACT HERO */}
      <section className="perfect-menu-hero">
        <div className="container text-center">
          <span className="perfect-hero-tag">CAN EVİM ŞİLE</span>
          <h1 className="perfect-hero-title">Lezzet Menümüz</h1>
          <p className="perfect-hero-sub">Taptaze serpme kahvaltılar, el açması gözlemeler ve sıcacık ikramlar.</p>
        </div>
      </section>

      {/* FILTER PILLS */}
      <div className="perfect-nav-sticky">
        <div className="container">
          <div className="perfect-nav-wrapper">
            <button 
              className={`perfect-nav-btn ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              Tüm Menü
            </button>
            {menuCategories.map((c) => (
              <button
                key={c.id}
                className={`perfect-nav-btn ${activeCategory === c.id ? "active" : ""}`}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.title.split('&')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REFINED MENU SHEETS CONTAINER */}
      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="perfect-sheets-stack">
          {filteredCategories.map((cat) => (
            <div key={cat.id} id={cat.id} className="perfect-sheet">
              {/* TOP HEADER BAND */}
              <div className="perfect-sheet-topband">
                <div>
                  <span className="perfect-sheet-sub">{cat.sub}</span>
                  <h2 className="perfect-sheet-h2">{cat.title}</h2>
                </div>
                <span className="perfect-sheet-badge">{cat.badge}</span>
              </div>

              {/* SHEET MAIN SPLIT */}
              <div className="perfect-sheet-body">
                {/* LEFT ITEMS LIST WITH CLASSIC RESTAURANT DOTTED LEADERS */}
                <div className="perfect-sheet-items">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="perfect-menu-item">
                      <div className="perfect-item-header">
                        <span className="perfect-item-title">{item.name}</span>
                        <span className="perfect-item-dots"></span>
                        <span className="perfect-item-price">{item.price}</span>
                      </div>
                      {item.desc && <p className="perfect-item-desc">{item.desc}</p>}
                    </div>
                  ))}
                </div>

                {/* RIGHT ACCENT STRIP WITH BALANCED FLOATING ROUND PLATES */}
                <div className="perfect-sheet-side">
                  {cat.plates.map((plateImg, pIdx) => (
                    <div key={pIdx} className="perfect-round-plate">
                      <img src={plateImg} alt={`${cat.title} ${pIdx + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>

              {/* SHEET FOOTER */}
              <div className="perfect-sheet-footer">
                <span>📍 Alemdağ Şile Yolu Cd. No: 193 (Üvezli Sapağı)</span>
                <span>📞 0537 497 50 62 · www.canevimsile.com</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
