import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORY_CACHE = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours TTL

export const cacheManager = {
  // Set item in Memory + AsyncStorage (fail-safe)
  async set(key, value) {
    try {
      const payload = {
        data: value,
        timestamp: Date.now()
      };
      MEMORY_CACHE.set(key, payload);
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(`@crtani_cache_${key}`, JSON.stringify(payload)).catch(() => {});
      }
    } catch (e) {
      // Memory cache is already updated
    }
  },

  // Get item from Memory (0ms) or AsyncStorage
  async get(key) {
    // 1. Check in-memory Map (0ms)
    if (MEMORY_CACHE.has(key)) {
      const item = MEMORY_CACHE.get(key);
      if (Date.now() - item.timestamp < CACHE_TTL_MS) {
        // If details cache item has a raw website page URL or strp2p.site URL, invalidate and re-fetch fresh stream link
        if (key.startsWith('details_') && item.data && item.data.embedUrl && (item.data.embedUrl.includes('crtanifilmovielena.com') || item.data.embedUrl.includes('strp2p.site'))) {
          // Stale site URL or strp2p.site, skip memory cache
        } else {
          return item.data;
        }
      }
    }

    // 2. Check AsyncStorage fallback
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const raw = await AsyncStorage.getItem(`@crtani_cache_${key}`).catch(() => null);
        if (raw) {
          const item = JSON.parse(raw);
          if (Date.now() - item.timestamp < CACHE_TTL_MS) {
            if (key.startsWith('details_') && item.data && item.data.embedUrl && (item.data.embedUrl.includes('crtanifilmovielena.com') || item.data.embedUrl.includes('strp2p.site'))) {
              // Stale site URL or strp2p.site, skip
            } else {
              MEMORY_CACHE.set(key, item);
              return item.data;
            }
          }
        }
      }
    } catch (e) {
      // Memory fallback
    }

    return null;
  },

  // Pre-fetch movie details in the background so opening a movie is 0ms instant
  async prefetchMovieDetails(movies, fetchFn) {
    if (!Array.isArray(movies) || movies.length === 0) return;
    
    // Process prefetching in small background batches
    for (const m of movies.slice(0, 15)) {
      if (!m || (!m.url && !m.id)) continue;
      const cacheKey = `details_${m.id || m.url}`;
      
      const cached = await this.get(cacheKey);
      if (!cached && fetchFn) {
        try {
          const freshData = await fetchFn(m.url || `https://crtanifilmovielena.com/movie/${m.id}/`);
          if (freshData) {
            await this.set(cacheKey, freshData);
          }
        } catch (e) {
          // Silent background fail
        }
      }
    }
  }
};
