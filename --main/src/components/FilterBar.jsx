import React from 'react';
import { CATEGORIES } from '../data/initialMemories';
import { Heart, ArrowUpDown, ListFilter, Sparkles } from 'lucide-react';

export const FilterBar = ({ 
  selectedCategory, 
  setSelectedCategory, 
  showFavoritesOnly, 
  setShowFavoritesOnly,
  sortOrder,
  setSortOrder,
  totalFiltered,
  totalAll
}) => {
  return (
    <div className="py-3 sm:py-5 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
      
      {/* Category Pills & Count (Slide 1/9 & 2/9 style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none scroll-touch overscroll-x-contain -mx-3 px-3 sm:mx-0 sm:px-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full glass-pill px-3 py-1.5 text-[11px] font-bold text-slate-300 shrink-0">
          <ListFilter className="w-3.5 h-3.5 text-rose-400" />
          {totalFiltered} / {totalAll}
        </span>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat && !showFavoritesOnly;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowFavoritesOnly(false);
              }}
              className={`whitespace-nowrap px-4 py-1.5 sm:px-4.5 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none shrink-0 active:scale-95 border ${
                isSelected
                  ? 'bg-white text-slate-950 border-white shadow-lg shadow-white/10 scale-[1.02]'
                  : 'glass-pill hover:bg-white/15 text-slate-300 hover:text-white border-white/15'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Auxiliary Filters (Favorites & Sort) */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
        <span className="sm:hidden text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-rose-400" />
          {totalFiltered} recuerdos
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none active:scale-95 border ${
              showFavoritesOnly
                ? 'bg-rose-500/25 text-rose-300 border-rose-400/50 shadow-md shadow-rose-500/20'
                : 'glass-pill hover:bg-white/15 text-slate-300 hover:text-white border-white/15'
            }`}
            title="Ver solo momentos favoritos"
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : 'text-slate-400'}`} />
            <span>Favoritos</span>
          </button>

          <div className="relative flex items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="glass-pill hover:bg-white/15 text-xs font-bold text-slate-200 border border-white/15 rounded-full pl-3 pr-7 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer appearance-none"
            >
              <option value="newest" className="bg-slate-900 text-white">Más recientes</option>
              <option value="oldest" className="bg-slate-900 text-white">Más antiguos</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

    </div>
  );
};
