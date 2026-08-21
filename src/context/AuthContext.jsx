import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

// ──────────────────────────────────────────────────────────────────────────────
// Local User Database (persisted in localStorage when Firebase is not active)
// ──────────────────────────────────────────────────────────────────────────────
const LOCAL_USERS_KEY = 'hsofiaaf_users_db';
const LOCAL_SESSION_KEY = 'hsofiaaf_current_session';

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

// Pre-seeded demo family members (available immediately, no registration needed)
const DEMO_USERS = {
  'alex@familia.com': {
    uid: 'demo-papa',
    name: 'Papá (Alex)',
    email: 'alex@familia.com',
    password: 'familia2026',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    role: 'Papá',
    isDemo: true
  },
  'mama@familia.com': {
    uid: 'demo-mama',
    name: 'Mamá',
    email: 'mama@familia.com',
    password: 'familia2026',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mama',
    role: 'Mamá',
    isDemo: true
  }
};

// Initialize local DB with demo users if empty
const initLocalDB = () => {
  const existing = getLocalUsers();
  let changed = false;
  for (const [email, user] of Object.entries(DEMO_USERS)) {
    if (!existing[email]) {
      existing[email] = user;
      changed = true;
    }
  }
  if (changed) saveLocalUsers(existing);
};

initLocalDB();

// Translate Firebase error codes to Spanish
const translateFirebaseError = (code) => {
  const map = {
    'auth/user-not-found': 'No existe una cuenta con ese correo. ¿Te quieres registrar?',
    'auth/wrong-password': 'Contraseña incorrecta. Inténtalo de nuevo.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos. Verifica tus datos.',
    'auth/email-already-in-use': 'Ese correo ya está registrado. Inicia sesión en su lugar.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email': 'El formato del correo no es válido.',
    'auth/operation-not-allowed': 'Este método de inicio de sesión no está activado. Ve a la consola de Firebase → Authentication → Sign-in method y activa "Correo electrónico/contraseña".',
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase. Ve a Authentication → Authorized domains y agrega el dominio de tu web.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.',
    'auth/popup-blocked': 'El popup de Google fue bloqueado. Permite los popups para este sitio.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de completar el inicio de sesión.',
  };
  return map[code] || `Error de autenticación (${code}). Intenta de nuevo o recarga la página.`;
};

// ──────────────────────────────────────────────────────────────────────────────
// AuthProvider
// ──────────────────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Persist session helper
  const persistSession = (user) => {
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
    setCurrentUser(user);
  };

  // Format Firebase user → our shape
  const formatFirebaseUser = (firebaseUser) => ({
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    email: firebaseUser.email,
    avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firebaseUser.email)}`,
    role: firebaseUser.email?.toLowerCase().includes('alex') ? 'Papá' : 'Familia',
    isFirebaseUser: true
  });

  // Listen for Firebase auth changes
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const formatted = formatFirebaseUser(firebaseUser);
          persistSession(formatted);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login with email + password ──────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Firebase mode
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        return { user: formatFirebaseUser(cred.user) };
      } catch (err) {
        throw new Error(translateFirebaseError(err.code));
      }
    }

    // Local mode: check registered users + demo users
    const users = getLocalUsers();
    const stored = users[normalizedEmail];
    if (!stored) {
      throw new Error('No existe una cuenta con ese correo. ¿Te quieres registrar?');
    }
    if (stored.password !== password) {
      throw new Error('Contraseña incorrecta. Inténtalo de nuevo.');
    }
    const userProfile = { ...stored };
    delete userProfile.password; // never expose password in state
    persistSession(userProfile);
    return { user: userProfile };
  };

  // ── Register with email + password ──────────────────────────────────────
  const registerWithEmail = async (name, email, password, role) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Firebase mode
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(cred.user, {
          displayName: name.trim(),
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
        });
        const formatted = {
          ...formatFirebaseUser(cred.user),
          name: name.trim(),
          role: role || 'Familia'
        };
        persistSession(formatted);
        return { user: formatted };
      } catch (err) {
        throw new Error(translateFirebaseError(err.code));
      }
    }

    // Local mode: check if email already in use
    const users = getLocalUsers();
    if (users[normalizedEmail]) {
      throw new Error('Ese correo ya está registrado. Inicia sesión en su lugar.');
    }
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const newUser = {
      uid: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      password, // stored locally for re-login; not sent anywhere
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      role: role || 'Familia',
      createdAt: new Date().toISOString()
    };

    users[normalizedEmail] = newUser;
    saveLocalUsers(users);

    const userProfile = { ...newUser };
    delete userProfile.password;
    persistSession(userProfile);
    return { user: userProfile };
  };

  // ── Google Login ─────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const formatted = formatFirebaseUser(cred.user);
        persistSession(formatted);
        return { user: formatted };
      } catch (err) {
        if (err.code === 'auth/popup-closed-by-user') {
          throw new Error(translateFirebaseError(err.code));
        }
        throw new Error(translateFirebaseError(err.code));
      }
    }
    // Local fallback: use Papa demo
    const papaDemoProfile = { ...DEMO_USERS['alex@familia.com'] };
    delete papaDemoProfile.password;
    persistSession(papaDemoProfile);
    return { user: papaDemoProfile };
  };

  // ── One-tap switch for demo / quick family access ────────────────────────
  const switchDemoUser = (type) => {
    const key = type === 'papa' ? 'alex@familia.com' : 'mama@familia.com';
    const user = { ...DEMO_USERS[key] };
    delete user.password;
    persistSession(user);
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try { await signOut(auth); } catch { /* ignore */ }
    }
    persistSession(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      switchDemoUser,
      isFirebaseActive: isFirebaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
