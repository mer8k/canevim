export const metadata = {
  title: "Özel Lezzet Menüsü & Fiyat Listesi — Can Evim Şile",
  description: "Can Evim Şile resmi lezzet menüsü ve güncel fiyat listesi.",
};

export default function MenuPage() {
  const menuCategories = [
    {
      id: "cat-kahvalti",
      title: "K A H V A L T I",
      rawTitle: "KÖY KAHVALTISI",
      desc: "Doğal köy peynirleri, ev reçelleri ve sınırsız termos çay ile.",
      plates: [
        "/assets/images/serpme_kahvalti.jpg",
        "/assets/images/pisiler.jpg",
        "/assets/images/muska_borek.jpg"
      ],
      items: [
        {
          name: "SERPME KÖY KAHVALTISI (İKİ KİŞİLİK)",
          price: "1.700,00 ₺",
          desc: "Peynir tabağı, yeşil & siyah zeytin, acuka, çilek & portakal reçeli, çeri domates, salatalık, tereyağ, bal-kaymak, pişi (2 adet), muska böreği (2 adet), sahanda yumurta ve sınırsız termos çay."
        },
        {
          name: "KAHVALTI TABAĞI (TEK KİŞİLİK)",
          price: "800,00 ₺",
          desc: "Zengin peynir çeşitleri, zeytinler, acuka, reçeller, domates, salatalık, tereyağı, haşlanmış yumurta ve 2 adet çay."
        },
        {
          name: "İLAVE KAHVALTILIK PORSİYON",
          price: "80,00 ₺",
          desc: "İlave ev reçeli, zeytin tabağı, özel acuka veya süzme peynir porsiyonu."
        }
      ]
    },
    {
      id: "cat-sicaklar",
      title: "S I C A K L A R  &  O M L E T L E R",
      rawTitle: "TAVADA SICAKLAR",
      desc: "Bakır tavada cızbız pişen sıcak kahvaltılıklar ve omletler.",
      plates: [
        "/assets/images/menemen_mihlama.jpg",
        "/assets/images/omlet.jpg",
        "/assets/images/tavada_sucuk.jpg"
      ],
      items: [
        {
          name: "TRABZON MIHLAMA / KUYMAK",
          price: "400,00 ₺",
          desc: "Trabzon tereyağı, uzayan kolot peyniri ve mısır unu ile sıcak bakır tavada."
        },
        {
          name: "ÖZEL SAHANDA MENEMEN",
          price: "300,00 ₺",
          desc: "Taptaze Şile bahçe domatesleri, biber ve taze yumurta ile."
        },
        {
          name: "SUCUKLU KASAP OMLET",
          price: "350,00 ₺",
          desc: "Özel baharatlı kasap sucuklu sıcak sahanda omlet."
        },
        {
          name: "BOL KAŞARLI OMLET",
          price: "300,00 ₺",
          desc: "Eriyen bol kaşar peynirli veya ezine beyaz peynirli omlet."
        },
        {
          name: "BAHARATLI KIYMALI OMLET",
          price: "400,00 ₺",
          desc: "Özel harçlı taze kıymalı sahanda omlet."
        },
        {
          name: "SADE SAHANDA OMLET",
          price: "200,00 ₺",
          desc: "Taze çırpılmış sahanda sade tereyağlı omlet."
        },
        {
          name: "TEREYAĞLI SAHANDA YUMURTA",
          price: "200,00 ₺",
          desc: "Köy tereyağında göz yumurta."
        },
        {
          name: "HAŞLANMIŞ KÖY YUMURTASI",
          price: "60,00 ₺",
          desc: "Taze kıvamında haşlanmış köy yumurtası."
        },
        {
          name: "CIZBIZ TAVADA SUCUK",
          price: "300,00 ₺",
          desc: "Cızbız tavada dilimlenmiş sıcak kasap sucuğu."
        },
        {
          name: "ÇITIR PATATES KIZARTMASI",
          price: "200,00 ₺",
          desc: "Altın sarısı çıtır parmak patates kızartması."
        },
        {
          name: "DOMATES SOSLU BİBER KIZARTMASI",
          price: "200,00 ₺",
          desc: "Ev yapımı domates soslu sıcak biber kızartması."
        },
        {
          name: "PUF PUF PİŞİ TABAĞI (4 ADET)",
          price: "200,00 ₺",
          desc: "Sıcacık puf puf 4 adet el yapımı pişi."
        },
        {
          name: "EL AÇMASI MUSKA BÖREK (4 ADET)",
          price: "250,00 ₺",
          desc: "Çıtır el açması 4 adet muska böreği."
        },
        {
          name: "ÖZEL SOSLU KARIŞIK KIZARTMA",
          price: "250,00 ₺",
          desc: "Kızarmış patates ve biber üzerine özel domates sosu."
        },
        {
          name: "SÜZME EV MERCİMEK ÇORBASI",
          price: "150,00 ₺",
          desc: "Sıcacık kıvamlı ev usulü süzme mercimek çorbası."
        }
      ]
    },
    {
      id: "cat-tostlar",
      title: "T O S T L A R  &  I Z G A R A",
      rawTitle: "ÇITIR TOSTLAR & IZGARA KÖFTE",
      desc: "Izgaradan ve döküm tost makinesinden çıkan sıcak lezzetler.",
      plates: [
        "/assets/images/karisik_tost.jpg",
        "/assets/images/tost_kofte.jpg"
      ],
      items: [
        {
          name: "ÇITIR KAŞARLI TOST",
          price: "200,00 ₺",
          desc: "Bol kaşar peynirli ve tereyağlı çıtır tost."
        },
        {
          name: "KASAP SUCUKLU TOST",
          price: "250,00 ₺",
          desc: "Özel kasap sucuklu ve tereyağlı çıtır tost."
        },
        {
          name: "KARIŞIK TOST (KAŞARLI & SUCUKLU)",
          price: "280,00 ₺",
          desc: "Bol kaşar ve kasap sucuklu özel karışık tost."
        },
        {
          name: "EKMEK ARASI IZGARA ANNE KÖFTESİ",
          price: "350,00 ₺",
          desc: "Izgara dana köfteleri, taze domates ve yeşillikle ekmek arası."
        }
      ]
    },
    {
      id: "cat-gozleme",
      title: "G Ö Z L E M E L E R  &  K A V U R M A",
      rawTitle: "EL AÇMASI GÖZLEME",
      desc: "Sac üzerinde incecik elde açılan gözlemeler ve döküm et kavurma.",
      plates: [
        "/assets/images/gozleme_kavurma.jpg",
        "/assets/images/sac_kavurma.jpg"
      ],
      items: [
        {
          name: "PATATESLİ KÖY GÖZLEMESİ",
          price: "250,00 ₺",
          desc: "Sac üzerinde elde açılan hamur ve özel baharatlı patates harcı."
        },
        {
          name: "KAŞARLI KÖY GÖZLEMESİ",
          price: "250,00 ₺",
          desc: "Eriyen bol kaşar peynirli sıcak el açması gözleme."
        },
        {
          name: "BAHARATLI KIYMALI GÖZLEME",
          price: "280,00 ₺",
          desc: "Özel kıymalı harç ile elde açılan nefis köy gözlemesi."
        },
        {
          name: "DÖKÜM SAÇTA LEZİZ ET KAVURMA",
          price: "450,00 ₺",
          desc: "Lokum dana eti, domates ve biberle cızbız döküm saçta."
        }
      ]
    },
    {
      id: "cat-tatli",
      title: "T A T L I L A R  &  İ Ç E C E K L E R",
      rawTitle: "EV TATLILARI & ÇAY",
      desc: "Dilara Hanım'ın el yapımı tatlıları ve demleme çay.",
      plates: [
        "/assets/images/tatli_kahve.jpg",
        "/assets/images/termos_cay.jpg"
      ],
      items: [
        {
          name: "DİLARA HANIM'IN EV YAPIMI TİRAMİSUSU",
          price: "200,00 ₺",
          desc: "İtalyan usulü taze mascarpone kremalı el yapımı özel tiramisu."
        },
        {
          name: "TERMOS DEMLEME ÇAY",
          price: "150,00 ₺",
          desc: "Masada tüm kahvaltı boyunca sıcacık kalan büyük boy termos çay."
        },
        {
          name: "KÖZDE BOL KÖPÜKLÜ TÜRK KAHVESİ",
          price: "90,00 ₺",
          desc: "Taze çekilmiş köpüklü Türk kahvesi. Su ve lokum ikramı ile."
        }
      ]
    }
  ];

  return (
    <main className="menu-page-template">
      {/* HEADER SECTION */}
      <section className="template-hero-header text-center">
        <div className="container">
          <h1 className="template-menu-title">MENÜ</h1>
          <p className="template-hero-subtitle">CAN EVİM ŞİLE · DOĞAL & LEZZETLİ</p>
        </div>
      </section>

      {/* CATEGORY NAV PILLS */}
      <div className="template-nav-bar">
        <div className="container">
          <div className="category-scroll-wrapper">
            <a href="#cat-kahvalti" className="cat-pill active">Kahvaltı</a>
            <a href="#cat-sicaklar" className="cat-pill">Sıcaklar & Omletler</a>
            <a href="#cat-tostlar" className="cat-pill">Tostlar & Izgara</a>
            <a href="#cat-gozleme" className="cat-pill">Gözleme & Kavurma</a>
            <a href="#cat-tatli" className="cat-pill">Tatlılar & İçecekler</a>
          </div>
        </div>
      </div>

      {/* CATEGORIZED MENU SHEETS (CANVA TEMPLATE DESIGN) */}
      <div className="container" style={{ paddingBottom: 60 }}>
        {menuCategories.map((cat) => (
          <div key={cat.id} id={cat.id} className="template-menu-sheet">
            {/* LEFT CONTENT LIST */}
            <div className="template-sheet-left">
              <div className="template-sheet-header">
                <div className="template-category-subtitle">{cat.title}</div>
                <p>{cat.desc}</p>
              </div>

              <div className="template-item-list">
                {cat.items.map((item, idx) => (
                  <div key={idx} className="template-item-row">
                    <div className="template-item-top">
                      <span className="template-item-name">{item.name}</span>
                      <span className="template-item-price">{item.price}</span>
                    </div>
                    {item.desc && <p className="template-item-desc">{item.desc}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT TERRACOTTA ORANGE STRIP WITH ROUND FOOD PLATES */}
            <div className="template-sheet-right">
              {cat.plates.map((plateImg, pIdx) => (
                <div key={pIdx} className="template-circle-plate">
                  <img src={plateImg} alt={`${cat.rawTitle} Görseli ${pIdx + 1}`} loading="lazy" />
                </div>
              ))}
            </div>

            {/* FOOTER BAR */}
            <div className="template-sheet-footer">
              <span>www.canevimsile.com</span>
              <span>Alemdağ Şile Yolu Cd. No: 193, 34980 Şile / İstanbul • Tel: 0537 497 50 62</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
