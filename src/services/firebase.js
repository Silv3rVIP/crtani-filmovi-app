import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore/lite';
import cartoonsDbFallback from '../data/cartoons_db.json';

export const firebaseConfig = {
  projectId: "crtanifilmovisilv3r",
  authDomain: "crtanifilmovisilv3r.firebaseapp.com",
  storageBucket: "crtanifilmovisilv3r.firebasestorage.app",
};

// Initialize Firebase App & Firestore
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// In-memory fast cache to make app load in 0 milliseconds
let memoryCache = {
  allCartoons: null,
  categories: null,
  timestamp: 0
};

export const firebaseService = {
  /**
   * Get all cartoons (uses fast in-memory cache first, then Firestore)
   */
  async getAllCartoons() {
    const now = Date.now();
    if (memoryCache.allCartoons && (now - memoryCache.timestamp < 300000)) { // 5 min cache
      return memoryCache.allCartoons;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'cartoons'));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      if (items.length > 0) {
        memoryCache.allCartoons = items;
        memoryCache.timestamp = now;
        return items;
      }
    } catch (e) {
      console.warn('Firestore fetch error, using local fallback:', e);
    }
    return cartoonsDbFallback;
  },

  /**
   * Fetch home page categorized rows (Popular, Serije, Sinhronizovano, Stari Crtani)
   */
  async getHomePageCategories() {
    const all = await this.getAllCartoons();

    const featured = all.filter(c => c.imdbRating >= 8.5).slice(0, 8);
    const popularMovies = all.filter(c => c.type === 'dugi_crtani').slice(0, 15);
    const cartoonSeries = all.filter(c => c.type === 'serija' || c.episodes?.length > 0).slice(0, 15);
    const exYuClassics = all.filter(c => c.sourceSite === 'staricrtaci').slice(0, 15);
    const dubbedCartoons = all.filter(c => c.dubbingType === 'sinhronizovano').slice(0, 15);

    return {
      featured: featured.length > 0 ? featured : all.slice(0, 5),
      popularMovies,
      cartoonSeries,
      exYuClassics,
      dubbedCartoons,
      all
    };
  },

  /**
   * Fetch paginated batch of cartoons for smooth infinite scroll grid
   */
  async getPaginatedCartoons(pageSize = 30, offsetIndex = 0, filterType = 'all') {
    const all = await this.getAllCartoons();
    let filtered = all;

    if (filterType === 'dugi_crtani' || filterType === 'serija' || filterType === 'kratki_crtani') {
      filtered = all.filter(c => c.type === filterType);
    } else if (filterType === 'sinhronizovano' || filterType === 'titlovano') {
      filtered = all.filter(c => c.dubbingType === filterType);
    } else if (filterType === 'staricrtaci' || filterType === 'crtanifilmovielena') {
      filtered = all.filter(c => c.sourceSite === filterType);
    }

    const items = filtered.slice(offsetIndex, offsetIndex + pageSize);
    const hasMore = offsetIndex + pageSize < filtered.length;

    return {
      items,
      hasMore,
      totalCount: filtered.length
    };
  },

  /**
   * Instant search across English title, Bosnian title, year & genres
   */
  async searchCartoons(queryStr) {
    const all = await this.getAllCartoons();
    if (!queryStr || queryStr.trim().length === 0) return all;

    const lower = queryStr.toLowerCase().trim();
    return all.filter(c =>
      (c.titleEnglish && c.titleEnglish.toLowerCase().includes(lower)) ||
      (c.titleBosnian && c.titleBosnian.toLowerCase().includes(lower)) ||
      (c.rawTitle && c.rawTitle.toLowerCase().includes(lower)) ||
      (c.genres && c.genres.some(g => g.toLowerCase().includes(lower))) ||
      (c.year && String(c.year).includes(lower))
    );
  }
};
