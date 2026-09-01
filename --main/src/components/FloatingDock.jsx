import React from 'react';
import { Home, Grid, Clock, Play, PlusCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FloatingDock = ({
  viewMode,
  setViewMode,
  onOpenUpload,
  onOpenAuth,
  onOpenSlideshow,
  totalMemories
}) => {
  const { currentUser, canUpload } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToGallery = (mode) => {
    setViewMode(mode);
    const el = document.getElementById('memories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 no-select"
      aria-label="Navegación rápida inferior"
    >
      <div 
        className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-white"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {/* Inicio / Top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
          title="Ir al inicio"
        >
          <Home className="w-4 h-4 text-rose-400" />
          <span className="hidden md:inline">Inicio</span>
        </button>

        <div className="w-px h-4 bg-white/15 mx-0.5" />

        {/* Galería */}
        <button
          onClick={() => scrollToGallery('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
            viewMode === 'grid'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Vista Cuadrícula"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline">Galería</span>
        </button>

        {/* Cronología */}
        <button
          onClick={() => scrollToGallery('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
            viewMode === 'timeline'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Vista Cronología"
        >
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Cronología</span>
        </button>

        {totalMemories > 0 && (
          <>
            <div className="w-px h-4 bg-white/15 mx-0.5" />
            {/* Presentación */}
            <button
              onClick={onOpenSlideshow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
              title="Modo Presentación"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden md:inline">Cine</span>
            </button>
          </>
        )}

        <div className="w-px h-4 bg-white/15 mx-0.5" />

        {/* Subir Recuerdo */}
        {currentUser && canUpload ? (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/30 transition transform active:scale-95 cursor-pointer"
            title="Subir nuevo recuerdo"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Subir</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            title="Ingresar a la familia"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </nav>
  );
};
