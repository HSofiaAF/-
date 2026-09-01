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
import { ProfileModal } from './components/ProfileModal';
import { FloatingDock } from './components/FloatingDock';
import { AudioPlayer } from './components/AudioPlayer';
import { CosmicBackground } from './components/CosmicBackground';
import { 
  fetchMemories, 
  createMemory, 
  updateMemory,
  toggleLikeMemory, 
  addCommentToMemory, 
  deleteMemory,
  subscribeToPresence, 
  updatePresence 
} from './firebase/services';
import { useAuth } from './context/AuthContext';
import { 
  Heart, 
  Sparkles, 
  Image as ImageIcon, 
  PlusCircle, 
  ArrowUpRight, 
  ChevronDown, 
  Users 
} from 'lucide-react';


export function App() {
  const { currentUser, isOwner, canUpload, isFirebaseActive } = useAuth();
  
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  useEffect(() => {
    if (!currentUser) {
      setOnlineUsers([]);
      return undefined;
    }

    updatePresence(currentUser).catch(() => {});
    const unsubscribe = subscribeToPresence((users) => {
      const mergedUsers = [currentUser, ...users];
      setOnlineUsers(mergedUsers.filter((user, index, allUsers) =>
        allUsers.findIndex((candidate) => (candidate.uid || candidate.email) === (user.uid || user.email)) === index
      ));
    });
    const heartbeat = window.setInterval(() => updatePresence(currentUser).catch(() => {}), 60000);

    if (!isFirebaseActive) setOnlineUsers([currentUser]);
    return () => {
      unsubscribe();
      window.clearInterval(heartbeat);
    };
  }, [currentUser, isFirebaseActive]);

  const handleUploadSuccess = async (newMemoryData) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const saved = await createMemory(newMemoryData);
    setMemories(prev => [saved, ...prev]);
  };

  const handleUpdateMemory = async (memoryId, updates) => {
    const updated = await updateMemory(memoryId, updates);
    setMemories(prev => prev.map(m => m.id === memoryId ? { ...m, ...updated } : m));
    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory(prev => ({ ...prev, ...updated }));
    }
    return updated;
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

  const currentMemoryIndex = selectedMemory 
    ? filteredMemories.findIndex(m => m.id === selectedMemory.id)
    : -1;

  const handleNextMemory = () => {
    if (filteredMemories.length <= 1) return;
    if (currentMemoryIndex >= 0 && currentMemoryIndex < filteredMemories.length - 1) {
      setSelectedMemory(filteredMemories[currentMemoryIndex + 1]);
    } else {
      setSelectedMemory(filteredMemories[0]);
    }
  };

  const handlePrevMemory = () => {
    if (filteredMemories.length <= 1) return;
    if (currentMemoryIndex > 0) {
      setSelectedMemory(filteredMemories[currentMemoryIndex - 1]);
    } else {
      setSelectedMemory(filteredMemories[filteredMemories.length - 1]);
    }
  };

  const scrollToMemories = () => {
    const el = document.getElementById('memories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Bento highlight items (first 2 memories or fallback)
  const highlight1 = memories[0];
  const highlight2 = memories[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#05070d] text-slate-100 selection:bg-rose-500/30 selection:text-white pb-20 relative">
      {/* 3D Cosmic Space Background Canvas */}
      <CosmicBackground />
      
      {/* Top Navigation */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSlideshow={() => setIsSlideshowOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalMemories={memories.length}
        onlineUsers={onlineUsers}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
        
        {/* ── Slide 1/9, 5/9, 6/9: Editorial Hero Showcase ── */}
        <section className="relative editorial-hero rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 lg:p-14 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] mb-8 overflow-hidden contain-paint">
          
          {/* Background Video with Cinematic Vignette */}
          <video
            className="editorial-hero-video"
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
            aria-hidden="true"
            src={`${import.meta.env.BASE_URL}sofia-bailando.mp4`}
          />
          <div className="editorial-hero-overlay" />

          {/* Hero Content Container */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Headline & Typography */}
            <div className="max-w-2xl">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-rose-300 font-bold text-[11px] uppercase tracking-wider mb-4 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>#ElJardínDeSofia • Recuerdos Familiares</span>
              </div>

              {/* Display Headline (Slide 5/9: Framing What the Universe Has Painted) */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-editorial leading-[1.1]">
                Where Love <br className="hidden sm:inline" />
                Breathes.
                <span className="block text-2xl sm:text-4xl lg:text-5xl text-rose-300 font-normal mt-2 font-script">
                  Cada sonrisa de HSofiaAF
                </span>
              </h2>

              {/* Poetic Subtitle */}
              <p className="text-xs sm:text-sm text-slate-300 mt-4 max-w-xl font-normal leading-relaxed">
                "La memoria es el único paraíso del que no podemos ser expulsados. A través de este álbum, cada paso, mirada y risa de Sofia se vuelve un tesoro eterno."
              </p>

              {/* Action Buttons (Slide 5/9: [ GET STARTED ↗ ]) */}
              <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">
                <button
                  onClick={scrollToMemories}
                  className="flex items-center gap-2 px-5 sm:px-7 py-3 rounded-full bg-gradient-to-r from-pink-200 via-rose-100 to-amber-100 text-slate-950 font-bold text-xs sm:text-sm hover:opacity-95 transition transform active:scale-95 shadow-[0_8px_24px_rgba(244,114,182,0.35)] cursor-pointer"
                >
                  <span>EXPLORAR RECUERDOS</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-900" />
                </button>

                {currentUser && canUpload ? (
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full glass-pill hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition transform active:scale-95 cursor-pointer border border-white/25"
                  >
                    <PlusCircle className="w-4 h-4 text-rose-400" />
                    <span>Subir Recuerdo</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full glass-pill hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition transform active:scale-95 cursor-pointer border border-white/25"
                  >
                    <Users className="w-4 h-4 text-rose-400" />
                    <span>Entrar a la Familia</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Orbital Lens Portal (Slide 5/9 style) */}
            <div className="hidden md:flex items-center justify-center relative py-6">
              <div className="editorial-lens flex items-center justify-center overflow-hidden bg-slate-900/60">
                {/* Concentric Rotating Orbital Wireframe Rings */}
                <div className="editorial-lens__ring" />
                <div className="editorial-lens__ring-outer" />
                
                {/* Inner Highlight Memory Photo / Thumbnail */}
                {highlight1 ? (
                  <img
                    src={highlight1.imageUrl}
                    alt="Sofia"
                    className="w-full h-full object-cover rounded-full p-1.5 opacity-90 transition-transform duration-700 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                    <Heart className="w-12 h-12 fill-current animate-pulse" />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Floating Down Chevron Pill (Slide 5/9 style) */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={scrollToMemories}
              className="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl hover:scale-110 transition active:scale-95 cursor-pointer border-2 border-slate-900"
              title="Ir a los recuerdos"
              aria-label="Ir a los recuerdos"
            >
              <ChevronDown className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </section>

        {/* ── Slide 2/9, 5/9, 8/9: Bento Highlight & Narrative Row ── */}
        {memories.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
            
            {/* Bento Tile 1 (01) */}
            {highlight1 && (
              <div 
                onClick={() => setSelectedMemory(highlight1)}
                className="lg:col-span-3 group editorial-card overflow-hidden cursor-pointer flex flex-col relative aspect-[4/5] sm:aspect-auto sm:h-72"
              >
                <img 
                  src={highlight1.imageUrl} 
                  alt={highlight1.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold glass-pill text-white uppercase">
                  {highlight1.category || 'Destacado'}
                </span>
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white font-editorial">
                  01
                </span>
                <span className="absolute bottom-3 right-3 text-xs font-semibold text-slate-300 truncate max-w-[120px]">
                  {highlight1.title}
                </span>
              </div>
            )}

            {/* Bento Tile 2 (02) */}
            {highlight2 && (
              <div 
                onClick={() => setSelectedMemory(highlight2)}
                className="lg:col-span-3 group editorial-card overflow-hidden cursor-pointer flex flex-col relative aspect-[4/5] sm:aspect-auto sm:h-72"
              >
                <img 
                  src={highlight2.imageUrl} 
                  alt={highlight2.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold glass-pill text-white uppercase">
                  {highlight2.category || 'Momento'}
                </span>
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white font-editorial">
                  02
                </span>
                <span className="absolute bottom-3 right-3 text-xs font-semibold text-slate-300 truncate max-w-[120px]">
                  {highlight2.title}
                </span>
              </div>
            )}

            {/* Bento Tile 3: Editorial Narrative Card (Slide 5/9 Right column) */}
            <div className="lg:col-span-6 glass-card rounded-[28px] p-6 sm:p-8 flex flex-col justify-between border border-white/15">
              <div>
                <span className="text-rose-300 text-2xl sm:text-3xl font-script block mb-1">
                  Momentos que abrazan el alma
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-editorial text-white tracking-tight leading-snug">
                  "Ver el mundo a través de los ojos de Sofia es volver a descubrir la magia en cada instante."
                </h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-normal">
                  Cada risa contagiosa, cada nuevo paso y cada tarde compartida forman parte del libro más lindo que jamás hayamos escrito.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 mt-4 flex flex-wrap items-center justify-between gap-4">
                {/* Organic Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    Aventuras
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                    Risas
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                    Familia
                  </span>
                </div>

                {/* Family Avatar Stack + Counter */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="https://api.dicebear.com/7.x/bottts/svg?seed=Papa" alt="" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="https://api.dicebear.com/7.x/bottts/svg?seed=Mama" alt="" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="https://api.dicebear.com/7.x/bottts/svg?seed=Sofia" alt="" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">+ Familia</span>
                </div>
              </div>
            </div>

          </section>
        )}

        {/* ── Memories Gallery & Timeline Section ── */}
        <section id="memories-section" className="scroll-mt-24">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-editorial text-white tracking-tight">
                Colección de Recuerdos
              </h3>
              <p className="text-xs text-slate-400">
                Explora cada memoria guardada con cariño.
              </p>
            </div>
          </div>

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
            <div className="mb-4 flex items-center justify-between px-4 py-2 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
              <span>Resultados para: <strong>"{searchQuery}"</strong> ({filteredMemories.length} encontrados)</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-rose-400 hover:text-white font-bold underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          {/* View Layout (Grid or Timeline) */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 font-editorial">Cargando recuerdos con amor...</p>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="py-20 text-center glass-card rounded-[32px] p-8 max-w-md mx-auto my-8 border border-white/15 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 font-editorial">No se encontraron recuerdos</h3>
              <p className="text-xs text-slate-400 mb-5">
                Prueba con otra categoría o añade el primer momento inolvidable de Sofia.
              </p>
              {currentUser && canUpload && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-500/30 transition cursor-pointer"
                >
                  Subir nuevo recuerdo
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMemories.map((memory, index) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  index={index}
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
        </section>

        {/* ── Slide 9/9: Outro Dedication Card ── */}
        <section className="mt-16 sm:mt-24 mb-12 glass-card rounded-[36px] p-8 sm:p-12 text-center relative overflow-hidden border border-white/15">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <span className="text-rose-300 text-3xl sm:text-4xl font-script mb-2 block">
              Con todo nuestro amor
            </span>
            <h4 className="text-xl sm:text-2xl font-black font-editorial text-white mb-4">
              Para Sofia montesinos quispe
            </h4>

            {/* Framed Mini Portrait (Slide 9/9 style) */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40 my-2 bg-slate-800">
              {highlight1 ? (
                <img src={highlight1.imageUrl} alt="Sofia" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-400">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-normal">
              Guardado con cariño para que cuando crezcas, veas cuánto amor siempre te rodeó.
            </p>

            <span className="mt-5 px-4 py-1.5 rounded-full text-[10px] font-bold glass-pill text-rose-300 uppercase tracking-widest border border-white/15">
              Álbum Familiar • HSofiaAF
            </span>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-slate-500 font-sans">
        <p className="flex items-center justify-center gap-1.5">
          Hecho con <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para <strong className="text-slate-300">HSofiaAF</strong> y su familia.
        </p>
      </footer>

      {/* ── Slide 2/9 & 6/9: Floating Bottom Dock ── */}
      <FloatingDock
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSlideshow={() => setIsSlideshowOpen(true)}
        totalMemories={memories.length}
      />

      {/* Floating ambient music player (Slide 7/9) */}
      <AudioPlayer />

      {/* Modals */}
      <MemoryModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onUpdateMemory={handleUpdateMemory}
        onNext={handleNextMemory}
        onPrev={handlePrevMemory}
        currentIndex={currentMemoryIndex}
        totalCount={filteredMemories.length}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
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

    </div>
  );
}

export default App;
