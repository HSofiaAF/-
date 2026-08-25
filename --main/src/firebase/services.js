import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './config';
import { INITIAL_MEMORIES } from '../data/initialMemories';

const LOCAL_STORAGE_KEY = 'family_memories_data';

// Helper para obtener datos locales
const getLocalMemories = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEMORIES));
    return INITIAL_MEMORIES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MEMORIES;
  }
};

const saveLocalMemories = (memories) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memories));
};

const isCloudinaryConfigured = Boolean(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

const uploadToCloudinary = async (file) => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary no está configurado. Define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', `recuerdo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const response = await withTimeout(
    fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    }),
    60000,
    'subir la foto a Cloudinary'
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.secure_url || data.url;
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('No se pudo leer la imagen localmente.'));
  reader.readAsDataURL(file);
});

const withTimeout = (promise, timeoutMs, operation) => Promise.race([
  promise,
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`La operación "${operation}" tardó demasiado. Comprueba tu conexión o la configuración de almacenamiento.`)), timeoutMs);
  })
]);

// 1. Obtener todos los recuerdos
export const fetchMemories = async () => {
  if (!isFirebaseConfigured || !db) {
    return getLocalMemories();
  }

  try {
    const q = query(collection(db, 'memories'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getLocalMemories();
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.warn('Error fetching from Firestore, falling back to local:', error);
    return getLocalMemories();
  }
};

export const subscribeToPresence = (onUsersChanged) => {
  if (!isFirebaseConfigured || !db) return () => {};

  const presenceQuery = query(collection(db, 'presence'), orderBy('lastSeen', 'desc'));
  return onSnapshot(presenceQuery, (snapshot) => {
    const now = Date.now();
    const users = snapshot.docs
      .map((presenceDoc) => ({ id: presenceDoc.id, ...presenceDoc.data() }))
      .filter((user) => user.lastSeen?.toMillis && now - user.lastSeen.toMillis() < 120000);
    onUsersChanged(users);
  }, (error) => {
    console.warn('No se pudo escuchar la presencia familiar:', error);
  });
};

export const updatePresence = async (user) => {
  if (!isFirebaseConfigured || !db || !user?.uid) return;
  await setDoc(doc(db, 'presence', user.uid), {
    uid: user.uid,
    name: user.name || user.email?.split('@')[0] || 'Familia',
    email: user.email || '',
    avatar: user.avatar || '',
    lastSeen: serverTimestamp()
  }, { merge: true });
};

// 2. Subir nuevo recuerdo con foto
export const createMemory = async ({ title, description, date, category, tags, imageFile, author }) => {
  let imageUrl = '';
  const mediaType = imageFile.type.startsWith('video/') ? 'video' : 'image';

  try {
    if (isCloudinaryConfigured) {
      imageUrl = await uploadToCloudinary(imageFile);
    } else if (isFirebaseConfigured && storage && db) {
      const storageRef = ref(storage, `memories/${Date.now()}_${imageFile.name || (mediaType === 'video' ? 'video.mp4' : 'foto.jpg')}`);
      const snapshot = await withTimeout(uploadBytes(storageRef, imageFile), 45000, 'subir la foto');
      imageUrl = await withTimeout(getDownloadURL(snapshot.ref), 30000, 'obtener la foto publicada');
    }

    if (isFirebaseConfigured && db) {
      const newDoc = {
        title,
        description,
        date,
        category: category || 'Momentos Especiales',
        tags: tags || [],
        imageUrl,
        mediaType,
        author,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      const docRef = await withTimeout(addDoc(collection(db, 'memories'), newDoc), 30000, 'guardar el recuerdo');
      return { id: docRef.id, ...newDoc };
    }
  } catch (error) {
    console.error('[Storage upload]', {
      code: error?.code || 'client/timeout',
      message: error?.message || error,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      cloudinaryConfigured: isCloudinaryConfigured,
      storageConfigured: Boolean(storage),
      databaseConfigured: Boolean(db)
    });

    if (isFirebaseConfigured && db) {
      if (error?.code === 'permission-denied') {
        throw new Error('No tienes permiso para subir recuerdos. Pide al propietario que añada tu UID en authorizedUsers.');
      }
      throw error;
    }

    const base64Url = await readFileAsDataUrl(imageFile);
    const newMemory = {
      id: 'mem-' + Date.now(),
      title,
      description,
      date,
      category: category || 'Momentos Especiales',
      tags: tags || [],
      imageUrl: base64Url,
      mediaType,
      author,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    const existing = getLocalMemories();
    const updated = [newMemory, ...existing];
    saveLocalMemories(updated);
    return newMemory;
  }

  // Modo local (Convertir a Data URL para previsualizar localmente)
  const base64Url = await readFileAsDataUrl(imageFile);
  const newMemory = {
    id: 'mem-' + Date.now(),
    title,
    description,
    date,
    category: category || 'Momentos Especiales',
    tags: tags || [],
    imageUrl: base64Url,
    mediaType,
    author,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString()
  };

  const existing = getLocalMemories();
  const updated = [newMemory, ...existing];
  saveLocalMemories(updated);
  return newMemory;
};

// 3. Dar / Quitar Like (Corazón)
export const toggleLikeMemory = async (memoryId, userEmail) => {
  if (isFirebaseConfigured && db) {
    try {
      const memoryRef = doc(db, 'memories', memoryId);
      // Actualización en firestore
      const isLocal = memoryId.startsWith('mem-');
      if (!isLocal) {
        // En Firestore
        const mems = await fetchMemories();
        const current = mems.find(m => m.id === memoryId);
        const hasLiked = current?.likes?.includes(userEmail);
        await updateDoc(memoryRef, {
          likes: hasLiked ? arrayRemove(userEmail) : arrayUnion(userEmail)
        });
        return !hasLiked;
      }
    } catch (error) {
      console.error('Error toggling like in Firebase:', error);
      throw error;
    }
  }

  // Modo Local
  const existing = getLocalMemories();
  const index = existing.findIndex(m => m.id === memoryId);
  if (index !== -1) {
    const likes = existing[index].likes || [];
    const hasLiked = likes.includes(userEmail);
    if (hasLiked) {
      existing[index].likes = likes.filter(e => e !== userEmail);
    } else {
      existing[index].likes = [...likes, userEmail];
    }
    saveLocalMemories(existing);
    return !hasLiked;
  }
  return false;
};

// 4. Agregar comentario
export const addCommentToMemory = async (memoryId, comment) => {
  const newComment = {
    id: 'c-' + Date.now(),
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    text: comment.text,
    date: new Date().toISOString()
  };

  if (isFirebaseConfigured && db && !memoryId.startsWith('mem-')) {
    try {
      const memoryRef = doc(db, 'memories', memoryId);
      await updateDoc(memoryRef, {
        comments: arrayUnion(newComment)
      });
      return newComment;
    } catch (error) {
      console.error('Error adding comment to Firebase:', error);
      throw error;
    }
  }

  // Modo Local
  const existing = getLocalMemories();
  const index = existing.findIndex(m => m.id === memoryId);
  if (index !== -1) {
    if (!existing[index].comments) existing[index].comments = [];
    existing[index].comments.push(newComment);
    saveLocalMemories(existing);
  }
  return newComment;
};

// 5. Eliminar recuerdo
export const deleteMemory = async (memoryId, imageUrl) => {
  if (isFirebaseConfigured && db && !memoryId.startsWith('mem-')) {
    try {
      await deleteDoc(doc(db, 'memories', memoryId));
      if (storage && imageUrl && imageUrl.includes('firebasestorage')) {
        try {
          const storageRef = ref(storage, imageUrl);
          await deleteObject(storageRef);
        } catch (e) {
          console.warn('Could not delete storage file:', e);
        }
      }
      return true;
    } catch (error) {
      console.error('Error deleting memory from Firebase:', error);
      throw error;
    }
  }

  // Modo Local
  const existing = getLocalMemories();
  const filtered = existing.filter(m => m.id !== memoryId);
  saveLocalMemories(filtered);
  return true;
};
