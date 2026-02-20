"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-12 bg-[#080808] animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-none uppercase">
          TROMBINY
        </h1>
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700 tracking-tighter leading-none uppercase mt-2">
          PRODUÇÕES
        </h2>
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.5em] font-bold mt-6">Management Portal · v2.0</p>
      </div>

      {/* Botões de Navegação */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full">
        <Link href="/clientes" className="group flex flex-col items-center justify-center bg-[#0f0f0f] border border-white/[0.03] hover:border-white/10 rounded-3xl p-10 transition-all duration-500 hover:bg-[#121212]">
          <span className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-500">👥</span>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-all">Clientes</span>
        </Link>

        <Link href="/filmagens" className="group flex flex-col items-center justify-center bg-[#0f0f0f] border border-white/[0.03] hover:border-blue-500/20 rounded-3xl p-10 transition-all duration-500 hover:bg-blue-500/[0.03]">
          <span className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-500">🎥</span>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-400 transition-all">Filmagens</span>
          <span className="text-[8px] text-gray-700 mt-2 font-bold uppercase">Agenda · Drive · Kit</span>
        </Link>

        <Link href="/edicoes" className="group flex flex-col items-center justify-center bg-[#0f0f0f] border border-white/[0.03] hover:border-purple-500/20 rounded-3xl p-10 transition-all duration-500 hover:bg-purple-500/[0.03]">
          <span className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-500">🎬</span>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-purple-400 transition-all">Edições</span>
          <span className="text-[8px] text-gray-700 mt-2 font-bold uppercase">Projetos · Player</span>
        </Link>

        <Link href="/financial" className="group flex flex-col items-center justify-center bg-[#0f0f0f] border border-white/[0.03] hover:border-emerald-500/20 rounded-3xl p-10 transition-all duration-500 hover:bg-emerald-500/[0.03]">
          <span className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-500">💰</span>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-emerald-400 transition-all">Financeiro</span>
          <span className="text-[8px] text-gray-700 mt-2 font-bold uppercase">Uber · Reposição</span>
        </Link>
      </div>
    </div>
  );
}
