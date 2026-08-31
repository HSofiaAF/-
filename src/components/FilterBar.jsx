import React from 'react';
import { CATEGORIES } from '../data/initialMemories';
import { Heart, ArrowUpDown, ListFilter } from 'lucide-react';

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
    <div className="py-2.5 sm:py-4 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3.5">
      
      {/* Category Pills & Count */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none scroll-touch overscroll-x-contain -mx-3 px-3 sm:mx-0 sm:px-0">
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/80 border border-slate-200/80 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-2xs shrink-0">
          <ListFilter className="w-3 h-3 text-rose-500" />
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
              className={`whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                  : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:shadow-xs'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Auxiliary Filters (Favorites & Sort) */}
      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
        <span className="sm:hidden text-[11px] font-bold text-slate-500">
          {totalFiltered} recuerdos
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
              showFavoritesOnly
                ? 'bg-rose-100 text-rose-700 border border-rose-300 shadow-xs'
                : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
            }`}
            title="Ver solo momentos favoritos"
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span>Favoritos</span>
          </button>

          <div className="relative flex items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white/80 hover:bg-white text-xs font-bold text-slate-600 border border-slate-200/90 rounded-full pl-3 pr-7 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer shadow-2xs appearance-none"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

    </div>
  );
};

