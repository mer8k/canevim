import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "../seo-data";

export const metadata = { title: "Şile Kahvaltı ve Lezzet Rehberi | Can Evim", description: "Şile kahvaltısı, Üvezli, yöresel lezzetler ve doğada restoran deneyimi için Can Evim rehberleri.", alternates: { canonical: "/blog" } };

export default function BlogPage() {
  return <main className="min-h-screen bg-[#fcfaf7] text-[#222] pb-24">
    <header className="bg-[#161615] text-white pt-40 pb-20 px-6"><div className="max-w-[1100px] mx-auto"><p className="font-sans text-xs tracking-[0.3em] uppercase text-[#c39b53] mb-4">Can Evim Rehber</p><h1 className="font-serif text-5xl md:text-7xl">Şile'de sofra ve doğa</h1></div></header>
    <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-10 px-6 pt-16">{blogPosts.map((post) => <article key={post.slug} className="border-b border-[#d8d2c8] pb-10"><Link href={`/blog/${post.slug}`}><div className="relative aspect-[4/3] mb-7 overflow-hidden"><Image src={post.image} alt={post.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div><h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4">{post.title}</h2></Link><p className="font-serif text-lg leading-relaxed text-[#555]">{post.excerpt}</p></article>)}</div>
  </main>;
}
