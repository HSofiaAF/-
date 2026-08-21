import React, { useState } from 'react';
import { 
  Heart, 
  PlusCircle, 
  Grid, 
  Clock, 
  Search, 
  LogOut, 
  User, 
  Settings, 
  Sparkles,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ 
  viewMode, 
  setViewMode, 
  onOpenUpload, 
  onOpenAuth, 
  onOpenSettings,
  onOpenSlideshow,
  searchQuery,
  setSearchQuery,
  totalMemories
}) => {
  const { currentUser, logout, isOwner } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & HSofiaAF Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/25 text-white animate-float">
              <span className="font-extrabold text-sm sm:text-base tracking-tight font-heading">HS</span>
              <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-heading bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  HSofiaAF
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 border border-rose-200/80 text-rose-700 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Recuerdos
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {totalMemories} {totalMemories === 1 ? 'momento guardado' : 'momentos inolvidables'}
              </p>
            </div>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar recuerdos de Sofia, lugares, etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/80 hover:bg-white focus:bg-white rounded-full border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Switcher (Gallery vs Timeline) */}
            <div className="flex items-center p-1 bg-slate-200/60 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white text-rose-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista Galería"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Galería</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-rose-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Línea de Tiempo"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Cronología</span>
              </button>
            </div>

            {/* Slideshow Button */}
            {totalMemories > 0 && (
              <button
                onClick={onOpenSlideshow}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                title="Modo Presentación"
              >
                <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Presentación</span>
              </button>
            )}

            {/* Upload Button */}
            {currentUser ? (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition transform active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo recuerdo</span>
                <span className="sm:hidden">Subir</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}

            {/* User Profile / Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/80 border border-transparent hover:border-slate-200 transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full ring-2 ring-rose-400/40"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-200/80 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-semibold">
                        {currentUser.role || 'Familia'}
                      </span>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => { onOpenSettings(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Configuración</span>
                      </button>
                    )}

                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar recuerdos o etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
