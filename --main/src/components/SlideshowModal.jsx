import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Play, Pause,
  Heart, Calendar, Sparkles, Maximize2, Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SlideshowModal = ({ isOpen, onClose, memories = [], onLike, currentUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [kenBurnsKey, setKenBurnsKey] = useState(0); // forces re-mount for animation reset
  const touchStartX = React.useRef(null);

  const total = memories.length;
  const current = memories[currentIndex] || null;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setKenBurnsKey((k) => k + 1);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setKenBurnsKey((k) => k + 1);
  }, [total]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 45;
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  // Auto-advance
  useEffect(() => {
    if (!isOpen || !isPlaying || total <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, total, nextSlide]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { if (isFullscreen) setIsFullscreen(false); else onClose(); }
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') { e.preventDefault(); setIsPlaying((prev) => !prev); }
      if (e.key === 'f') setIsFullscreen((f) => !f);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose, isFullscreen]);

  // Reset index on open
  useEffect(() => {
    if (isOpen) { setCurrentIndex(0); setKenBurnsKey(0); }
  }, [isOpen]);

  if (!isOpen || !current) return null;

  const hasLiked = currentUser && current.likes?.includes(currentUser.email);

  const handleLike = () => {
    if (!currentUser) return;
    if (!hasLiked) {
      confetti({
        particleCount: 55,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#ec4899', '#fbbf24', '#a78bfa']
      });
    }
    onLike(current.id);
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none animate-fadeIn"
      style={{ background: 'rgba(5, 5, 15, 0.97)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 sm:px-8 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-2 z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-rose-300 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Recuerdos</span>
          </div>
          <span className="text-white/50 text-[11px] sm:text-xs font-semibold">
            {currentIndex + 1} / {total}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-full transition cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
          >
            {isPlaying
              ? <Pause className="w-4 h-4 text-white" />
              : <Play className="w-4 h-4 text-white" />
            }
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-2.5 rounded-full transition cursor-pointer hidden sm:flex"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            title="Pantalla completa (F)"
          >
            {isFullscreen
              ? <Minimize2 className="w-4 h-4 text-white" />
              : <Maximize2 className="w-4 h-4 text-white" />
            }
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full transition cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── Image Area ────────────────────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Ken Burns image background */}
        <div
          key={`bg-${kenBurnsKey}`}
          className="absolute inset-0 bg-cover bg-center opacity-10 animate-ken-burns pointer-events-none"
          style={{ backgroundImage: `url(${current.imageUrl})`, filter: 'blur(20px) saturate(150%)' }}
        />

        {/* Prev button */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 z-20 p-3 rounded-full transition cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          title="Anterior (←)"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Main image with Ken Burns */}
        <div
          className="relative max-w-5xl max-h-[70vh] flex items-center justify-center z-10"
          style={{ width: '100%' }}
        >
          {current.mediaType === 'video' ? (
            <video key={`video-${kenBurnsKey}`} src={current.imageUrl} controls autoPlay playsInline className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain" />
          ) : <img key={`img-${kenBurnsKey}`} src={current.imageUrl} alt={current.title} className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain animate-ken-burns" style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)', animationDuration: '14s' }} loading="eager" />}
        </div>

        {/* Next button */}
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 z-20 p-3 rounded-full transition cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          title="Siguiente (→)"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* ── Bottom Info Bar ───────────────────────────────────────────────── */}
      <div className="shrink-0 z-20 px-3 sm:px-8 pt-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <div
          className="max-w-3xl mx-auto w-full p-3 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4"
          style={{
            background: 'rgba(10,10,20,0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs mb-1.5">
              <span
                className="px-2.5 py-0.5 rounded-full font-bold"
                style={{
                  background: 'rgba(244,63,94,0.2)',
                  border: '1px solid rgba(244,63,94,0.25)',
                  color: '#fb7185'
                }}
              >
                {current.category || 'Momento'}
              </span>
              <span className="flex items-center gap-1 text-white/50">
                <Calendar className="w-3 h-3 text-rose-400" />
                {formatDate(current.date)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-heading truncate">
              {current.title}
            </h3>
            {current.description && (
              <p className="text-xs text-white/65 mt-0.5 line-clamp-2 max-w-xl leading-relaxed">
                {current.description}
              </p>
            )}
          </div>

          {/* Like button */}
          {currentUser && (
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition active:scale-90 cursor-pointer shrink-0"
              style={{
                background: hasLiked
                  ? 'linear-gradient(135deg, #e11d48, #f43f5e)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                boxShadow: hasLiked ? '0 4px 16px rgba(244,63,94,0.45)' : 'none'
              }}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
              <span>{current.likes?.length || 0}</span>
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {memories.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => { setCurrentIndex(idx); setKenBurnsKey((k) => k + 1); }}
              className="h-1.5 rounded-full transition-all cursor-pointer"
              style={{
                width: idx === currentIndex ? 32 : 8,
                background: idx === currentIndex
                  ? '#f43f5e'
                  : 'rgba(255,255,255,0.22)'
              }}
            />
          ))}
        </div>

        {/* Keyboard hints */}
        <p className="text-center text-[10px] text-white/25 mt-2 hidden sm:block">
          ← → Navegar · Espacio Pausar/Reproducir · Esc Cerrar
        </p>
      </div>
    </div>
  );
};
