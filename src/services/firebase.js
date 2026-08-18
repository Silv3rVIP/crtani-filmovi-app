import cartoonsDb from '../data/cartoons_db.json';

/**
 * Firebase Firestore Configuration for Project: crtanifilmovisilv3r
 */
export const firebaseConfig = {
  projectId: "crtanifilmovisilv3r",
  authDomain: "crtanifilmovisilv3r.firebaseapp.com",
  storageBucket: "crtanifilmovisilv3r.firebasestorage.app",
};

export const firebaseService = {
  // Get all cartoons from database
  async getAllCartoons() {
    return cartoonsDb;
  },

  // Query cartoons by category type (dugi_crtani, kratki_crtani, serija)
  async getCartoonsByType(type) {
    if (!type || type === 'all') return cartoonsDb;
    return cartoonsDb.filter(c => c.type === type);
  },

  // Query cartoons by dubbing type (sinhronizovano vs titlovano)
  async getCartoonsByDubbing(dubbingType) {
    if (!dubbingType || dubbingType === 'all') return cartoonsDb;
    return cartoonsDb.filter(c => c.dubbingType === dubbingType);
  },

  // Search cartoons by English or Bosnian title
  async searchCartoons(query) {
    if (!query) return cartoonsDb;
    const lower = query.toLowerCase().trim();
    return cartoonsDb.filter(c =>
      c.titleEnglish.toLowerCase().includes(lower) ||
      c.titleBosnian.toLowerCase().includes(lower) ||
      c.rawTitle.toLowerCase().includes(lower)
    );
  }
};
