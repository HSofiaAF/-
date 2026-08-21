import React, { useState } from 'react';
import { X, Heart, MessageCircle, Send, Calendar, Share2, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getLikePeople } from '../utils/people';

export const MemoryModal = ({ memory, onClose, onLike, onAddComment }) => {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!memory) return null;

  const hasLiked = currentUser && memory.likes?.includes(currentUser.email);
  const likePeople = getLikePeople(memory, currentUser);

  const handleLike = () => {
    if (!currentUser) return;
    if (!hasLiked) {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#f59e0b']
      });
    }
    onLike(memory.id);
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    onAddComment(memory.id, {
      authorName: currentUser.name,
      authorEmail: currentUser.email,
      text: commentText.trim()
    });

    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Recuerdo de Sofia: ${memory.title}`,
        text: memory.description || 'Mira este hermoso momento de Sofia ❤️',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-[28px] overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row border border-white/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer shadow-md"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left / Top: High-Res Image with Ambient Backdrop */}
        <div className="md:w-3/5 bg-slate-950 flex items-center justify-center relative overflow-hidden group">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="w-full h-full max-h-[48vh] md:max-h-[85vh] object-contain select-none"
          />
        </div>

        {/* Right / Bottom: Details, Loving Notes & Comments */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto max-h-[48vh] md:max-h-[85vh] bg-white">
          <div>
            {/* Header: Category & Share */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                {memory.category}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer px-2.5 py-1 rounded-lg hover:bg-slate-100"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </>
                )}
              </button>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-tight">
              {memory.title}
            </h2>

            {/* Date and Author */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 my-2.5 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1 font-medium capitalize">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                {formatDate(memory.date)}
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                Guardado por <strong className="text-rose-600">{memory.author?.name || 'Familia'}</strong>
              </span>
            </div>

            {/* Description */}
            {memory.description && (
              <p className="text-sm text-slate-700 leading-relaxed font-sans mt-2">
                {memory.description}
              </p>
            )}

            {/* Tags */}
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3.5 mb-5">
                {memory.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reaction Bar */}
            <div className="flex items-center gap-3 py-3 border-y border-slate-100 my-4">
              {currentUser ? (
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                    hasLiked
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
                  <span>{memory.likes?.length || 0} {memory.likes?.length === 1 ? 'Corazón' : 'Corazones'}</span>
                </button>
              ) : (
                <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Heart className="w-4 h-4" /> {memory.likes?.length || 0} corazones
                </span>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold ml-auto">
                <MessageCircle className="w-4 h-4 text-slate-400" />
                <span>{memory.comments?.length || 0} mensajes</span>
              </div>
            </div>
            {likePeople.length > 0 && (
              <div className="mb-4 rounded-xl bg-rose-50/70 border border-rose-100 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-1">Les gusta este recuerdo</p>
                <p className="text-xs font-semibold text-slate-700">{likePeople.map((person) => person.name).join(', ')}</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 mt-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-heading">
                Mensajes de la familia
              </h4>

              <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                {memory.comments && memory.comments.length > 0 ? (
                  memory.comments.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{c.authorName}</span>
                        <span className="text-[10px] text-slate-400">
                          {c.date ? new Date(c.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-slate-600">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Aún no hay notas. ¡Escribe la primera nota de amor para este recuerdo!
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Footer: Like & Add Comment */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            
            <div className="flex items-center justify-between mb-3">
              {currentUser && (
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all transform active:scale-95 cursor-pointer ${
                    hasLiked
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
                  <span>{hasLiked ? 'Te encanta' : 'Me encanta'} ({memory.likes?.length || 0})</span>
                </button>
              )}
            </div>

            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handleSendComment} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe una nota tierna..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-100 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2.5 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white shadow-xs transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <p className="text-xs text-center text-slate-400 py-1">
                Inicia sesión para dejar comentarios.
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
