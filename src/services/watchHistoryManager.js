import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@crtani_watch_history';
let MEMORY_HISTORY = [];

export const watchHistoryManager = {
  // Load history into memory
  async init() {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const raw = await AsyncStorage.getItem(HISTORY_KEY).catch(() => null);
        if (raw) {
          MEMORY_HISTORY = JSON.parse(raw);
        }
      }
    } catch (e) {}
    return MEMORY_HISTORY;
  },

  // Get current continue watching items
  getHistory() {
    return MEMORY_HISTORY;
  },

  // Save or update watched movie position
  async saveProgress(movie, positionSeconds = 0, durationSeconds = 0) {
    if (!movie || (!movie.id && !movie.url)) return;
    
    const id = movie.id || movie.url;
    const progress = durationSeconds > 0 ? (positionSeconds / durationSeconds) : 0.5;

    const existingIndex = MEMORY_HISTORY.findIndex(item => (item.id === id || item.url === movie.url));
    const historyItem = {
      id,
      url: movie.url || `https://crtanifilmovielena.com/movie/${id}/`,
      title: movie.title || 'Crtani Film',
      poster: movie.poster || movie.backdrop || '',
      backdrop: movie.backdrop || movie.poster || '',
      positionSeconds,
      durationSeconds,
      progress: Math.min(Math.max(progress, 0.1), 0.95),
      lastWatchedAt: Date.now()
    };

    if (existingIndex >= 0) {
      MEMORY_HISTORY[existingIndex] = historyItem;
    } else {
      MEMORY_HISTORY.unshift(historyItem);
    }

    // Keep top 20 recent items
    MEMORY_HISTORY = MEMORY_HISTORY.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt).slice(0, 20);

    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(MEMORY_HISTORY)).catch(() => {});
      }
    } catch (e) {}
  },

  // Remove from history
  async removeFromHistory(movieId) {
    MEMORY_HISTORY = MEMORY_HISTORY.filter(item => item.id !== movieId && item.url !== movieId);
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(MEMORY_HISTORY));
    } catch (e) {}
  }
};

// Initialize immediately
watchHistoryManager.init();
