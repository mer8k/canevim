"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import FadeIn from "./components/FadeIn";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import tr from "date-fns/locale/tr";
import { format } from "date-fns";

registerLocale("tr", tr);

export default function Home() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(null);

  const handleReservationSubmit = (e) => {
    e.preventDefault();
    if (!name || !date) return alert("Lütfen ad soyad ve tarih bilgilerinizi girin.");
    
    // Format the WhatsApp message
    const formattedDate = format(date, "dd/MM/yyyy");
    const message = `Merhaba Can Evim, ben ${name}. ${formattedDate} tarihi için rezervasyon yaptırmak istiyorum.`;
    const waUrl = `https://wa.me/905374975062?text=${encodeURIComponent(message)}`;
    
    window.open(waUrl, "_blank");
  };

  return (
    <main className="min-h-screen relative w-full flex flex-col justify-between selection:bg-white/30">
      {/* Background Image */}
      <div className="absolute inset-0 z-[-1] w-full h-[90vh]">
        {/* Desktop Image */}
        <div className="relative w-full h-full hidden md:block">
          <Image 
            src="/heromasaustu.jpg"
            alt="Can Evim Şile"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Mobile Image */}
        <div className="relative w-full h-full block md:hidden">
          <Image 
            src="/images/kesinkullan.jpeg"
            alt="Can Evim Şile Mobil"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Subtle overlay to ensure text readability like noma */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Hero Content (Bottom Left) */}
      <div className="h-[90vh] flex flex-col justify-end px-8 pb-16 md:px-16 md:pb-24 w-full text-white relative">
        <h1 className="text-5xl md:text-7xl lg:text-[84px] font-serif mb-6 drop-shadow-md font-normal tracking-tight max-w-5xl">
          Şile'de Doğada Kahvaltı
        </h1>
        
        <div className="relative w-fit">
          <Link href="/menu" className="group inline-flex items-center gap-4 border border-white/40 px-6 py-3 md:px-8 md:py-[18px] w-fit hover:bg-white/10 hover:border-white/60 transition-all duration-500 relative overflow-hidden backdrop-blur-sm">
            <span className="text-[17px] md:text-[20px] font-serif tracking-[0.08em] group-hover:pr-2 transition-all duration-300">Menüye Eriş</span>
            <span className="text-xl font-sans font-light -mt-1 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
          </Link>
          
          {/* Red Flower Accent - positioned overlapping the button border */}
          <div className="absolute -bottom-4 -right-5 text-4xl opacity-90 rotate-[-15deg] hover:scale-110 transition-transform duration-500 origin-center drop-shadow-md z-10 pointer-events-none">
            {/* Using a realistic flower emoji or a custom SVG would work here. I'll use SVG for better control */}
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
              <path d="M45.5 15.5C40 2 20 -2.5 10 7.5C0 17.5 10 38.5 25 45.5C10 50.5 -2.5 70.5 7.5 82.5C17.5 94.5 40 90.5 45.5 75.5C52.5 90.5 72.5 94.5 82.5 82.5C92.5 70.5 80.5 50.5 65.5 45.5C80.5 40.5 92.5 20.5 82.5 7.5C72.5 -5.5 52.5 2 45.5 15.5Z" fill="#a01212" stroke="#7a0a0a" strokeWidth="2"/>
              <path d="M50 40C45 40 40 45 40 50C40 55 45 60 50 60C55 60 60 55 60 50C60 45 55 40 50 40Z" fill="#1a1a1a"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Two Column Image Showcase Section */}
      <div className="bg-[#f7f6f2] w-full pb-16 pt-12 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-4 md:p-8 max-w-[1600px] mx-auto">
          
          {/* Column 1 (Masalar/Bahçe) */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col h-full gap-8">
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image 
                  src="/section2.jpg"
                  alt="Can Evim Şile Bahçe"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>
              <div className="px-4 md:px-8 flex flex-col items-start">
                <p className="text-[22px] md:text-[26px] lg:text-[30px] font-serif leading-snug text-[#222] mb-6 max-w-lg">
                  Şehrin gürültüsünden uzak, huzur dolu bahçemizde sevdiklerinizle özel anlarınızı taçlandırın.
                </p>
                <Link href="/menu" className="text-[13px] font-sans font-medium tracking-wide text-[#444] border-b border-[#444] hover:text-black hover:border-black transition-colors pb-1 inline-block">
                  Mekanımızı Keşfedin
                </Link>
              </div>
              {/* Fill remaining space with kesinkullan3 */}
              <div className="relative w-full min-h-[200px] flex-grow overflow-hidden mt-4">
                <Image 
                  src="/images/kesinkullan3.jpeg"
                  alt="Can Evim Detay"
                  fill
                  className="object-cover object-bottom"
                />
              </div>
            </div>
          </FadeIn>

          {/* Column 2 (Serpme) */}
          <FadeIn delay={0.3}>
          <div className="flex flex-col h-full gap-8">
            <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden">
              <Image 
                src="/images/serpme.jpeg"
                alt="Can Evim Şile Serpme Kahvaltı"
                fill
                className="object-cover object-[center_60%] hover:scale-105 transition-transform duration-700 ease-in-out"
              />
            </div>
            <div className="px-4 md:px-8 pb-12 flex flex-col items-start">
              <p className="text-[22px] md:text-[26px] lg:text-[30px] font-serif leading-snug text-[#222] mb-6 max-w-lg">
                Geleneksel tariflerin, en taze yerel malzemeler ve yılların ustalığıyla buluştuğu eşsiz lezzet dünyamızı keşfedin.
              </p>
              <Link href="/menu" className="text-[13px] font-sans font-medium tracking-wide text-[#444] border-b border-[#444] hover:text-black hover:border-black transition-colors pb-1 inline-block">
                Lezzetlerimizi İncele
              </Link>
            </div>
          </div>
          </FadeIn>
          
        </div>
      </div>

      {/* Editorial About Us Section */}
      <div id="hakkimizda" className="w-full bg-[#fcfaf7] flex flex-col md:flex-row border-b border-[#e5e3dc] items-stretch">
        {/* Left Image (Edge to edge on left) */}
        <div className="w-full md:w-1/2 relative h-[50vh] md:h-auto min-h-[500px] lg:min-h-[700px]">
          <Image 
            src="/images/IMG_5123_7_cropped.JPG"
            alt="Can Evim Şile Doğaya Dönüş"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Right Text Content */}
        <div className="w-full md:w-1/2 flex items-center justify-center py-20 px-8 md:px-16 lg:px-24">
          <FadeIn direction="up">
            <div className="text-[15px] md:text-[17px] font-serif leading-[2.2] text-[#333] max-w-[550px] space-y-8 text-left">
              <p>Değerli Misafirlerimiz,</p>
              <p>
                Şehrin yorucu temposundan ve gürültüsünden uzaklaşmak isteyen herkes için Şile'nin kalbinde özel bir sığınak hayal ettik. 
                Uzun süren planlama ve özenli çalışmaların ardından Can Evim'i hayata geçirmenin heyecanını yaşıyoruz.
              </p>
              <p>
                Amacımız sadece bir kahvaltı mekanı olmak değil; sevdiklerinizle birlikte doğanın sesini dinleyebileceğiniz, 
                taptaze yöresel lezzetlerle güne huzur dolu bir başlangıç yapabileceğiniz bir yaşam alanı sunmaktır. 
                Tedarikçilerimizden mutfak ekibimize kadar sayısız insan bu hayali gerçeğe dönüştürmek için çabaladı. 
                Bahçemizde geçirdiğiniz her anın, damaklarınızda kalan her tadın özenle seçilmiş, ortak bir emeğin hikayesi var.
              </p>
              <p>
                Büyük bir sevgi ve tutkuyla hazırladığımız bu özel mekanı nihayet sizinle paylaşmaya hazırız.
              </p>
              <p>Sizi aramızda görmek dileğiyle.</p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="w-full bg-[#fcfaf7] py-8 md:py-16 flex flex-col gap-4 overflow-hidden">

        {/* 1. 3 Vertical Images */}
        <FadeIn>
          <div className="w-full flex gap-1 md:gap-2 px-1 md:px-2">
            <div className="w-1/3 relative aspect-[3/4] md:aspect-[9/16] overflow-hidden">
              <Image src="/images/galeri/dikey1.JPG" alt="Can Evim Galeri" fill className="object-cover" />
            </div>
            <div className="w-1/3 relative aspect-[3/4] md:aspect-[9/16] overflow-hidden">
              <Image src="/images/galeri/dikey2.jpeg" alt="Can Evim Galeri" fill className="object-cover" />
            </div>
            <div className="w-1/3 relative aspect-[3/4] md:aspect-[9/16] overflow-hidden">
              <Image src="/images/galeri/dikey3.JPG" alt="Can Evim Galeri" fill className="object-cover" />
            </div>
          </div>
        </FadeIn>

        {/* 2. 3 Square Images (Full width side by side) */}
        <FadeIn delay={0.2}>
          <div className="w-full grid grid-cols-3 gap-1 md:gap-2 px-1 md:px-2">
            <div className="w-full relative aspect-square overflow-hidden">
              <Image src="/images/galeri/kare1.jpeg" alt="Can Evim Galeri" fill className="object-cover" />
            </div>
            <div className="w-full relative aspect-square overflow-hidden">
              <Image src="/images/galeri/kare2.jpeg" alt="Can Evim Galeri" fill className="object-cover" />
            </div>
            <div className="w-full relative aspect-square overflow-hidden">
              <Image src="/images/galeri/kare4.jpeg" alt="Can Evim Galeri" fill className="object-cover" />
            </div>
          </div>
        </FadeIn>

      </div>
      {/* Reviews Section */}
      <div className="w-full bg-white py-16 md:py-28 border-t border-[#e5e3dc]">
        <div className="px-4 md:px-16 max-w-[1600px] mx-auto w-full">
          
          <div className="flex flex-col gap-12 lg:gap-16 w-full">
            
            {/* Top Image: Full Width Rectangle */}
            <FadeIn>
              <div className="relative w-full h-[40vh] md:h-[450px] lg:h-[550px] max-w-[1000px] mx-auto overflow-hidden rounded-xl shadow-sm border border-[#e5e3dc]">
                <Image 
                  src="/images/kesinkullan2.jpeg"
                  alt="Can Evim Yorumlar"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </FadeIn>

            {/* Title and Overall Rating */}
            <FadeIn delay={0.1}>
              <div className="flex flex-col items-center text-center">
                <h3 className="text-[32px] md:text-[40px] font-serif text-[#222] mb-4">Misafir Yorumları</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-sans font-medium tracking-tighter text-[#222]">5,0</span>
                  <div className="flex text-[#c39b53] text-2xl">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
                <p className="text-[12px] font-sans tracking-[0.15em] text-[#666] uppercase border-b border-[#666] pb-1">Google'da 88 Değerlendirme</p>
              </div>
            </FadeIn>

            {/* Horizontal Scrolling Review Cards */}
            <div className="w-full flex gap-6 overflow-x-auto pb-8 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              {/* Review 1 */}
              <div className="shrink-0 w-[300px] md:w-[350px] bg-[#fcfaf7] border border-[#e5e3dc] p-8 md:p-10 snap-start flex flex-col shadow-sm transition-transform hover:-translate-y-2 duration-300">
                <div className="flex text-[#c39b53] mb-6 text-lg">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="font-serif text-[16px] text-[#333] leading-[1.8] mb-8 italic flex-grow">
                  "Tek kelime ile şahane! Güler yüz, hoş karşılama... Gözlemeleri olsun her şeyiyle çok güzel, içi de çok ferah ve temiz."
                </p>
                <div className="mt-auto pt-6 border-t border-[#e5e3dc]">
                  <p className="font-sans font-medium text-[#222] tracking-wide text-[13px] uppercase">Figen</p>
                  <p className="font-sans text-[10px] tracking-wider text-[#888] uppercase mt-2">Yiyecek: 5/5 | Hizmet: 5/5</p>
                </div>
              </div>

              {/* Review 2 */}
              <div className="shrink-0 w-[300px] md:w-[350px] bg-[#fcfaf7] border border-[#e5e3dc] p-8 md:p-10 snap-start flex flex-col shadow-sm transition-transform hover:-translate-y-2 duration-300">
                <div className="flex text-[#c39b53] mb-6 text-lg">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="font-serif text-[16px] text-[#333] leading-[1.8] mb-8 italic flex-grow">
                  "Gerçekten harika bir yer! Serpme kahvaltısı harika. Gözlemeler sıcacık, bol malzemeli ve çok lezzetliydi."
                </p>
                <div className="mt-auto pt-6 border-t border-[#e5e3dc]">
                  <p className="font-sans font-medium text-[#222] tracking-wide text-[13px] uppercase">Halil Genç</p>
                  <p className="font-sans text-[10px] tracking-wider text-[#888] uppercase mt-2">Yiyecek: 5/5 | Hizmet: 5/5</p>
                </div>
              </div>

              {/* Review 3 */}
              <div className="shrink-0 w-[300px] md:w-[350px] bg-[#fcfaf7] border border-[#e5e3dc] p-8 md:p-10 snap-start flex flex-col shadow-sm transition-transform hover:-translate-y-2 duration-300">
                <div className="flex text-[#c39b53] mb-6 text-lg">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="font-serif text-[16px] text-[#333] leading-[1.8] mb-8 italic flex-grow">
                  "Gözleme gurmesi olarak yeni bir yer keşfettik. Kıymalı ve patatesli yedik. Çok lezzetliydi, mekan tertemizdi."
                </p>
                <div className="mt-auto pt-6 border-t border-[#e5e3dc]">
                  <p className="font-sans font-medium text-[#222] tracking-wide text-[13px] uppercase">Merve Şengül</p>
                  <p className="font-sans text-[10px] tracking-wider text-[#888] uppercase mt-2">Yiyecek: 5/5 | Hizmet: 5/5</p>
                </div>
              </div>

              {/* Review 4 */}
              <div className="shrink-0 w-[300px] md:w-[350px] bg-[#fcfaf7] border border-[#e5e3dc] p-8 md:p-10 snap-start flex flex-col shadow-sm transition-transform hover:-translate-y-2 duration-300">
                <div className="flex text-[#c39b53] mb-6 text-lg">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="font-serif text-[16px] text-[#333] leading-[1.8] mb-8 italic flex-grow">
                  "15 yıldır gidip geldiğim Üvezli'deki hiçbir yere benzemiyor. Kalitesi ve muazzam servisi beni bağımlı hale getirecek."
                </p>
                <div className="mt-auto pt-6 border-t border-[#e5e3dc]">
                  <p className="font-sans font-medium text-[#222] tracking-wide text-[13px] uppercase">Fatih Dem</p>
                  <p className="font-sans text-[10px] tracking-wider text-[#888] uppercase mt-2">Yiyecek: 5/5 | Hizmet: 5/5</p>
                </div>
              </div>
              
              {/* Review 5 */}
              <div className="shrink-0 w-[300px] md:w-[350px] bg-[#fcfaf7] border border-[#e5e3dc] p-8 md:p-10 snap-start flex flex-col shadow-sm transition-transform hover:-translate-y-2 duration-300">
                <div className="flex text-[#c39b53] mb-6 text-lg">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="font-serif text-[16px] text-[#333] leading-[1.8] mb-8 italic flex-grow">
                  "Açılalı henüz 45 gün olmuş ama mekan çok temiz her şey oldukça oturmuş. Sahipleri de oldukça ilgili insanlar."
                </p>
                <div className="mt-auto pt-6 border-t border-[#e5e3dc]">
                  <p className="font-sans font-medium text-[#222] tracking-wide text-[13px] uppercase">Nida Nur Demirci</p>
                  <p className="font-sans text-[10px] tracking-wider text-[#888] uppercase mt-2">Yiyecek: 5/5 | Hizmet: 5/5</p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>

      {/* Contact & Footer Section */}
      <div id="rezervasyon" className="relative w-full text-[#333] border-t border-white/20">
        {/* Background Image with Fixed Attachment for Parallax Effect */}
        <div className="absolute inset-0 z-[-2]">
          <Image 
            src="/heromasaustu.jpg"
            alt="Background"
            fill
            className="object-cover object-center"
          />
        </div>
        {/* Glassy/Curtain Overlay */}
        <div className="absolute inset-0 z-[-1] bg-[#f0ede6]/90 backdrop-blur-md"></div>
        
        {/* Content */}
        <div className="px-8 py-16 md:px-16 md:py-24 max-w-[1600px] mx-auto w-full flex flex-col gap-24">
          
          {/* Top Form Part */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 w-full">
            <FadeIn>
              <p className="text-[24px] md:text-[32px] font-serif font-normal text-left max-w-lg leading-snug text-[#222]">
                Rezervasyon ve detaylı bilgi için bize ulaşın.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.2} direction="left">
            <form onSubmit={handleReservationSubmit} className="flex flex-col sm:flex-row w-full lg:w-auto gap-8 items-start sm:items-end">
              <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto">
                <input 
                  type="text" 
                  placeholder="AD SOYAD" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-b border-[#8a8883] pb-2 w-full sm:w-56 outline-none font-sans text-[11px] tracking-[0.15em] placeholder:text-[#555] focus:border-[#222] text-[#222] transition-colors"
                />
                <DatePicker 
                  selected={date}
                  onChange={(d) => setDate(d)}
                  locale="tr"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="REZERVASYON TARİHİ"
                  className="bg-transparent border-b border-[#8a8883] pb-2 w-full sm:w-56 outline-none font-sans text-[11px] tracking-[0.15em] placeholder:text-[#555] focus:border-[#222] text-[#222] transition-colors cursor-pointer"
                  required
                />
              </div>
              
              <div className="flex items-center gap-3 sm:mb-2 whitespace-nowrap">
                <div className="relative flex items-center justify-center w-5 h-5 border border-[#8a8883] cursor-pointer">
                  <input type="checkbox" id="contact_permission" required className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                  <div className="w-3 h-3 bg-[#4d5b4a] scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <label htmlFor="contact_permission" className="text-[10px] font-sans tracking-[0.15em] text-[#444] cursor-pointer mt-0.5">İLETİŞİM İZNİ</label>
              </div>
              
              <button type="submit" className="bg-[#4d5b4a] text-white px-10 py-[14px] font-serif text-[17px] tracking-wide hover:bg-[#323631] transition-colors w-full sm:w-auto shadow-sm">
                Gönder
              </button>
            </form>
            </FadeIn>
          </div>
          
          {/* Bottom Footer Part */}
          <FadeIn direction="up" delay={0.2}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-t border-[#d8d5ce] pt-12">
            <div className="flex flex-col gap-6">
              <span className="text-3xl font-display tracking-normal">canevim</span>
              <p className="font-sans text-[12px] tracking-widest text-[#555] uppercase leading-relaxed max-w-sm">
                Üvezli, Alemdağ Şile Yolu No: 193,<br/>
                34980 Şile/İstanbul<br/><br/>
                0537 497 50 62<br/><br/>
                Her gün · 08:00 - 23:00
              </p>
            </div>
            
            <div className="flex flex-col gap-8 md:items-end">
              <div className="flex gap-6 text-[#444]">
                <a href="https://instagram.com/canevimsile" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://wa.me/905374975062" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
                <a href="https://www.google.com/maps/place/Can+Evim+%C5%9Eile/@41.1104673,29.4245564,17z/data=!3m1!4b1!4m15!1m8!3m7!1s0x409fd4f3461f9813:0x28012c3f4390e52!2zw5x2ZXpsaSwgQWxlbWRhxJ8gxZ5pbGUgWW9sdSBObzogMTkzLCAzNDk4MCDFnmlsZS_EsHN0YW5idWw!3b1!8m2!3d41.1104887!4d29.425856!16s%2Fg%2F11c1bqkrkk!3m5!1s0x409fd5b99f0c193b:0x275f89d0fdeb1d23!8m2!3d41.1104673!4d29.4258912!16s%2Fg%2F11nptwm57y?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </a>
              </div>
              <p className="font-sans text-[11px] tracking-[0.1em] text-[#666] uppercase">
                © 2026 Can Evim Şile. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
          </FadeIn>
          
        </div>
      </div>
    </main>
  );
}
