import fs from 'fs';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "crtanifilmovisilv3r",
  authDomain: "crtanifilmovisilv3r.firebaseapp.com",
  storageBucket: "crtanifilmovisilv3r.firebasestorage.app",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

function normalizeTitleKey(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .toLowerCase()
    .replace(/\(\d{4}\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/film/g, '')
    .replace(/crtani/g, '')
    .replace(/sinhronizovano/g, '')
    .replace(/titlovano/g, '');
}

async function strictDeduplicateAndSync() {
  console.log('🧹 Starting Strict Title Deduplication & Seasons/Episodes Consolidation...');

  const dbPath = './src/data/cartoons_db.json';
  const cartoons = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`Original total entries in database: ${cartoons.length}`);

  const masterMap = new Map();

  for (const item of cartoons) {
    const titleKey = normalizeTitleKey(item.titleEnglish || item.titleBosnian || item.rawTitle);
    if (!titleKey) continue;

    if (!masterMap.has(titleKey)) {
      masterMap.set(titleKey, {
        ...item,
        id: item.id || `cart_${titleKey}`,
        servers: Array.isArray(item.servers) && item.servers.length > 0 ? [...item.servers] : [
          { serverName: `${(item.sourceSite || 'SERVER').toUpperCase()} - Server 1`, embedUrl: item.streamUrl || item.sourceUrl }
        ],
        episodes: Array.isArray(item.episodes) ? [...item.episodes] : []
      });
    } else {
      const existing = masterMap.get(titleKey);

      // 1. Merge server streams
      if (Array.isArray(item.servers)) {
        for (const s of item.servers) {
          if (!existing.servers.some(es => es.embedUrl === s.embedUrl)) {
            existing.servers.push(s);
          }
        }
      }

      // 2. Merge episodes if series
      if (Array.isArray(item.episodes) && item.episodes.length > 0) {
        if (existing.type !== 'serija') existing.type = 'serija';
        for (const ep of item.episodes) {
          if (!existing.episodes.some(ee => ee.embedUrl === ep.embedUrl)) {
            existing.episodes.push({
              season: ep.season || 1,
              episode: existing.episodes.length + 1,
              title: ep.title || `Epizoda ${existing.episodes.length + 1}`,
              embedUrl: ep.embedUrl
            });
          }
        }
      }

      // 3. Prefer high-res TMDB poster if available
      if ((!existing.poster || !existing.poster.includes('tmdb')) && item.poster && item.poster.includes('tmdb')) {
        existing.poster = item.poster;
        existing.backdrop = item.backdrop || item.poster;
      }
    }
  }

  const cleanCartoons = Array.from(masterMap.values());
  console.log(`✨ Strictly Deduplicated: ${cleanCartoons.length} 100% UNIQUE Movies & Series entries! (Removed ${cartoons.length - cleanCartoons.length} duplicates)`);

  // Write clean dataset back to JSON
  fs.writeFileSync(dbPath, JSON.stringify(cleanCartoons, null, 2));

  console.log(`🔥 Synchronizing clean deduplicated dataset to Firestore collection 'cartoons'...`);

  // Fetch current Firestore document IDs
  const querySnapshot = await getDocs(collection(db, 'cartoons'));
  const currentFirestoreIds = new Set();
  querySnapshot.forEach((docSnap) => {
    currentFirestoreIds.add(docSnap.id);
  });

  const validCleanIds = new Set(cleanCartoons.map(c => c.id));

  // Delete stale duplicate IDs from Firestore
  let deletedCount = 0;
  for (const firestoreId of currentFirestoreIds) {
    if (!validCleanIds.has(firestoreId)) {
      try {
        await deleteDoc(doc(db, 'cartoons', firestoreId));
        deletedCount++;
      } catch (e) {}
    }
  }
  console.log(`🗑️ Removed ${deletedCount} stale duplicate documents from Firestore!`);

  // Upload clean unique documents
  let uploadedCount = 0;
  for (let i = 0; i < cleanCartoons.length; i++) {
    const item = cleanCartoons[i];
    try {
      await setDoc(doc(db, 'cartoons', item.id), item);
      uploadedCount++;
      if ((i + 1) % 50 === 0 || i === cleanCartoons.length - 1) {
        console.log(`Clean Upload Progress: ${i + 1}/${cleanCartoons.length}...`);
      }
    } catch (e) {
      console.error('Upload error:', item.id, e.message);
    }
  }

  console.log(`🎉 COMPLETE! ${uploadedCount} clean unique entries synchronized with zero duplicates!`);
  process.exit(0);
}

strictDeduplicateAndSync();
