import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@crtani_watch_history_v2';
let MEMORY_HISTORY = [];
let listeners = [];

export const watchHistoryManager = {
  // Subscribe to changes
  subscribe(listener) {
    if (typeof listener === 'function') {
      listeners.push(listener);
      // Immediately fire with current history
      try { listener([...MEMORY_HISTORY]); } catch (e) {}
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    }
    return () => {};
  },

  notify() {
    listeners.forEach(l => {
      try { l([...MEMORY_HISTORY]); } catch (e) {}
    });
  },

  // Load history from AsyncStorage into memory
  async init() {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          MEMORY_HISTORY = parsed;
          this.notify();
        }
      }
    } catch (e) {
      console.warn('History load error:', e);
    }
    return MEMORY_HISTORY;
  },

  // Get current continue watching items
  getHistory() {
    return [...MEMORY_HISTORY];
  },

  // Save or update watched movie position
  async saveProgress(movie, positionSeconds = 0, durationSeconds = 0, episodeData = null) {
    if (!movie) return;

    const id = movie.id || movie.url || movie.streamUrl || `m_${Date.now()}`;
    const displayTitle = movie.title || movie.titleBosnian || movie.titleEnglish || movie.rawTitle || 'Crtani Film';
    const displayPoster = movie.poster || movie.backdrop || 'https://image.tmdb.org/t/p/w342/8o6lkhL32xQJeB52IIG1us5BVey.jpg';
    const progress = durationSeconds > 0 ? (positionSeconds / durationSeconds) : 0.45;

    // Build rich, self-contained history item so DetailScreen & Player have 100% data
    const historyItem = {
      ...movie,
      id,
      title: displayTitle,
      titleBosnian: movie.titleBosnian || displayTitle,
      titleEnglish: movie.titleEnglish || displayTitle,
      poster: displayPoster,
      backdrop: movie.backdrop || displayPoster,
      year: movie.year || 2024,
      imdbRating: movie.imdbRating || 7.8,
      type: movie.type || 'dugi_crtani',
      dubbingType: movie.dubbingType || 'sinhronizovano',
      servers: movie.servers || [],
      episodes: movie.episodes || [],
      selectedEpisode: episodeData,
      positionSeconds,
      durationSeconds,
      progress: Math.min(Math.max(progress, 0.15), 0.95),
      lastWatchedAt: Date.now()
    };

    // Remove any previous instance of this movie to avoid duplicates
    MEMORY_HISTORY = MEMORY_HISTORY.filter(item => item.id !== id && item.title !== displayTitle);

    // Put at the very beginning (most recently watched)
    MEMORY_HISTORY.unshift(historyItem);

    // Keep top 30
    MEMORY_HISTORY = MEMORY_HISTORY.slice(0, 30);
    this.notify();

    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(MEMORY_HISTORY));
    } catch (e) {
      console.warn('AsyncStorage save error:', e);
    }
  },

  // Remove from history
  async removeFromHistory(movieId) {
    MEMORY_HISTORY = MEMORY_HISTORY.filter(item => item.id !== movieId);
    this.notify();
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(MEMORY_HISTORY));
    } catch (e) {}
  },

  // Clear all
  async clearHistory() {
    MEMORY_HISTORY = [];
    this.notify();
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {}
  }
};

// Initialize immediately
watchHistoryManager.init();
