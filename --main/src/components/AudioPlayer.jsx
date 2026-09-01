import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Play, 
  Pause, 
  Disc3, 
  Sparkles,
  X
} from 'lucide-react';

const TRACKS = [
  {
    title: 'Melodía de Cuna',
    artist: 'Para Sofia con amor',
    mood: '🌙',
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/audio/2024/02/21/audio_0e6f2b9c36.mp3'
  },
  {
    title: 'Tarde en Familia',
    artist: 'Momentos inolvidables',
    mood: '☀️',
    cover: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/audio/2023/09/28/audio_3d2a9b05ea.mp3'
  },
  {
    title: 'Destellos de Alegría',
    artist: 'Risas de nuestra pequeña',
    mood: '✨',
    cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/audio/2022/10/31/audio_84a1cdb4f5.mp3'
  }
];

export const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  const track = TRACKS[trackIndex];

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Sync volume + mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle track change
  useEffect(() => {
    if (!audioRef.current) return;
    setLoadError(false);
    audioRef.current.load();
    if (isPlayingRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [trackIndex]);


  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setLoadError(false);
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setLoadError(true);
        });
    }
  };

  const prevTrack = (e) => {
    if (e) e.stopPropagation();
    setTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);
  };

  const nextTrack = (e) => {
    if (e) e.stopPropagation();
    setTrackIndex((i) => (i + 1) % TRACKS.length);
  };

  return (
    <div
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-2.5 no-select"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Slide 7/9 Editorial Music Card ── */}
      {isExpanded && (
        <div
          className="relative rounded-3xl p-4 flex flex-col gap-3.5 animate-slideInFromTop max-w-[calc(100vw-2rem)] w-[270px] sm:w-[290px] text-white overflow-hidden border border-white/20 bg-slate-950/85 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.7)]"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-rose-300 uppercase tracking-wider border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Música Ambiental</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Minimizar reproductor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Album Cover & Track Details */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/20 shrink-0 bg-slate-800">
              <img 
                src={track.cover} 
                alt={track.title} 
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'scale-100 opacity-80'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Disc3 className="w-6 h-6 text-white/80 animate-spin-smooth" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate font-editorial tracking-tight">{track.title}</h4>
              <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
              <span className="text-[10px] text-rose-400/90 font-medium">{trackIndex + 1} de {TRACKS.length} canciones</span>
            </div>
          </div>

          {/* Playback Controls (Slide 7/9 style) */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <button
              onClick={prevTrack}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-90 cursor-pointer"
              title="Canción anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-white text-slate-950 hover:bg-rose-100 hover:text-rose-600 shadow-md transition transform active:scale-90 cursor-pointer"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-90 cursor-pointer"
              title="Siguiente canción"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume and Mute row */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-300" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (isMuted && v > 0) setIsMuted(false);
              }}
              className="flex-1 h-1 bg-white/20 rounded-full accent-rose-500 cursor-pointer"
              style={{ accentColor: '#f43f5e' }}
            />
          </div>

          {loadError && (
            <p className="text-[10px] text-amber-300 text-center">
              ⚠️ Intentando conectar pista...
            </p>
          )}
        </div>
      )}

      {/* ── Floating Circular Mute / Sound Toggle Button (Slide 7/9) ── */}
      <button
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true);
            if (!isPlaying) togglePlay();
          } else {
            togglePlay();
          }
        }}
        onContextMenu={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
        title={isExpanded ? (isPlaying ? 'Pausar música' : 'Reproducir música') : 'Abrir música ambiental'}
        className="relative w-12 h-12 rounded-full text-white flex items-center justify-center transition-all transform active:scale-90 cursor-pointer border border-white/25 bg-slate-900/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        {isPlaying && (
          <span
            className="absolute inset-0 rounded-full animate-ping pointer-events-none"
            style={{
              background: 'rgba(244,63,94,0.3)',
              animationDuration: '2.5s'
            }}
          />
        )}

        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-rose-400 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        loop
        preload="none"
        onError={() => { setIsPlaying(false); setLoadError(true); }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={track.url} type="audio/mpeg" />
      </audio>
    </div>
  );
};
