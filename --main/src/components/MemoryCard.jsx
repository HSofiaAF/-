import React, { useState } from 'react';
import { Heart, MessageCircle, Calendar, Trash2, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getLikePeople } from '../utils/people';

export const MemoryCard = ({ memory, index = 0, onSelect, onLike, onDelete }) => {
  const { currentUser, isOwner } = useAuth();
  const [showLikes, setShowLikes] = useState(false);
  const hasLiked = currentUser && memory.likes?.includes(currentUser.email);
  const likePeople = getLikePeople(memory, currentUser);
  const canDelete = isOwner;

  const formattedIndex = String(index + 1).padStart(2, '0');

  const handleLike = (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    if (!hasLiked) {
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 35,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        },
        colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#f59e0b', '#a78bfa']
      });
    }
    onLike(memory.id);
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  return (
    <article
      onClick={() => onSelect(memory)}
      className="group editorial-card cursor-pointer flex flex-col overflow-hidden text-slate-200 select-none"
      role="button"
      tabIndex={0}
      aria-label={`Recuerdo: ${memory.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(memory)}
    >
      {/* ── Image / Media Area (Slide 2/9 & 5/9 style) ── */}
      <div className="relative overflow-hidden bg-slate-900" style={{ aspectRatio: '4/3' }}>
        {memory.mediaType === 'video' ? (
          <video 
            src={memory.imageUrl} 
            muted 
            loop 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover object-center" 
          />
        ) : (
          <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            loading="lazy" 
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" 
          />
        )}

        {/* Cinematic Vignette Overlay */}
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(11,15,23,0.85) 0%, rgba(11,15,23,0.1) 40%, transparent 100%)'
          }}
        />

        {/* Category Pill Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider glass-pill border border-white/20 text-white shadow-sm">
            {memory.category || 'Momento'}
          </span>
        </div>

        {/* Index Number Badge Top Right (Slide 5/9 style: 01, 02...) */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white/80 glass-pill border border-white/10 font-editorial">
            {formattedIndex}
          </span>
        </div>

        {/* Floating Circular Plus (+) Button Bottom Right (Slide 2/9 style) */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(memory);
            }}
            className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg transition-transform transform active:scale-90 group-hover:scale-110 cursor-pointer"
            title="Ver recuerdo completo"
          >
            <Plus className="w-4 h-4 text-slate-900 stroke-[2.5]" />
          </button>
        </div>

        {/* Like People Pill Bottom Left */}
        {likePeople.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowLikes(!showLikes); }}
            className="absolute bottom-3 left-3 z-10 px-2.5 py-0.5 rounded-full glass-pill text-rose-300 text-[10px] font-bold cursor-pointer"
          >
            {showLikes ? 'Cerrar' : `♥ ${likePeople.length}`}
          </button>
        )}
        {showLikes && (
          <div 
            className="absolute bottom-11 left-3 right-3 z-20 rounded-2xl glass-card border border-white/15 p-2.5 shadow-2xl text-[11px] text-white animate-slideInFromTop" 
            onClick={(e) => e.stopPropagation()}
          >
            {likePeople.map((person) => (
              <div key={person.email} className="py-0.5 font-semibold text-rose-300">
                ♥ {person.name}
              </div>
            ))}
          </div>
        )}

        {/* Delete Button (Owner only) */}
        {canDelete && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('¿Eliminar este recuerdo de Sofia? Esta acción no se puede deshacer.')) {
                onDelete(memory.id, memory.imageUrl);
              }
            }}
            className="absolute top-11 right-3 z-10 p-1.5 rounded-full text-white/70 hover:text-white transition-all
              opacity-0 group-hover:opacity-100 cursor-pointer glass-pill"
            title="Eliminar recuerdo"
            aria-label="Eliminar recuerdo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Content Area ── */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2.5">

        {/* Date + Subido por */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium text-[11px]">
            <Calendar className="w-3 h-3 text-rose-400" />
            {formatDate(memory.date)}
          </span>
          <div className="flex items-center gap-1.5">
            <img
              src={memory.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=HSofia`}
              alt={memory.author?.name || 'Familia'}
              className="w-4 h-4 rounded-full border border-white/20"
            />
            <span className="font-bold text-slate-300 text-[11px] max-w-[85px] truncate">
              {memory.author?.name || 'Familia'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 font-editorial tracking-tight group-hover:text-rose-300 transition-colors leading-snug">
          {memory.title}
        </h3>

        {/* Description */}
        {memory.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {memory.description}
          </p>
        )}

        {/* Footer: Likes & Comments */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/10 text-xs">
          {currentUser ? (
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 font-bold transition-transform active:scale-125 cursor-pointer ${
                hasLiked ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
              }`}
              title={hasLiked ? 'Quitar corazón' : 'Dar corazón'}
            >
              <Heart className={`w-3.5 h-3.5 transition-all ${hasLiked ? 'fill-rose-400 text-rose-400 scale-110' : ''}`} />
              <span>{memory.likes?.length || 0}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 font-bold text-slate-400">
              <Heart className="w-3.5 h-3.5" />
              <span>{memory.likes?.length || 0}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-400 font-semibold text-xs">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{memory.comments?.length || 0}</span>
          </div>
        </div>

      </div>
    </article>
  );
};
