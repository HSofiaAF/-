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

const DEMO_USERS = {
  papa: {
    uid: 'demo-papa',
    name: 'Papá (Alex)',
    email: 'alex@familia.com',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    role: 'Papá'
  },
  mama: {
    uid: 'demo-mama',
    name: 'Mamá',
    email: 'mama@familia.com',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mama',
    role: 'Mamá'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('family_memories_auth_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const formatted = {
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
            role: user.email.includes('alex') ? 'Papá' : 'Familia'
          };
          setCurrentUser(formatted);
          localStorage.setItem('family_memories_auth_user', JSON.stringify(formatted));
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    }
    // Demo login
    const user = email.toLowerCase().includes('alex') || email.toLowerCase().includes('papa') 
      ? DEMO_USERS.papa 
      : { ...DEMO_USERS.mama, email, name: email.split('@')[0] };
    setCurrentUser(user);
    localStorage.setItem('family_memories_auth_user', JSON.stringify(user));
    return { user };
  };

  const registerWithEmail = async (name, email, password, role) => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, {
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      });
      return cred;
    }
    // Demo register
    const user = {
      uid: 'user-' + Date.now(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      role: role || 'Familia'
    };
    setCurrentUser(user);
    localStorage.setItem('family_memories_auth_user', JSON.stringify(user));
    return { user };
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      return signInWithPopup(auth, googleProvider);
    }
    // Demo fallback
    const user = DEMO_USERS.papa;
    setCurrentUser(user);
    localStorage.setItem('family_memories_auth_user', JSON.stringify(user));
    return { user };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    localStorage.removeItem('family_memories_auth_user');
  };

  const switchDemoUser = (type) => {
    const user = type === 'papa' ? DEMO_USERS.papa : DEMO_USERS.mama;
    setCurrentUser(user);
    localStorage.setItem('family_memories_auth_user', JSON.stringify(user));
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
