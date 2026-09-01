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
  Play,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ 
  viewMode, 
  setViewMode, 
  onOpenUpload, 
  onOpenAuth, 
  onOpenProfile,
  onOpenSettings,
  onOpenSlideshow,
  searchQuery,
  setSearchQuery,
  totalMemories,
  onlineUsers = []
}) => {
  const { currentUser, logout, isOwner, canUpload } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & HSofiaAF Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/30 text-white shrink-0 border border-white/20">
              <span className="font-black text-xs sm:text-sm tracking-wider font-editorial">HS</span>
              <span className="absolute -bottom-1 -right-1 p-0.5 sm:p-1 bg-slate-900 rounded-full border border-white/20">
                <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-400 fill-rose-400" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight font-editorial bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent truncate">
                  HSofiaAF
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold glass-pill text-rose-300 uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Recuerdos
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium hidden md:block truncate">
                {totalMemories} {totalMemories === 1 ? 'momento guardado' : 'momentos inolvidables'}
              </p>
            </div>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4 lg:mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar recuerdos, lugares, etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white/5 hover:bg-white/10 focus:bg-white/15 rounded-full border border-white/15 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400/50 transition-all text-white placeholder:text-slate-400 shadow-inner"
              />
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* View Switcher Capsule (Gallery vs Timeline) */}
            <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-full">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white text-slate-950 shadow-sm' 
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Vista Galería"
                aria-label="Vista Galería"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Galería</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-slate-950 shadow-sm' 
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Línea de Tiempo"
                aria-label="Línea de Tiempo"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Cronología</span>
              </button>
            </div>

            {/* Online Users Capsule Indicator */}
            <div className="relative">
              <button
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs font-bold text-emerald-400 glass-pill hover:bg-white/15 transition cursor-pointer"
                title="Familia conectada ahora"
                aria-label="Familia conectada"
              >
                <span className="online-dot" />
                <Users className="w-3.5 h-3.5 hidden sm:inline text-emerald-400" />
                <span className="hidden sm:inline">{onlineUsers.length} en línea</span>
                <span className="sm:hidden text-[11px] font-bold">{onlineUsers.length}</span>
              </button>
              {showOnlineUsers && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-white/15 shadow-2xl p-3 z-50 animate-slideInFromTop text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Familia en vivo</p>
                  {onlineUsers.length ? onlineUsers.map((user) => (
                    <div key={user.uid || user.email} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <img src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} alt="" className="w-7 h-7 rounded-full border border-white/20" />
                      <span className="text-xs font-bold text-slate-200 truncate">{user.name}</span>
                      <span className="online-dot ml-auto" />
                    </div>
                  )) : <p className="text-xs text-slate-400">Nadie conectado ahora.</p>}
                </div>
              )}
            </div>

            {totalMemories > 0 && (
              <button
                onClick={onOpenSlideshow}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white glass-pill hover:bg-white/15 shadow-sm transition active:scale-95 cursor-pointer"
                title="Modo Presentación"
              >
                <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Cine</span>
              </button>
            )}

            {/* Upload Button */}
            {currentUser && canUpload ? (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 transition transform active:scale-95 cursor-pointer"
                title="Nuevo recuerdo"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">Nuevo</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-pill hover:bg-white/20 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
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
                  className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-rose-400/50 transition cursor-pointer"
                  aria-label="Menú de usuario"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full ring-2 ring-white/30 object-cover"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-white/15 shadow-2xl p-2 z-50 animate-slideInFromTop text-white">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/30">
                        {currentUser.role || 'Familia'}
                      </span>
                    </div>

                    <button
                      onClick={() => { onOpenProfile(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-rose-400" />
                      <span>Mi Perfil / Apodo</span>
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => { onOpenSettings(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Configuración</span>
                      </button>
                    )}

                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
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
        <div className="pb-2.5 pt-1 md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar recuerdos o etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white/10 text-white rounded-full border border-white/15 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-slate-400 shadow-inner"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
