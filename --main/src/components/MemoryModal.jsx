import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Calendar, Share2, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getLikePeople } from '../utils/people';

export const MemoryModal = ({ 
  memory, 
  memories = [], 
  currentIndex = 0, 
  onClose, 
  onLike, 
  onAddComment, 
  onNext, 
  onPrev,
  totalCount
}) => {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  const total = totalCount || memories.length;

  useEffect(() => {
    if (!memory || total <= 1) return undefined;

    const handleWheel = (event) => {
      const interactiveElement = event.target.closest('textarea, input, button, select, [contenteditable="true"]');
      if (interactiveElement) return;
      if (Math.abs(event.deltaY) < 20) return;

      event.preventDefault();
      if (event.deltaY > 0 && onNext) onNext();
      if (event.deltaY < 0 && onPrev) onPrev();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && onNext) onNext();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'Escape') onClose();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [memory, total, onNext, onPrev, onClose]);

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

      {/* Floating Prev Button (Left) - Desktop only */}
      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="hidden md:flex fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md shadow-xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer border border-white/20 items-center justify-center"
          title="Recuerdo anterior (←)"
          aria-label="Recuerdo anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Floating Next Button (Right) - Desktop only */}
      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="hidden md:flex fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md shadow-xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer border border-white/20 items-center justify-center"
          title="Recuerdo siguiente (→)"
          aria-label="Recuerdo siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="relative w-full max-w-5xl max-h-[92dvh] sm:max-h-[92vh] bg-white rounded-3xl sm:rounded-[28px] overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row border border-white/20 animate-in zoom-in-95 duration-200">
        
        {/* Close Button & Position Badge */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex items-center gap-2">
          {total > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 shadow-md">
              {currentIndex + 1} / {total}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer shadow-md"
            title="Cerrar (Esc)"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Left / Top: High-Res Image with Ambient Backdrop */}
        <div className="md:w-3/5 bg-slate-950 flex items-center justify-center relative overflow-hidden group select-none shrink-0 min-h-[180px]">
          {memory.mediaType === 'video' ? (
            <video key={memory.imageUrl} src={memory.imageUrl} controls autoPlay playsInline className="w-full h-full max-h-[35vh] sm:max-h-[48vh] md:max-h-[85vh] object-contain" />
          ) : (
            <img key={memory.imageUrl} src={memory.imageUrl} alt={memory.title} className="w-full h-full max-h-[35vh] sm:max-h-[48vh] md:max-h-[85vh] object-contain select-none transition-all duration-300" />
          )}

          {/* On-image Quick Prev/Next buttons for mobile & touch */}
          {onPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 active:scale-90 z-10"
              aria-label="Recuerdo anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {onNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 active:scale-90 z-10"
              aria-label="Recuerdo siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right / Bottom: Details, Loving Notes & Comments */}
        <div className="md:w-2/5 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[57vh] md:max-h-[85vh] bg-white flex-1">
          <div>
            {/* Header: Category & Share */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
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
                  className="flex-1 px-4 py-2 text-sm sm:text-xs bg-slate-100 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2.5 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white shadow-xs transition cursor-pointer shrink-0"
                  aria-label="Enviar nota"
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
