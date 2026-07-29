'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="floating-navbar">
      <div className="nav-inner">
        {/* LEFT: HAMBURGER TOGGLE */}
        <button
          className="nav-toggle"
          onClick={toggleMenu}
          aria-label="Menüyü aç/kapat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* CENTER: AYRI YAZILAN CAN EVİM LOGO */}
        <Link href="/" className="brand-center" onClick={closeMenu} aria-label="Anasayfa">
          CAN EVİM<span className="dot">.</span>
        </Link>

        {/* RIGHT: BALANCING SPACER */}
        <div style={{ width: 36, height: 36 }}></div>

        {/* DROPDOWN MENU */}
        <ul className={`nav-links-dropdown ${isOpen ? 'open' : ''}`}>
          <li>
            <Link href="/#anasayfa" onClick={closeMenu} className={pathname === '/' ? 'active' : ''}>
              Anasayfa
            </Link>
          </li>
          <li>
            <Link href="/#hakkimizda" onClick={closeMenu}>
              Hakkımızda
            </Link>
          </li>
          <li>
            <Link href="/#kategoriler" onClick={closeMenu}>
              Lezzetlerimiz
            </Link>
          </li>
          <li>
            <Link href="/menu" onClick={closeMenu} className={pathname === '/menu' ? 'active' : ''}>
              Menü
            </Link>
          </li>
          <li>
            <Link href="/#galeri" onClick={closeMenu}>
              Galeri
            </Link>
          </li>
          <li>
            <Link href="/#yorumlar" onClick={closeMenu}>
              Yorumlar
            </Link>
          </li>
          <li>
            <Link href="/#iletisim" onClick={closeMenu}>
              İletişim & Lokasyon
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
