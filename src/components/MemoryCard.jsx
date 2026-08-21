import React from 'react';
import { Heart, MessageCircle, Calendar, Trash2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export const MemoryCard = ({ memory, onSelect, onLike, onDelete }) => {
  const { currentUser } = useAuth();
  const hasLiked = currentUser && memory.likes?.includes(currentUser.email);
  const isAuthor = currentUser && (
    memory.author?.email === currentUser.email || 
    memory.author?.name === currentUser.name
  );

  const handleLike = (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    if (!hasLiked) {
      const rect = e.target.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 30,
        spread: 65,
        origin: { x, y },
        colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#f59e0b']
      });
    }

    onLike(memory.id);
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <article 
      onClick={() => onSelect(memory)}
      className="group relative bg-white/95 rounded-[24px] overflow-hidden border border-white/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-6px_rgba(244,63,94,0.15)] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
    >
      {/* Image container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <img
          src={memory.imageUrl}
          alt={memory.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Category Pill with Frosted Glass */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/45 text-white backdrop-blur-md border border-white/20 shadow-xs">
            {memory.category || 'Momento'}
          </span>
        </div>

        {/* Delete button (if author) */}
        {isAuthor && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('¿Deseas eliminar este recuerdo de Sofia?')) {
                onDelete(memory.id, memory.imageUrl);
              }
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/45 hover:bg-rose-600 text-white/90 hover:text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
            title="Eliminar recuerdo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Author */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              {formatDate(memory.date)}
            </span>
            <div className="flex items-center gap-1.5">
              <img
                src={memory.author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=HSofia'}
                alt={memory.author?.name}
                className="w-4 h-4 rounded-full ring-1 ring-rose-200"
              />
              <span className="font-bold text-slate-700 text-[11px]">{memory.author?.name || 'Familia'}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors font-heading">
            {memory.title}
          </h3>

          {/* Description */}
          {memory.description && (
            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-sans">
              {memory.description}
            </p>
          )}

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {memory.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] font-semibold text-rose-700/80 bg-rose-50/80 px-2 py-0.5 rounded-md border border-rose-100/60">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info: Likes & Comments */}
        <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-slate-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-125 cursor-pointer select-none ${
              hasLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{memory.likes?.length || 0}</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{memory.comments?.length || 0}</span>
          </div>
        </div>

      </div>
    </article>
  );
};

