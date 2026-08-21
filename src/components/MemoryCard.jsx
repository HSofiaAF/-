import React from 'react';
import { Heart, MessageCircle, Calendar, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

// Emotion tag palette – mapped from tags or category
const EMOTION_COLORS = {
  'Primera vez': { bg: '#fdf2f8', border: '#f9a8d4', text: '#9d174d' },
  'Celebración': { bg: '#fefce8', border: '#fde047', text: '#78350f' },
  'Aventura':    { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a5f' },
  'Familia':     { bg: '#f0fdf4', border: '#86efac', text: '#14532d' },
  'Cotidiano':   { bg: '#f8fafc', border: '#cbd5e1', text: '#334155' },
  'Logro':       { bg: '#faf5ff', border: '#d8b4fe', text: '#581c87' },
};

const getEmotionStyle = (category) =>
  EMOTION_COLORS[category] || { bg: '#fff1f2', border: '#fecdd3', text: '#881337' };

export const MemoryCard = ({ memory, onSelect, onLike, onDelete }) => {
  const { currentUser, isOwner } = useAuth();
  const hasLiked = currentUser && memory.likes?.includes(currentUser.email);
  const canDelete = isOwner;

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

  const emotionStyle = getEmotionStyle(memory.category);

  return (
    <article
      onClick={() => onSelect(memory)}
      className="group memory-card cursor-pointer flex flex-col overflow-hidden"
      role="button"
      tabIndex={0}
      aria-label={`Recuerdo: ${memory.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(memory)}
    >
      {/* ── Image area ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: '4/3' }}>
        <img
          src={memory.imageUrl}
          alt={memory.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)'
          }}
        />

        {/* Category pill */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: 'rgba(0,0,0,0.42)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {memory.category || 'Momento'}
          </span>
        </div>

        {/* Delete button */}
        {canDelete && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('¿Eliminar este recuerdo de Sofia? Esta acción no se puede deshacer.')) {
                onDelete(memory.id, memory.imageUrl);
              }
            }}
            className="absolute top-3 right-3 z-10 p-2 rounded-full text-white/90 hover:text-white transition-all
              opacity-0 group-hover:opacity-100 cursor-pointer"
            style={{
              background: 'rgba(0,0,0,0.42)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
            title="Eliminar recuerdo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Like count overlay on hover */}
        <div
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full
            opacity-0 group-hover:opacity-100 transition-all duration-300 text-white text-xs font-bold"
          style={{
            background: hasLiked ? 'rgba(225,29,72,0.85)' : 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
          {memory.likes?.length || 0}
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">

        {/* Date + Author row */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            {formatDate(memory.date)}
          </span>
          <div className="flex items-center gap-1.5">
            <img
              src={memory.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=HSofia`}
              alt={memory.author?.name || 'Familia'}
              className="w-5 h-5 rounded-full"
              style={{ boxShadow: '0 0 0 2px #fecdd3' }}
            />
            <span className="font-bold text-slate-700 text-[11px] max-w-[80px] truncate">
              {memory.author?.name || 'Familia'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 font-heading
          group-hover:text-rose-600 transition-colors leading-snug">
          {memory.title}
        </h3>

        {/* Description */}
        {memory.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {memory.description}
          </p>
        )}

        {/* Emotion / category badge + tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-1">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{
              background: emotionStyle.bg,
              border: `1px solid ${emotionStyle.border}`,
              color: emotionStyle.text
            }}
          >
            {memory.category || 'Recuerdo'}
          </span>
          {memory.tags?.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c' }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer: Likes & Comments actions */}
        <div
          className="flex items-center justify-between pt-3 mt-1"
          style={{ borderTop: '1px solid #f1f5f9' }}
        >
          {currentUser ? (
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-125 cursor-pointer select-none ${
                hasLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
              }`}
              title={hasLiked ? 'Quitar corazón' : 'Dar corazón'}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-150 ${hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`}
              />
              <span>{memory.likes?.length || 0}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Heart className="w-4 h-4" />
              <span>{memory.likes?.length || 0}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{memory.comments?.length || 0}</span>
          </div>
        </div>

      </div>
    </article>
  );
};
