"use client";

import { useState } from "react";

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export default function ReservationForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!name || !date) return;

    const message = `Merhaba Can Evim, ben ${name}. ${formatDate(date)} tarihi için rezervasyon yaptırmak istiyorum.`;
    window.open(
      `https://wa.me/905374975062?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full lg:w-auto gap-8 items-start sm:items-end">
      <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto">
        <label className="sr-only" htmlFor="reservation_name">Ad soyad</label>
        <input
          id="reservation_name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="AD SOYAD"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="bg-transparent border-b border-[#8a8883] pb-2 w-full sm:w-56 outline-none font-sans text-[11px] tracking-[0.15em] placeholder:text-[#555] focus:border-[#222] text-[#222] transition-colors"
          required
        />
        <label className="sr-only" htmlFor="reservation_date">Rezervasyon tarihi</label>
        <input
          id="reservation_date"
          name="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="bg-transparent border-b border-[#8a8883] pb-2 w-full sm:w-56 outline-none font-sans text-[11px] tracking-[0.15em] focus:border-[#222] text-[#222] transition-colors cursor-pointer"
          required
        />
      </div>

      <div className="flex items-center gap-3 sm:mb-2 whitespace-nowrap">
        <input
          type="checkbox"
          id="contact_permission"
          required
          className="h-5 w-5 accent-[#4d5b4a] cursor-pointer"
        />
        <label htmlFor="contact_permission" className="text-[10px] font-sans tracking-[0.15em] text-[#444] cursor-pointer mt-0.5">
          İLETİŞİM İZNİ
        </label>
      </div>

      <button type="submit" className="bg-[#4d5b4a] text-white px-10 py-[14px] font-serif text-[17px] tracking-wide hover:bg-[#323631] transition-colors w-full sm:w-auto shadow-sm">
        WhatsApp&apos;tan Gönder
      </button>
    </form>
  );
}
