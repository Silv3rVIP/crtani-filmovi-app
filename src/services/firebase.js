import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import cartoonsDbFallback from '../data/cartoons_db.json';

export const firebaseConfig = {
  projectId: "crtanifilmovisilv3r",
  authDomain: "crtanifilmovisilv3r.firebaseapp.com",
  storageBucket: "crtanifilmovisilv3r.firebasestorage.app",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

/**
 * Firebase Firestore database helper service
 */
export const firebaseService = {
  // Get all cartoons from Firestore
  async getAllCartoons() {
    try {
      const querySnapshot = await getDocs(collection(db, 'cartoons'));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      if (items.length > 0) return items;
    } catch (e) {
      console.warn('Firestore fetch error, using local fallback:', e);
    }
    return cartoonsDbFallback;
  },

  // Query cartoons by category type (dugi_crtani, kratki_crtani, serija)
  async getCartoonsByType(type) {
    if (!type || type === 'all') return this.getAllCartoons();
    try {
      const q = query(collection(db, 'cartoons'), where('type', '==', type));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      if (items.length > 0) return items;
    } catch (e) {
      console.warn('Firestore type query error, using local fallback:', e);
    }
    const all = await this.getAllCartoons();
    return all.filter(c => c.type === type);
  },

  // Query cartoons by dubbing type (sinhronizovano vs titlovano)
  async getCartoonsByDubbing(dubbingType) {
    if (!dubbingType || dubbingType === 'all') return this.getAllCartoons();
    try {
      const q = query(collection(db, 'cartoons'), where('dubbingType', '==', dubbingType));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      if (items.length > 0) return items;
    } catch (e) {
      console.warn('Firestore dubbing query error, using local fallback:', e);
    }
    const all = await this.getAllCartoons();
    return all.filter(c => c.dubbingType === dubbingType);
  },

  // Search cartoons by English or Bosnian title
  async searchCartoons(queryStr) {
    const all = await this.getAllCartoons();
    if (!queryStr) return all;
    const lower = queryStr.toLowerCase().trim();
    return all.filter(c =>
      (c.titleEnglish && c.titleEnglish.toLowerCase().includes(lower)) ||
      (c.titleBosnian && c.titleBosnian.toLowerCase().includes(lower)) ||
      (c.rawTitle && c.rawTitle.toLowerCase().includes(lower))
    );
  }
};
