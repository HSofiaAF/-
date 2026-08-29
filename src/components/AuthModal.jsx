import React, { useState } from 'react';
import { X, Heart, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Familia');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setName(''); setEmail(''); setPassword(''); setRole('Familia');
    setError(''); setSuccess('');
  };

  const switchTab = (t) => { setTab(t); reset(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (tab === 'register') {
        if (!name.trim()) throw new Error('Por favor escribe tu nombre o apodo familiar.');
        await registerWithEmail(name, email, password, role);
        setSuccess('¡Cuenta creada! Ahora ya puedes guardar recuerdos. 🎉');
        setTimeout(onClose, 1500);
      } else {
        await loginWithEmail(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Error de autenticación. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,10,5,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'white', border: '1px solid rgba(255,255,255,0.8)' }}
      >
        {/* ── Gradient Header ─────────────────────────────────────────── */}
        <div
          className="relative p-8 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 45%, #f59e0b 100%)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full transition cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.2)' }}
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-4"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            <Heart className="w-8 h-8 fill-white" />
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight">
            {tab === 'login' ? 'Bienvenido a Casa 🏠' : 'Únete a la Familia 💛'}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {tab === 'login'
              ? 'Ingresa para ver y guardar momentos únicos'
              : 'Crea tu cuenta y empieza a compartir recuerdos'}
          </p>

          {/* Tab Toggle in header */}
          <div
            className="flex mx-auto mt-5 rounded-2xl overflow-hidden text-sm font-bold"
            style={{
              background: 'rgba(0,0,0,0.2)',
              width: 'fit-content',
              backdropFilter: 'blur(4px)'
            }}
          >
            <button
              type="button"
              onClick={() => switchTab('login')}
              className="px-5 py-2 transition cursor-pointer"
              style={{
                background: tab === 'login' ? 'rgba(255,255,255,0.3)' : 'transparent',
                color: 'white',
                borderRadius: '1rem'
              }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className="px-5 py-2 transition cursor-pointer"
              style={{
                background: tab === 'register' ? 'rgba(255,255,255,0.3)' : 'transparent',
                color: 'white',
                borderRadius: '1rem'
              }}
            >
              Registrarse
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="p-6 space-y-4">

          {/* Alert: error */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Alert: success */}
          {success && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ── Google sign-in ── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1" style={{ borderTop: '1px solid #e2e8f0' }} />
            <span className="px-3 text-xs" style={{ color: '#94a3b8', background: 'white', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              o con correo
            </span>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name (register only) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>
                  Nombre o Apodo Familiar
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Papá, Mamá, Abuelita…"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl transition"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid #f43f5e'}
                    onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@familia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl transition"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #f43f5e'}
                  onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>
                Contraseña {tab === 'register' && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(mín. 6 caracteres)</span>}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl transition"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #f43f5e'}
                  onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                />
              </div>
            </div>

            {/* Role selector (register only) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>¿Quién eres en la familia?</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl cursor-pointer"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                >
                  {['Papá', 'Mamá', 'Abuelita', 'Abuelito', 'Tía', 'Tío', 'Hermana', 'Hermano', 'Prima', 'Primo', 'Amigo de papá', 'Amiga de mamá', 'Familia'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition cursor-pointer mt-1"
              style={{
                background: loading
                  ? '#fb7185'
                  : 'linear-gradient(90deg, #e11d48, #f43f5e)',
                boxShadow: '0 4px 12px rgba(225,29,72,0.35)'
              }}
            >
              {loading
                ? '⏳ Procesando…'
                : tab === 'register' ? '🎉 Crear mi Cuenta' : '🔑 Iniciar Sesión'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
