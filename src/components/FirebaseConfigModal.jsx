import React, { useState } from 'react';
import { X, Flame, Check, Info } from 'lucide-react';
import { getFirebaseConfig } from '../firebase/config';

export const FirebaseConfigModal = ({ isOpen, onClose }) => {
  const current = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [authDomain, setAuthDomain] = useState(current.authDomain || '');
  const [projectId, setProjectId] = useState(current.projectId || '');
  const [storageBucket, setStorageBucket] = useState(current.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(current.messagingSenderId || '');
  const [appId, setAppId] = useState(current.appId || '');
  const [jsonInput, setJsonInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePasteJson = (e) => {
    const text = e.target.value;
    setJsonInput(text);
    try {
      const cleanJson = text
        .replace(/^\s*const\s+firebaseConfig\s*=\s*/, '')
        .replace(/;\s*$/, '')
        .trim();

      const parsed = JSON.parse(cleanJson);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
    } catch (err) {
      // noop
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    localStorage.setItem('family_memories_firebase_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('family_memories_firebase_config');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/80 z-10 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-amber-500 to-rose-500 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Flame className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Conectar con Firebase</h3>
              <p className="text-xs text-amber-100">Para guardar fotos y usuarios en la nube</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-600">
          
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-800">
            <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">¿Cómo obtener tus claves gratis?</p>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-700">
                <li>Entra a <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold">console.firebase.google.com</a> con tu cuenta Google.</li>
                <li>Crea un proyecto (ej: <em>RecuerdosFamilia</em>).</li>
                <li>Habilita <strong>Authentication</strong> (Google y Correo), <strong>Firestore Database</strong> y <strong>Cloud Storage</strong>.</li>
                <li>En <em>Configuración del proyecto</em> &gt; <em>Tus apps (Web &lt;/&gt;)</em>, copia el bloque <code className="bg-amber-100 px-1 rounded">firebaseConfig</code> y pégalo abajo.</li>
              </ol>
            </div>
          </div>

          {/* Quick Paste Block */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
              Pegar objeto de configuración rápido:
            </label>
            <textarea
              rows={2}
              placeholder="Pega aquí el 'const firebaseConfig = { ... }' que te da Firebase..."
              value={jsonInput}
              onChange={handlePasteJson}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono text-[11px]"
            />
          </div>

          {/* Manual inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">apiKey</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">projectId</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="mi-album-familiar"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">authDomain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="mi-album.firebaseapp.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">storageBucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="mi-album.appspot.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 font-bold">
              <Check className="w-4 h-4" />
              ¡Configuración guardada! Reiniciando aplicación...
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-500 hover:underline font-medium cursor-pointer"
            >
              Restablecer a modo Demo/Local
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition cursor-pointer"
              >
                Guardar y Conectar
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
};
