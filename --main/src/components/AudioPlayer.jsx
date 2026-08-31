import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Free-to-use ambient music tracks (from pixabay.com CC0 public domain)
// ──────────────────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    title: 'Melodía de cuna',
    mood: '🌙',
    url: 'https://cdn.pixabay.com/audio/2024/02/21/audio_0e6f2b9c36.mp3'
  },
  {
    title: 'Tarde en familia',
    mood: '☀️',
    url: 'https://cdn.pixabay.com/audio/2023/09/28/audio_3d2a9b05ea.mp3'
  },
  {
    title: 'Momento mágico',
    mood: '✨',
    url: 'https://cdn.pixabay.com/audio/2022/10/31/audio_84a1cdb4f5.mp3'
  }
];

export const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.35);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef(null);

  const track = TRACKS[trackIndex];

  // Sync volume + mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle track change
  useEffect(() => {
    if (!audioRef.current) return;
    setLoadError(false);
    const wasPlaying = isPlaying;
    audioRef.current.load();
    if (wasPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  const togglePlay = () => {
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

  const prevTrack = () => {
    setTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);
  };

  const nextTrack = () => {
    setTrackIndex((i) => (i + 1) % TRACKS.length);
  };

  return (
    <div
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-2 no-select"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Expanded panel ── */}
      {isExpanded && (
        <div
          className="glass-card rounded-2xl px-4 py-3 flex flex-col gap-2 animate-slideInFromTop max-w-[calc(100vw-2rem)]"
          style={{ width: 230, boxShadow: '0 8px 32px -4px rgba(244,63,94,0.18)' }}
        >
          {/* Track info */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{track.mood}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{track.title}</p>
              <p className="text-[10px] text-slate-400">
                {trackIndex + 1}/{TRACKS.length} · Música ambiental
              </p>
            </div>
          </div>

          {/* Track navigation */}
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={prevTrack}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Pista anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Playing bars or paused icon */}
            <div className="flex items-end gap-[3px] h-5">
              {isPlaying ? (
                <>
                  <div className="w-1 bg-rose-500 rounded-full bar-1" style={{ height: '100%' }} />
                  <div className="w-1 bg-pink-500 rounded-full bar-2" style={{ height: '100%' }} />
                  <div className="w-1 bg-amber-500 rounded-full bar-3" style={{ height: '100%' }} />
                  <div className="w-1 bg-rose-400 rounded-full bar-4" style={{ height: '100%' }} />
                </>
              ) : (
                <div className="flex items-end gap-[3px] h-5 opacity-30">
                  {[0.4,0.7,0.5,0.4].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-slate-400 rounded-full"
                      style={{ height: `${h * 100}%` }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={nextTrack}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Siguiente pista"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 cursor-pointer"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
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
              className="flex-1 h-1.5 accent-rose-500 cursor-pointer"
              style={{ accentColor: '#f43f5e' }}
            />
          </div>

          {loadError && (
            <p className="text-[10px] text-amber-600 text-center">
              ⚠️ Prueba con otra pista
            </p>
          )}
        </div>
      )}

      {/* ── Main floating button ── */}
      <button
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true);
          } else {
            togglePlay();
          }
        }}
        onContextMenu={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
        title={isExpanded ? (isPlaying ? 'Pausar música' : 'Reproducir música') : 'Música ambiental'}
        className="relative w-12 h-12 rounded-full text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xl"
        style={{
          background: isPlaying
            ? 'linear-gradient(135deg, #f43f5e, #ec4899)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: isPlaying
            ? '0 4px 20px rgba(244,63,94,0.45)'
            : '0 4px 20px rgba(99,102,241,0.35)'
        }}
      >
        {/* Pulse ring when playing */}
        {isPlaying && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: 'rgba(244,63,94,0.25)',
              animationDuration: '2s'
            }}
          />
        )}

        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-5">
            <div className="w-[3px] bg-white rounded-full bar-1" style={{ height: '100%' }} />
            <div className="w-[3px] bg-white rounded-full bar-2" style={{ height: '100%' }} />
            <div className="w-[3px] bg-white rounded-full bar-3" style={{ height: '100%' }} />
          </div>
        ) : (
          <Music className="w-5 h-5" />
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
