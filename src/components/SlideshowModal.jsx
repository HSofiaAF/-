import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Heart, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SlideshowModal = ({ isOpen, onClose, memories = [], onLike, currentUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const total = memories.length;
  const current = memories[currentIndex] || null;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!isOpen || !isPlaying || total <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, total, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  if (!isOpen || !current) return null;

  const hasLiked = currentUser && current.likes?.includes(currentUser.email);

  const handleLike = () => {
    if (!currentUser) return;
    if (!hasLiked) {
      confetti({
        particleCount: 40,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#ec4899', '#fbbf24']
      });
    }
    onLike(current.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-white/10 text-rose-300 text-xs font-bold border border-white/15 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Recuerdos de HSofiaAF</span>
          </div>
          <span className="text-white/60 text-xs font-semibold">
            {currentIndex + 1} de {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Image & Nav Buttons */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer"
          title="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="max-w-4xl max-h-[70vh] flex items-center justify-center transition-all duration-700">
          <img
            key={current.id}
            src={current.imageUrl}
            alt={current.title}
            className="max-h-[68vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain ring-1 ring-white/20 animate-pulse-subtle"
          />
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer"
          title="Siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info & Reaction Bar */}
      <div className="max-w-3xl mx-auto w-full glass-dark p-4 sm:p-5 rounded-2xl border border-white/10 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-300 font-semibold mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
              {current.category}
            </span>
            <span className="flex items-center gap-1 text-white/60">
              <Calendar className="w-3 h-3 text-rose-400" />
              {current.date}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white font-heading">
            {current.title}
          </h3>
          {current.description && (
            <p className="text-xs text-white/75 mt-0.5 line-clamp-2 max-w-xl">
              {current.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer ${
              hasLiked 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
            <span>{current.likes?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3 z-20">
        {memories.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'w-8 bg-rose-500' : 'w-2 bg-white/25 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

    </div>
  );
};
