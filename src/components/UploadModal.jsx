import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Sparkles, Check, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../data/initialMemories';
import { useAuth } from '../context/AuthContext';

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const fileSelectionRef = useRef(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Momentos Especiales');
  const [tagsInput, setTagsInput] = useState('');
  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    fileSelectionRef.current += 1;
    setPreviewUrl(null);
    setCompressedFile(null);
    setCompressionStats(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const selectionId = ++fileSelectionRef.current;

    const isVideo = file.type.startsWith('video/');
    if (!file.type.startsWith('image/') && !isVideo) {
      setError('Por favor selecciona una foto o un video válido.');
      return;
    }

    setError('');
    setPreviewUrl(URL.createObjectURL(file));
    setIsCompressing(!isVideo);

    try {
      if (isVideo) {
        if (selectionId === fileSelectionRef.current) setCompressedFile(file);
        return;
      }
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      const compressed = await imageCompression(file, options);
      if (selectionId !== fileSelectionRef.current) return;
      setCompressedFile(compressed);

      const compressedKB = (compressed.size / 1024).toFixed(0);
      const savedPercent = Math.round(((file.size - compressed.size) / file.size) * 100);

      setCompressionStats({
        compressedKB,
        savedPercent: savedPercent > 0 ? savedPercent : 0
      });
    } catch (err) {
      console.warn('Compresión omitida, usando original:', err);
      if (selectionId === fileSelectionRef.current) setCompressedFile(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!compressedFile || !title.trim()) {
      setError('Por favor agrega un título y selecciona una foto o video.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await onUploadSuccess({
        title: title.trim(),
        description: description.trim(),
        date,
        category,
        tags,
        imageFile: compressedFile,
        author: {
          name: currentUser?.name || 'Familia',
          email: currentUser?.email || 'familia@familia.com',
          avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Family'
        }
      });

      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.5 }
      });

      onClose();
    } catch (err) {
      console.error('[UploadModal] No se pudo publicar el recuerdo:', err);
      setError(err.message || 'No se pudo guardar el recuerdo. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/70 backdrop-blur-sm">
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/80 z-10 flex flex-col max-h-[90dvh] sm:max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Agregar Nuevo Recuerdo</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Guarda una foto especial para siempre</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo upload zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Foto o video del recuerdo
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-2xl p-5 sm:p-8 text-center cursor-pointer bg-rose-50/20 hover:bg-rose-50/50 transition-all flex flex-col items-center justify-center gap-2 active:scale-[0.99]"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Toca para subir foto o video</p>
                <p className="text-[11px] sm:text-xs text-slate-400">JPG, PNG, WebP, HEIC, MP4 o WebM</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                {compressedFile?.type?.startsWith('video/') ? (
                  <video src={previewUrl} controls className="w-full h-44 sm:h-56 object-cover" />
                ) : <img src={previewUrl} alt="Vista previa" className="w-full h-44 sm:h-56 object-cover" />}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition cursor-pointer"
                >
                  Cambiar foto
                </button>

                {compressionStats && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    Optimizado {compressionStats.savedPercent}% ({compressionStats.compressedKB} KB)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Título del momento *
            </label>
            <input
              type="text"
              placeholder="Ej: Jugando en los columpios con mamá"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
            />
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Fecha del recuerdo
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition cursor-pointer"
              >
                {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Historia o anécdota
            </label>
            <textarea
              rows={3}
              placeholder="Escribe lo que sentiste ese día, lo que dijo o lo especial del momento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="ej: sonrisa, vacaciones, risas, parque"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading || isCompressing || !previewUrl}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-rose-500/25 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <span>Guardando recuerdo...</span>
              ) : isCompressing ? (
                <span>Optimizando foto...</span>
              ) : (
                <span>Publicar Recuerdo</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
