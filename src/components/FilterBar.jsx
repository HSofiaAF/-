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
    <div className="py-4 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200/80 px-2.5 py-1.5 shadow-2xs">
          <ListFilter className="w-3.5 h-3.5 text-rose-500" />
          {totalFiltered} / {totalAll} recuerdos
        </span>
      </div>
      
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat && !showFavoritesOnly;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowFavoritesOnly(false);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 scale-[1.03]'
                  : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:shadow-xs'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Auxiliary Filters (Favorites & Sort) */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
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
            className="bg-white/80 hover:bg-white text-xs font-bold text-slate-600 border border-slate-200/90 rounded-full pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer shadow-2xs appearance-none"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 pointer-events-none" />
        </div>
      </div>

    </div>
  );
};

