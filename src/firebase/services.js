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
  arrayRemove
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

// 2. Subir nuevo recuerdo con foto
export const createMemory = async ({ title, description, date, category, tags, imageFile, author }) => {
  let imageUrl = '';

  if (isFirebaseConfigured && storage && db) {
    try {
      const storageRef = ref(storage, `memories/${Date.now()}_${imageFile.name || 'foto.jpg'}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);

      const newDoc = {
        title,
        description,
        date,
        category: category || 'Momentos Especiales',
        tags: tags || [],
        imageUrl,
        author,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'memories'), newDoc);
      return { id: docRef.id, ...newDoc };
    } catch (error) {
      console.error('Error al subir a Firebase:', error);
      throw error;
    }
  }

  // Modo local (Convertir a Data URL para previsualizar localmente)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result;
      const newMemory = {
        id: 'mem-' + Date.now(),
        title,
        description,
        date,
        category: category || 'Momentos Especiales',
        tags: tags || [],
        imageUrl: base64Url,
        author,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };

      const existing = getLocalMemories();
      const updated = [newMemory, ...existing];
      saveLocalMemories(updated);
      resolve(newMemory);
    };
    reader.readAsDataURL(imageFile);
  });
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
