import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trombiny Portal | Gestão de Produção",
  description: "Sistema centralizado de gestão para Trombiny Produções",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#080808] text-white min-h-screen flex`} suppressHydrationWarning>
        {/* Sidebar */}
        <aside className="w-56 border-r border-white/5 bg-[#0a0a0a] p-5 flex flex-col flex-shrink-0">
          <Link href="/" className="block mb-8">
            <h1 className="text-sm font-black tracking-tighter text-white uppercase">TROMBINY</h1>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest">Portal</p>
          </Link>

          <nav className="flex-1 space-y-1">
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-3 px-3">Menu</p>
            <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
              🏠 <span>Início</span>
            </Link>
            <Link href="/clientes" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
              👥 <span>Clientes</span>
            </Link>
            <Link href="/agenda" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
              📅 <span>Agenda</span>
            </Link>

            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-3 mt-6 px-3">Departamentos</p>
            <Link href="/filmagens" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
              🎥 <span>Filmagens</span>
            </Link>
            <Link href="/edicoes" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
              🎬 <span>Edições</span>
            </Link>
            <Link href="/financial" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
              💰 <span>Financeiro</span>
            </Link>
          </nav>

          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[9px] font-bold">JT</div>
              <div>
                <p className="text-[10px] font-bold text-white">Jhonny Trombini</p>
                <p className="text-[8px] text-gray-600">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
