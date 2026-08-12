"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Header() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If menu is open, don't hide the header
      if (isMenuOpen) {
        setVisible(true);
        return;
      }
      
      const currentScrollY = window.scrollY;
      
      // If we are at the top, always show
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down -> hide
        setVisible(false);
      } else {
        // Scrolling up -> show
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 bg-transparent text-white ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="w-full px-8 py-8 md:px-16 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-4xl md:text-5xl font-display font-light tracking-normal flex-1">
          canevim
        </Link>
        
        {/* Center link (Rezervasyon) */}
        <div className="hidden md:flex flex-1 justify-center">
          <Link href="/#rezervasyon" className="text-xl md:text-[22px] font-serif tracking-wide hover:text-white/70 transition-colors">
            Rezervasyon
          </Link>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center justify-end flex-1 gap-4 md:gap-8">
          
          {/* Social Icons */}
          <div className="flex items-center gap-3 md:gap-5 border-r border-white/30 pr-4 md:pr-8">
            {/* Instagram */}
            <a href="https://instagram.com/canevimsile" target="_blank" rel="noreferrer" className="text-white hover:text-white/70 transition-transform hover:scale-110">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* WhatsApp */}
            <a href="https://wa.me/905374975062" target="_blank" rel="noreferrer" className="text-white hover:text-white/70 transition-transform hover:scale-110">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
            {/* Maps */}
            <a href="https://www.google.com/maps/place/Can+Evim+%C5%9Eile/@41.1104673,29.4245564,17z/data=!3m1!4b1!4m15!1m8!3m7!1s0x409fd4f3461f9813:0x28012c3f4390e52!2zw5x2ZXpsaSwgQWxlbWRhxJ8gxZ5pbGUgWW9sdSBObzogMTkzLCAzNDk4MCDFnmlsZS_EsHN0YW5idWw!3b1!8m2!3d41.1104887!4d29.425856!16s%2Fg%2F11c1bqkrkk!3m5!1s0x409fd5b99f0c193b:0x275f89d0fdeb1d23!8m2!3d41.1104673!4d29.4258912!16s%2Fg%2F11nptwm57y?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="text-white hover:text-white/70 transition-transform hover:scale-110">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </a>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col justify-center items-center gap-[5px] w-8 h-8 hover:opacity-70 transition-opacity cursor-pointer z-[60]"
          >
            <span className={`w-7 h-[1.5px] bg-white block transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`}></span>
            <span className={`w-7 h-[1.5px] bg-white block transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-7 h-[1.5px] bg-white block transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`}></span>
          </button>
        </div>
      </div>
      
      {/* Fullscreen Menu Overlay */}
      <div 
        className={`fixed inset-0 w-full h-[100dvh] transition-all duration-700 ease-in-out z-[40] flex flex-col justify-between pt-24 pb-8 overflow-y-auto ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Solid elegant dark background */}
        <div className="absolute inset-0 bg-[#161615] z-0"></div>
        
        {/* Menu Links */}
        <nav className="flex flex-col items-center justify-center flex-grow gap-8 md:gap-16 text-white/90 relative z-10 py-8 min-h-[300px]">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="group text-[40px] md:text-[72px] font-serif font-normal tracking-wide hover:text-[#c39b53] transition-colors flex items-center gap-4 md:gap-6">
            <span className="text-[12px] md:text-[18px] font-sans tracking-[0.2em] text-white/40 group-hover:text-[#c39b53]/60 transition-colors">01</span>
            Anasayfa
          </Link>
          <Link href="/menu" onClick={() => setIsMenuOpen(false)} className="group text-[40px] md:text-[72px] font-serif font-normal tracking-wide hover:text-[#c39b53] transition-colors flex items-center gap-4 md:gap-6">
            <span className="text-[12px] md:text-[18px] font-sans tracking-[0.2em] text-white/40 group-hover:text-[#c39b53]/60 transition-colors">02</span>
            Menü
          </Link>
          <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="group text-[40px] md:text-[72px] font-serif font-normal tracking-wide hover:text-[#c39b53] transition-colors flex items-center gap-4 md:gap-6">
            <span className="text-[12px] md:text-[18px] font-sans tracking-[0.2em] text-white/40 group-hover:text-[#c39b53]/60 transition-colors">03</span>
            Rehber
          </Link>
          <Link href="/#rezervasyon" onClick={() => setIsMenuOpen(false)} className="group text-[40px] md:text-[72px] font-serif font-normal tracking-wide hover:text-[#c39b53] transition-colors flex items-center gap-4 md:gap-6">
            <span className="text-[12px] md:text-[18px] font-sans tracking-[0.2em] text-white/40 group-hover:text-[#c39b53]/60 transition-colors">04</span>
            Rezervasyon
          </Link>
        </nav>
        
        {/* Footer info in menu */}
        <div className="w-full px-6 md:px-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 md:gap-12 relative z-10 mt-auto shrink-0">
          
          <div className="text-white/60 font-sans text-[10px] md:text-[12px] tracking-[0.2em] uppercase text-center md:text-left leading-relaxed">
            <p className="text-white/90 mb-2">Can Evim Şile</p>
            <p>Üvezli, Alemdağ Şile Yolu No: 193</p>
            <p>34980 Şile/İstanbul</p>
          </div>

          <div className="flex gap-6 text-white/80">
            <a href="https://instagram.com/canevimsile" target="_blank" rel="noreferrer" className="hover:text-[#c39b53] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://wa.me/905374975062" target="_blank" rel="noreferrer" className="hover:text-[#c39b53] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
            <a href="https://www.google.com/maps/place/Can+Evim+%C5%9Eile/@41.1104673,29.4245564,17z/data=!3m1!4b1!4m15!1m8!3m7!1s0x409fd4f3461f9813:0x28012c3f4390e52!2zw5x2ZXpsaSwgQWxlbWRhxJ8gxZ5pbGUgWW9sdSBObzogMTkzLCAzNDk4MCDFnmlsZS_EsHN0YW5idWw!3b1!8m2!3d41.1104887!4d29.425856!16s%2Fg%2F11c1bqkrkk!3m5!1s0x409fd5b99f0c193b:0x275f89d0fdeb1d23!8m2!3d41.1104673!4d29.4258912!16s%2Fg%2F11nptwm57y?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="hover:text-[#c39b53] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </a>
          </div>

          <div className="text-white/60 font-sans text-[10px] md:text-[12px] tracking-[0.2em] uppercase text-center md:text-right leading-relaxed">
            <p className="text-white/90 mb-2">İletişim</p>
            <p>0537 497 50 62</p>
            <p>Her gün 08:00 - 23:00</p>
          </div>

        </div>
      </div>
    </header>
  );
}
