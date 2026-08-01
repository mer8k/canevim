import Image from "next/image";
import FadeIn from "../components/FadeIn";

export const metadata = {
  title: "Menü — Can Evim Şile",
  description: "Can Evim Şile kahvaltı, ana yemekler, tatlılar ve içecek menüsü.",
};

export default function MenuPage() {
  return (
    <main className="min-h-screen relative w-full bg-[#fcfaf7] selection:bg-black/10 flex flex-col text-[#222]">
      
      {/* Menu Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh] min-h-[400px] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/serpme.jpeg"
            alt="Can Evim Şile Menü"
            fill
            priority
            className="object-cover object-[center_70%]"
          />
        </div>
        
        {/* Gradient overlay to blend hero into the solid background */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-[#fcfaf7]" />

        <div className="relative z-20 flex flex-col items-center px-4 mt-auto pb-16 md:pb-24">
          <p className="font-sans text-[11px] md:text-[13px] tracking-[0.4em] uppercase text-white/90 mb-4 drop-shadow-md">
            Doğadan Masanıza
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-[84px] font-serif text-[#222] tracking-wide mb-2">
            Menü
          </h1>
        </div>
      </div>

      {/* Menu Content */}
      <div className="w-full relative z-10 flex flex-col items-center">
        
        {/* Intro Text */}
        <div className="w-full px-6 pt-4 pb-16 md:pb-24 max-w-[1000px] mx-auto text-center">
          <FadeIn delay={0.1}>
            <p className="font-serif text-[18px] md:text-[24px] text-[#444] max-w-2xl mx-auto leading-relaxed italic">
              Mevsimin en taze malzemeleriyle, geleneksel reçetelere sadık kalarak hazırladığımız eşsiz seçkilerimiz.
            </p>
          </FadeIn>
        </div>

        {/* --- PART 1: KAHVALTI & SICAKLAR --- */}
        <div className="w-full max-w-[1000px] px-4 md:px-12 pb-16 md:pb-24 flex flex-col gap-16 md:gap-24">
          <FadeIn direction="up">
            <section className="flex flex-col items-center text-center w-full">
              <h2 className="text-2xl md:text-4xl font-serif text-[#222] mb-10 md:mb-12 border-b border-[#222]/20 pb-4 px-8 md:px-12 uppercase tracking-widest">Kahvaltı</h2>
              
              <div className="w-full flex flex-col gap-10 md:gap-12">
                <div className="flex flex-col items-center">
                  <h3 className="font-sans text-[14px] md:text-[18px] font-medium tracking-[0.15em] text-[#c39b53] uppercase mb-3">Serpme Kahvaltı</h3>
                  <p className="font-serif text-[14px] md:text-[17px] text-[#444] leading-relaxed max-w-2xl px-2">
                    Peynir tabağı, yeşil zeytin, siyah zeytin, çizik zeytin, acuka, çilek reçeli, portakal reçeli, çeri domates, salatalık, tereyağ, bal-kaymak, pişi, muska börek, sahanda yumurta, menemen, sınırsız çay.
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <h3 className="font-sans text-[14px] md:text-[18px] font-medium tracking-[0.15em] text-[#c39b53] uppercase mb-3">Kahvaltı Tabağı</h3>
                  <p className="font-serif text-[14px] md:text-[17px] text-[#444] leading-relaxed max-w-2xl px-2">
                    Peynir tabağı, yeşil zeytin, siyah zeytin, çizik zeytin, acuka, çilek reçeli, portakal reçeli, çeri domates, salatalık, tereyağ, haşlanmış yumurta, çay.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <FadeIn direction="up">
            <section className="flex flex-col items-center w-full">
              <h2 className="text-2xl md:text-4xl font-serif text-[#222] mb-10 md:mb-12 border-b border-[#222]/20 pb-4 px-8 md:px-12 uppercase tracking-widest text-center">Ekstra Sıcaklar</h2>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 md:gap-y-6 max-w-2xl px-4 md:px-0 text-center md:text-left">
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Mıhlama</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:text-right border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Menemen</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Sucuklu Omlet</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:text-right border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Peynirli Omlet</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Kıymalı Omlet</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:text-right border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Sade Omlet</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Sahanda Yumurta</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:text-right border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Haşlanmış Yumurta</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Tavada Sucuk</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:text-right border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Patates Kızartması</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Biber Kızartması</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:text-right border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Pişi Tabağı</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Muska Börek</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:text-right border-b border-[#e5e3dc] md:border-none pb-2 md:pb-0">Mercimek Çorbası</div>
                <div className="font-serif text-[15px] md:text-[18px] text-[#444] md:col-span-2 text-center mt-2 md:mt-4">
                  Karışık Kızartma <span className="block md:inline text-[#666] text-[13px] italic md:ml-2 mt-1 md:mt-0">(Kızarmış patates ve biberin üstüne domates sosu)</span>
                </div>
              </div>
            </section>
          </FadeIn>
        </div>

        {/* DIVIDER 1 */}
        <FadeIn direction="up">
          <div className="relative w-full h-[40vh] md:h-[450px] lg:h-[550px] max-w-[1000px] mx-auto overflow-hidden md:rounded-xl shadow-sm border-y md:border border-[#e5e3dc] my-8 md:my-16">
             <Image 
                src="/images/kesinkullan.jpeg"
                alt="Can Evim Kesin Kullan"
                fill
                className="object-cover object-[center_60%]"
              />
          </div>
        </FadeIn>

        {/* --- PART 2: ANA YEMEKLER, TOSTLAR & SALATALAR --- */}
        <div className="w-full max-w-[1000px] px-4 md:px-12 py-16 md:py-24 flex flex-col gap-16 md:gap-24">
          <FadeIn direction="up">
            <section className="flex flex-col items-center text-center w-full">
              <h2 className="text-2xl md:text-4xl font-serif text-[#222] mb-10 md:mb-12 border-b border-[#222]/20 pb-4 px-8 md:px-12 uppercase tracking-widest">Ana Yemekler</h2>
              
              <div className="w-full flex flex-col gap-10 md:gap-12">
                <div className="flex flex-col items-center">
                  <h3 className="font-sans text-[14px] md:text-[18px] font-medium tracking-[0.15em] text-[#c39b53] uppercase mb-3">Gözleme Çeşitleri</h3>
                  <p className="font-serif text-[14px] md:text-[17px] text-[#444]">
                    Patatesli, Kaşarlı, Beyaz Peynirli, Pazılı, Kıymalı, Sucuklu
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <h3 className="font-sans text-[14px] md:text-[18px] font-medium tracking-[0.15em] text-[#c39b53] uppercase mb-3">Izgara Etler</h3>
                  <p className="font-serif text-[14px] md:text-[17px] text-[#444] leading-loose">
                    Izgara Köfte <span className="text-[#666] italic text-[13px] ml-1">(Pilav, domates ve biber ile)</span><br/>
                    Izgara Sucuk <span className="text-[#666] italic text-[13px] ml-1">(Pilav, domates ve biber ile)</span><br/>
                    Piliç Izgara <span className="text-[#666] italic text-[13px] ml-1">(Pilav, domates ve biber ile)</span><br/>
                    Sac Kavurma
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="font-sans text-[14px] md:text-[18px] font-medium tracking-[0.15em] text-[#c39b53] uppercase mb-3">Yöresel Lezzetler</h3>
                  <p className="font-serif text-[14px] md:text-[17px] text-[#444]">
                    Ev Yapımı Mantı, Çıtır Mantı, Çiğbörek
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <FadeIn direction="up">
            <section className="flex flex-col items-center text-center w-full">
              <h2 className="text-2xl md:text-4xl font-serif text-[#222] mb-10 md:mb-12 border-b border-[#222]/20 pb-4 px-8 md:px-12 uppercase tracking-widest">Tostlar ve Sandviçler</h2>
              
              <div className="w-full flex flex-col gap-4 md:gap-5 font-serif text-[15px] md:text-[18px] text-[#444]">
                <p>Kaşarlı Tost</p>
                <p>Sucuklu Tost</p>
                <p>Karışık Tost</p>
                <p className="font-sans tracking-widest uppercase mt-4 text-[#c39b53]">Köfte Ekmek</p>
              </div>
            </section>
          </FadeIn>

          <FadeIn direction="up">
            <section className="flex flex-col items-center text-center w-full">
              <h2 className="text-2xl md:text-4xl font-serif text-[#222] mb-10 md:mb-12 border-b border-[#222]/20 pb-4 px-8 md:px-12 uppercase tracking-widest">Salatalar</h2>
              
              <div className="w-full flex flex-col gap-4 md:gap-5 font-serif text-[15px] md:text-[18px] text-[#444]">
                <p>Mevsim Salata</p>
                <p>Çoban Salata</p>
              </div>
            </section>
          </FadeIn>
        </div>

        {/* DIVIDER 2 */}
        <FadeIn direction="up">
          <div className="relative w-full h-[40vh] md:h-[450px] lg:h-[550px] max-w-[1000px] mx-auto overflow-hidden md:rounded-xl shadow-sm border-y md:border border-[#e5e3dc] my-8 md:my-16">
             <Image 
                src="/images/kesinkullan3.jpeg"
                alt="Can Evim Lezzetleri"
                fill
                className="object-cover object-bottom"
              />
          </div>
        </FadeIn>

        {/* --- PART 3: TATLILAR & İÇECEKLER --- */}
        <div className="w-full max-w-[1000px] px-4 md:px-12 py-16 md:py-24 flex flex-col gap-16 md:gap-24">
          <FadeIn direction="up">
            <section className="flex flex-col items-center text-center w-full">
              <h2 className="text-2xl md:text-4xl font-serif text-[#222] mb-10 md:mb-12 border-b border-[#222]/20 pb-4 px-8 md:px-12 uppercase tracking-widest">Tatlılar</h2>
              
              <div className="w-full flex flex-col gap-4 md:gap-5 font-serif text-[15px] md:text-[18px] text-[#444]">
                <p>Traliçe</p>
                <p>Fıstık Rüyası</p>
                <p>Tiramisu</p>
              </div>
            </section>
          </FadeIn>

          <FadeIn direction="up">
            <section className="flex flex-col items-center text-center w-full">
              <h2 className="text-2xl md:text-4xl font-serif text-[#222] mb-10 md:mb-12 border-b border-[#222]/20 pb-4 px-8 md:px-12 uppercase tracking-widest">İçecekler</h2>
              
              <div className="w-full flex flex-col md:flex-row justify-center gap-12 md:gap-32">
                <div className="flex flex-col gap-5">
                  <h3 className="font-sans text-[14px] md:text-[15px] font-medium tracking-[0.15em] text-[#c39b53] uppercase mb-2">Sıcak</h3>
                  <div className="flex flex-col gap-3 font-serif text-[15px] md:text-[18px] text-[#444]">
                    <p>Çay</p>
                    <p>Fincan Çay</p>
                    <p>Termos Çay</p>
                    <p>Türk Kahvesi</p>
                    <p>Nescafe</p>
                    <p>Sütlü Nescafe</p>
                    <p>Sıcak Süt</p>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <h3 className="font-sans text-[14px] md:text-[15px] font-medium tracking-[0.15em] text-[#c39b53] uppercase mb-2">Soğuk</h3>
                  <div className="flex flex-col gap-3 font-serif text-[15px] md:text-[18px] text-[#444]">
                    <p>Ev Yapımı Limonata</p>
                    <p>Kola / Fanta / Cappy</p>
                    <p>Gazoz</p>
                    <p>Açık Ayran</p>
                    <p>Kapalı Ayran</p>
                    <p>Maden Suyu</p>
                    <p>Churchill</p>
                    <p>Su</p>
                  </div>
                </div>
              </div>
            </section>
          </FadeIn>
        </div>

      </div>
      
      {/* DIVIDER 3 (FOOTER) */}
      <div className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden mt-8">
          <Image 
            src="/images/kesinkullan2.jpeg"
            alt="Footer Arka Plan"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-6 z-10 px-8">
            <span className="text-4xl font-display tracking-normal text-white">canevim</span>
            <div className="text-white/80 font-sans text-[10px] md:text-[12px] tracking-[0.15em] uppercase text-center leading-relaxed max-w-[400px]">
              <p>Üvezli, Alemdağ Şile Yolu No: 193, 34980 Şile/İstanbul</p>
              <p className="mt-2">0537 497 50 62</p>
            </div>
            <p className="font-sans text-[10px] md:text-[11px] tracking-[0.1em] text-white/60 uppercase mt-2">
              © 2026 Can Evim Şile. Tüm hakları saklıdır.
            </p>
          </div>
      </div>

    </main>
  );
}
