import React, { useState, useRef } from 'react';
import { X, Check, Camera, Sparkles, Smile, RefreshCw, Upload, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_ROLES = [
  'Papá',
  'Mamá',
  'Tía',
  'Tío',
  'Abuelita',
  'Abuelito',
  'Prima',
  'Primo',
  'Hermana',
  'Hermano',
  'Amigo de papá',
  'Amiga de mamá',
  'Familia'
];

const PRESET_AVATARS = [
  // DiceBear & SVG curated avatars
  { id: 'bot-rose', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sofia&backgroundColor=f43f5e', label: 'Bot Rosa' },
  { id: 'bot-amber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=f59e0b', label: 'Bot Ámbar' },
  { id: 'bot-indigo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma&backgroundColor=6366f1', label: 'Bot Índigo' },
  { id: 'bot-emerald', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Familia&backgroundColor=10b981', label: 'Bot Verde' },
  { id: 'adventurer-1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc', label: 'Luna' },
  { id: 'adventurer-2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=d1fae5', label: 'Milo' },
  { id: 'micah-1', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=e0e7ff', label: 'Félix' },
  { id: 'micah-2', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Chloe&backgroundColor=fef3c7', label: 'Chloe' },
  { id: 'lorelei-1', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=ffe4e6', label: 'Bella' },
  { id: 'lorelei-2', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Leo&backgroundColor=ede9fe', label: 'Leo' }
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [role, setRole] = useState(currentUser?.role || 'Familia');
  const [customRole, setCustomRole] = useState('');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarTab, setAvatarTab] = useState('presets'); // 'presets' | 'upload' | 'generator'
  const [seedText, setSeedText] = useState('');
  
  const fileInputRef = useRef(null);

  if (!isOpen || !currentUser) return null;

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setCustomRole('');
  };

  const handleCustomRoleChange = (e) => {
    const val = e.target.value;
    setCustomRole(val);
    setRole(val);
  };

  const handleGenerateDicebear = (seed) => {
    const s = seed || Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(s)}&backgroundColor=f43f5e,ec4899,8b5cf6,3b82f6`;
    setAvatar(newAvatar);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setAvatar(uploadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        role: (role || 'Familia').trim(),
        avatar: avatar || currentUser.avatar
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#10b981']
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error al guardar el perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">Mi Perfil Familiar</h3>
              <p className="text-xs text-slate-500">Personaliza tu apodo, relación e icono</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Avatar Preview & Selection */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={avatar || currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name || 'user'}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-400/40 shadow-lg bg-slate-50"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 hover:bg-rose-600 text-white shadow-md transition cursor-pointer"
                title="Subir foto propia"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            <p className="text-xs font-semibold text-slate-500 mt-2.5">
              {currentUser.email}
            </p>
          </div>

          {/* Avatar Selector Tabs */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-rose-500" /> Elige tu Icono / Avatar
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAvatarTab('presets')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    avatarTab === 'presets' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Galería
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('generator')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    avatarTab === 'generator' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Generador
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" /> Subir
                </button>
              </div>
            </div>

            {avatarTab === 'presets' ? (
              <div className="grid grid-cols-5 gap-2 pt-1">
                {PRESET_AVATARS.map((p) => {
                  const isSelected = avatar === p.url;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      className={`relative p-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-50 ring-2 ring-rose-500 scale-105 shadow-xs' 
                          : 'bg-white hover:bg-slate-100/80 border border-slate-100 hover:scale-102'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-10 h-10 rounded-full" />
                      <span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">{p.label}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Escribe una palabra (ej. princesa, leo, gato)..."
                  value={seedText}
                  onChange={(e) => setSeedText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleGenerateDicebear(seedText)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Generar
                </button>
              </div>
            )}
          </div>

          {/* Name / Nickname */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Nombre / Apodo Familiar
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Alex, Sofi, Mamá Elena..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
            />
          </div>

          {/* Role / Family Relationship */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Relación con Sofia / Rol
            </label>

            {/* Role Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SUGGESTED_ROLES.map((r) => {
                const isSelected = role === r && !customRole;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-xs scale-102'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="O escribe otro apodo (ej. Amigo de papá, Padrino, etc.)..."
                value={customRole}
                onChange={handleCustomRoleChange}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition transform active:scale-95 cursor-pointer"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" /> ¡Guardado!
                </>
              ) : loading ? (
                'Guardando...'
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" /> Guardar Cambios
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
