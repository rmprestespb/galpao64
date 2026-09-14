import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, PackageOpen } from 'lucide-react';

export default function Header() {
  const { pathname } = useLocation();

  const isActive = (href: string) => {
    if (href.startsWith('#')) return false;
    return pathname === href;
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="w-full bg-[#0b0b0c] border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logo do Galpão 64 */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="text-white font-bold text-xl tracking-wider uppercase flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Box className="w-6 h-6 text-amber-400" />
          <span className="hidden sm:inline">GALPÃO 64</span>
        </Link>
      </div>

      {/* Navegação principal */}
      <nav className="flex items-center gap-4 md:gap-6">
        <a
          href="/album"
          onClick={(e) => handleNav(e, '/album')}
          className={`text-xs md:text-sm font-semibold tracking-wider uppercase transition-colors ${
            isActive('/album')
              ? 'text-amber-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Álbum / Reservas
        </a>

        <Link
          to="/pre-vendas"
          className={`text-xs md:text-sm font-semibold tracking-wider uppercase transition-colors ${
            isActive('/pre-vendas') ? 'text-orange-500' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Pré-Vendas
        </Link>


        {/* Botão Premium Mystery Box */}
        <Link
          to="/mystery-box"
          className={`
            relative inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full
            text-xs md:text-sm font-bold tracking-wider uppercase
            transition-all duration-300 hover:scale-105 active:scale-95
            ${
              isActive('/mystery-box')
                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)]'
            }
          `}
        >
          <PackageOpen className="w-4 h-4" />
          Mystery Box

          {/* Efeito de Brilho de Novidade */}
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </Link>
      </nav>
    </header>
  );
}
