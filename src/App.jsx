import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MemoryCard } from './components/MemoryCard';
import { TimelineView } from './components/TimelineView';
import { MemoryModal } from './components/MemoryModal';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { SlideshowModal } from './components/SlideshowModal';
import { 
  fetchMemories, 
  createMemory, 
  toggleLikeMemory, 
  addCommentToMemory, 
  deleteMemory 
} from './firebase/services';
import { useAuth } from './context/AuthContext';
import { Heart, Sparkles, Image, PlusCircle, Flame, Play, Star, Calendar } from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer';

export function App() {
  const { currentUser, isOwner, canUpload, isFirebaseActive } = useAuth();
  
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMemories();
      setMemories(data);
    } catch (err) {
      console.error('Error loading memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  const handleUploadSuccess = async (newMemoryData) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const saved = await createMemory(newMemoryData);
    setMemories(prev => [saved, ...prev]);
  };

  const handleLike = async (memoryId) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const hasLiked = await toggleLikeMemory(memoryId, currentUser.email);
    
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        const likes = m.likes || [];
        const updatedLikes = hasLiked
          ? [...likes, currentUser.email]
          : likes.filter(e => e !== currentUser.email);
        return { ...m, likes: updatedLikes };
      }
      return m;
    }));

    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory(prev => {
        const likes = prev.likes || [];
        const updatedLikes = hasLiked
          ? [...likes, currentUser.email]
          : likes.filter(e => e !== currentUser.email);
        return { ...prev, likes: updatedLikes };
      });
    }
  };

  const handleAddComment = async (memoryId, commentData) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const newComment = await addCommentToMemory(memoryId, commentData);
    
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        return { ...m, comments: [...(m.comments || []), newComment] };
      }
      return m;
    }));

    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
    }
  };

  const handleDelete = async (memoryId, imageUrl) => {
    if (!isOwner) return;
    await deleteMemory(memoryId, imageUrl);
    setMemories(prev => prev.filter(m => m.id !== memoryId));
    if (selectedMemory?.id === memoryId) {
      setSelectedMemory(null);
    }
  };

  const filteredMemories = memories.filter(memory => {
    if (selectedCategory !== 'Todas' && memory.category !== selectedCategory) {
      return false;
    }
    if (showFavoritesOnly) {
      if (!currentUser || !memory.likes?.includes(currentUser.email)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = memory.title?.toLowerCase().includes(q);
      const matchDesc = memory.description?.toLowerCase().includes(q);
      const matchAuthor = memory.author?.name?.toLowerCase().includes(q);
      const matchTags = memory.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAuthor && !matchTags) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalLikesCount = memories.reduce((acc, m) => acc + (m.likes?.length || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Firebase Status Helper Banner */}
      {!isFirebaseActive && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white text-xs font-semibold py-2 px-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="p-1 bg-white/20 rounded-md shrink-0">
                <Flame className="w-3.5 h-3.5 fill-white" />
              </span>
              <span className="truncate">
                <strong>Modo Local / Demostración:</strong> Puedes probar subir fotos de Sofia, notas y corazones al instante.
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="shrink-0 px-3 py-1 bg-white text-rose-600 hover:bg-rose-50 rounded-full font-bold shadow-xs transition cursor-pointer"
            >
              Conectar Firebase
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSlideshow={() => setIsSlideshowOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalMemories={memories.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Hero for HSofiaAF */}
        <section className="relative memory-hero rounded-[28px] p-6 sm:p-10 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-6 overflow-hidden">
          
          <div className="hero-grid pointer-events-none" />
          <div className="hero-orbit pointer-events-none" aria-hidden="true">
            <div className="hero-orbit__ring hero-orbit__ring--one" />
            <div className="hero-orbit__ring hero-orbit__ring--two" />
            <div className="hero-orbit__core"><Heart className="w-8 h-8 fill-current" /></div>
            <Sparkles className="hero-float hero-float--one" />
            <Heart className="hero-float hero-float--two fill-current" />
            <Heart className="hero-float hero-float--three" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-rose-200/80 text-rose-700 font-bold text-xs uppercase tracking-wider mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>El jardín de recuerdos de Sofia</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading leading-none sm:leading-tight">
                Cada sonrisa y aventura de <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">HSofiaAF</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-xl font-sans leading-relaxed">
                Un álbum digital íntimo y privado para atesorar cada paso, risa y recuerdo inolvidable de nuestra pequeña con todo el amor familiar.
              </p>

              {/* Quick Stats Pills */}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/70 text-xs font-bold text-slate-700 shadow-2xs">
                  <Image className="w-3.5 h-3.5 text-rose-500" />
                  <span>{memories.length} recuerdos</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/70 text-xs font-bold text-slate-700 shadow-2xs">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{totalLikesCount} corazones</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/70 text-xs font-bold text-slate-700 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Desde Junio 2026</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-3 shrink-0">
              {memories.length > 0 && (
                <button
                  onClick={() => setIsSlideshowOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-sm hover:shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Ver Presentación</span>
                </button>
              )}

              {currentUser && canUpload && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 transition transform active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Subir Recuerdo</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          totalFiltered={filteredMemories.length}
          totalAll={memories.length}
        />

        {/* Search feedback notice */}
        {searchQuery.trim() && (
          <div className="mb-4 flex items-center justify-between px-4 py-2 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-800">
            <span>Resultados para: <strong>"{searchQuery}"</strong> ({filteredMemories.length} encontrados)</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-rose-600 hover:text-rose-900 font-bold underline cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* View Layout (Grid or Timeline) */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500 font-heading">Cargando recuerdos con amor...</p>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-[28px] p-8 max-w-md mx-auto my-8 border border-white/90 shadow-md">
            <div className="w-16 h-16 rounded-full bg-rose-100/80 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 font-heading">No se encontraron recuerdos</h3>
            <p className="text-xs text-slate-500 mb-5">
              Prueba con otra categoría o añade el primer momento inolvidable de Sofia.
            </p>
            {currentUser && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition cursor-pointer"
              >
                Subir nuevo recuerdo
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onSelect={(mem) => setSelectedMemory(mem)}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <TimelineView
            memories={filteredMemories}
            onSelect={(mem) => setSelectedMemory(mem)}
            onLike={handleLike}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-slate-200/60 text-center text-xs text-slate-500 font-sans">
        <p className="flex items-center justify-center gap-1">
          Hecho con <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para <strong className="text-slate-700">HSofiaAF</strong> y su familia.
        </p>
      </footer>

      {/* Modals */}
      <MemoryModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onLike={handleLike}
        onAddComment={handleAddComment}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <FirebaseConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SlideshowModal
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        memories={filteredMemories.length > 0 ? filteredMemories : memories}
        onLike={handleLike}
        currentUser={currentUser}
      />

      {/* Floating ambient music player */}
      <AudioPlayer />

    </div>
  );
}

export default App;
