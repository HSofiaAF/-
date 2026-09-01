import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const getFirebaseConfig = () => {
  const saved = localStorage.getItem('family_memories_firebase_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) return parsed;
    } catch (e) {
      console.error('Error al cargar config guardada', e);
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };
};

export const currentConfig = getFirebaseConfig();
export const isFirebaseConfigured = Boolean(
  currentConfig.apiKey &&
  currentConfig.projectId &&
  currentConfig.apiKey !== 'TU_API_KEY' &&
  !currentConfig.apiKey.includes('TU_')
);

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(currentConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase no se pudo inicializar con las claves actuales. Usando modo de demostración/local.', error);
  }
}

export { app, auth, db, storage, googleProvider };
