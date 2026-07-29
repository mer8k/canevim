export const metadata = {
  title: "Güncel Menü & Fiyat Listesi — Can Evim Şile",
  description: "Can Evim Şile güncel lezzet menüsü ve fiyat listesi.",
};

export default function MenuPage() {
  const menuCategories = [
    {
      id: "cat-kahvalti",
      title: "Kahvaltı",
      desc: "Doğal köy peynirleri, reçeller ve taze zeytin çeşitleri.",
      items: [
        {
          name: "Serpme Kahvaltı (İki Kişilik)",
          price: "1.700 ₺",
          desc: "Peynir tabağı, yeşil zeytin, siyah zeytin, çizik zeytin, acuka, çilek reçeli, portakal reçeli, çeri domates, salatalık, tereyağ, bal-kaymak, pişi (2 adet), muska börek (2 adet), sahanda yumurta, sınırsız çay (iki kişiliktir).",
          img: "/assets/images/serpme_kahvalti.jpg"
        },
        {
          name: "Kahvaltı Tabağı (Tek Kişilik)",
          price: "800 ₺",
          desc: "Peynir tabağı, yeşil zeytin, siyah zeytin, çizik zeytin, acuka, çilek reçeli, portakal reçeli, çeri domates, salatalık, tereyağ, haşlanmış yumurta, çay (2 adet) (tek kişiliktir).",
          img: "/assets/images/serpme_kahvalti.jpg"
        },
        {
          name: "İlave Kahvaltılık",
          price: "80 ₺",
          desc: "İlave reçel, zeytin, acuka veya peynir porsiyonu.",
          img: "/assets/images/serpme_kahvalti.jpg"
        }
      ]
    },
    {
      id: "cat-sicaklar",
      title: "Ekstra Sıcaklar & Omletler",
      desc: "Tavada sıcak servis edilen kahvaltılık çeşitlerimiz.",
      items: [
        {
          name: "Mıhlama / Kuymak",
          price: "400 ₺",
          desc: "Trabzon tereyağı, uzayan kolot peyniri ve mısır unu ile bakır tavada.",
          img: "/assets/images/menemen_mihlama.jpg"
        },
        {
          name: "Menemen",
          price: "300 ₺",
          desc: "Taze domates, biber ve yumurtalı sahanda menemen.",
          img: "/assets/images/menemen_mihlama.jpg"
        },
        {
          name: "Sucuklu Omlet",
          price: "350 ₺",
          desc: "Taze kasap sucuklu sıcak sahanda omlet.",
          img: "/assets/images/omlet.jpg"
        },
        {
          name: "Peynirli Omlet",
          price: "300 ₺",
          desc: "Bol kaşar veya beyaz peynirli sıcak omlet.",
          img: "/assets/images/omlet.jpg"
        },
        {
          name: "Kıymalı Omlet",
          price: "400 ₺",
          desc: "Özel baharatlı kıymalı sıcak omlet.",
          img: "/assets/images/omlet.jpg"
        },
        {
          name: "Sade Omlet",
          price: "200 ₺",
          desc: "Taze çırpılmış sahanda sade omlet.",
          img: "/assets/images/omlet.jpg"
        },
        {
          name: "Sahanda Yumurta",
          price: "200 ₺",
          desc: "Tereyağlı sıcak sahanda yumurta.",
          img: "/assets/images/omlet.jpg"
        },
        {
          name: "Haşlanmış Yumurta",
          price: "60 ₺",
          desc: "Taze haşlanmış köy yumurtası.",
          img: "/assets/images/haslanmis_yumurta.jpg"
        },
        {
          name: "Tavada Sucuk",
          price: "300 ₺",
          desc: "Cızbız tavada dilimlenmiş kasap sucuğu.",
          img: "/assets/images/tavada_sucuk.jpg"
        },
        {
          name: "Patates Kızartması",
          price: "200 ₺",
          desc: "Çıtır parmak patates kızartması.",
          img: "/assets/images/patates_kizartmasi.jpg"
        },
        {
          name: "Biber Kızartması",
          price: "200 ₺",
          desc: "Domates soslu sıcak biber kızartması.",
          img: "/assets/images/biber_kizartmasi.jpg"
        },
        {
          name: "Pişi Tabağı (4 Adet)",
          price: "200 ₺",
          desc: "Sıcacık puf puf 4 adet el yapımı pişi.",
          img: "/assets/images/pisiler.jpg"
        },
        {
          name: "Muska Börek (4 Adet)",
          price: "250 ₺",
          desc: "Çıtır el açması 4 adet muska böreği.",
          img: "/assets/images/muska_borek.jpg"
        },
        {
          name: "Karışık Kızartma",
          price: "250 ₺",
          desc: "Kızarmış patates ve biberin üstüne özel domates sosu.",
          img: "/assets/images/kizartma.jpg"
        },
        {
          name: "Mercimek Çorbası",
          price: "150 ₺",
          desc: "Sıcacık süzme ev usulü mercimek çorbası.",
          img: "/assets/images/corba.jpg"
        }
      ]
    },
    {
      id: "cat-tostlar",
      title: "Tostlar & Izgaralar",
      desc: "Izgaradan çıkan sıcak çıtır lezzetler.",
      items: [
        {
          name: "Çıtır Kaşarlı Tost",
          price: "200 ₺",
          desc: "Bol kaşar peynirli tereyağlı çıtır tost.",
          img: "/assets/images/tost_kofte.jpg"
        },
        {
          name: "Sucuklu Tost",
          price: "250 ₺",
          desc: "Kasap sucuklu sıcak çıtır tost.",
          img: "/assets/images/karisik_tost.jpg"
        },
        {
          name: "Karışık Tost (Kaşarlı & Sucuklu)",
          price: "280 ₺",
          desc: "Bol kaşar ve kasap sucuklu karışık tost.",
          img: "/assets/images/karisik_tost.jpg"
        },
        {
          name: "Izgara Köfte Ekmek",
          price: "350 ₺",
          desc: "Izgara dana köfteleri, domates ve yeşillikle ekmek arası.",
          img: "/assets/images/tost_kofte.jpg"
        }
      ]
    },
    {
      id: "cat-gozleme",
      title: "El Açması Gözlemeler & Saç Kavurma",
      desc: "İncecik elde açılan gözlemeler ve döküm saçta et.",
      items: [
        {
          name: "Patatesli Gözleme",
          price: "250 ₺",
          desc: "Elde açılan hamur ve baharatlı patates harcı.",
          img: "/assets/images/gozleme_kavurma.jpg"
        },
        {
          name: "Kaşarlı Köy Gözlemesi",
          price: "250 ₺",
          desc: "Eriyen bol kaşar peynirli el açması gözleme.",
          img: "/assets/images/gozleme_kavurma.jpg"
        },
        {
          name: "Kıymalı Köy Gözlemesi",
          price: "280 ₺",
          desc: "Özel harçlı kıymalı el açması gözleme.",
          img: "/assets/images/gozleme_kavurma.jpg"
        },
        {
          name: "Leziz Saç Kavurma",
          price: "450 ₺",
          desc: "Dana eti, domates ve biberle sıcak döküm saçta.",
          img: "/assets/images/sac_kavurma.jpg"
        }
      ]
    },
    {
      id: "cat-tatli",
      title: "Tatlılar & İçecekler",
      desc: "El yapımı ev tatlıları ve içeceklerimiz.",
      items: [
        {
          name: "Dilara Hanım'ın Ev Yapımı Tiramisusu",
          price: "200 ₺",
          desc: "İtalyan usulü taze mascarpone kıvamında el yapımı tiramisu.",
          img: "/assets/images/tatli_kahve.jpg"
        },
        {
          name: "Termos Demleme Çay",
          price: "150 ₺",
          desc: "Tüm kahvaltı boyunca sıcaklığını koruyan büyük boy termos çay.",
          img: "/assets/images/termos_cay.jpg"
        },
        {
          name: "Közde Türk Kahvesi",
          price: "90 ₺",
          desc: "Taze çekilmiş, bol köpüklü Türk kahvesi. Su ve lokum ile.",
          img: "/assets/images/tatli_kahve.jpg"
        }
      ]
    }
  ];

  return (
    <main className="menu-page">
      {/* MENU PAGE HERO */}
      <section className="menu-page-hero">
        <div className="container text-center">
          <h1>Lezzet Menümüz</h1>
        </div>
      </section>

      {/* STICKY CATEGORY NAV */}
      <div className="sticky-menu-nav">
        <div className="container">
          <div className="category-scroll-wrapper">
            <a href="#cat-kahvalti" className="cat-pill active">Kahvaltı</a>
            <a href="#cat-sicaklar" className="cat-pill">Ekstra Sıcaklar</a>
            <a href="#cat-tostlar" className="cat-pill">Tostlar & Izgara</a>
            <a href="#cat-gozleme" className="cat-pill">Gözleme & Kavurma</a>
            <a href="#cat-tatli" className="cat-pill">Tatlılar & İçecekler</a>
          </div>
        </div>
      </div>

      {/* CATEGORIZED MENU LIST */}
      <div className="menu-content-container">
        <div className="container">
          {menuCategories.map((cat) => (
            <section key={cat.id} className="category-block" id={cat.id}>
              <div className="category-title-bar">
                <h2>{cat.title}</h2>
                <p>{cat.desc}</p>
              </div>

              <div className="category-items-grid">
                {cat.items.map((item, idx) => (
                  <div key={idx} className="food-card">
                    <div className="food-card-img-wrap">
                      <img src={item.img} alt={item.name} loading="lazy" />
                      <span className="food-card-price">{item.price}</span>
                    </div>
                    <div className="food-card-body">
                      <h3 className="food-card-title">{item.name}</h3>
                      <p className="food-card-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
