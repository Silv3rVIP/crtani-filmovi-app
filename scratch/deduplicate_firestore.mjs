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
    .replace(/[^a-z0-9]/g, '')
    .replace(/film/g, '')
    .replace(/crtani/g, '')
    .replace(/sinhronizovano/g, '')
    .replace(/titlovano/g, '');
}

async function deduplicateAndSync() {
  console.log('🧹 Starting Complete Database & Firestore Deduplication...');

  const dbPath = './src/data/cartoons_db.json';
  const cartoons = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`Original cartoons count: ${cartoons.length}`);

  const uniqueMap = new Map();

  for (const item of cartoons) {
    const titleKey = normalizeTitleKey(item.titleEnglish || item.titleBosnian || item.rawTitle);
    if (!titleKey) continue;

    if (!uniqueMap.has(titleKey)) {
      uniqueMap.set(titleKey, {
        ...item,
        id: item.id || `cart_${titleKey}`,
        servers: Array.isArray(item.servers) ? [...item.servers] : [
          { serverName: 'Server 1 (Default)', embedUrl: item.streamUrl || item.sourceUrl }
        ]
      });
    } else {
      const existing = uniqueMap.get(titleKey);

      // Merge server streams
      if (Array.isArray(item.servers)) {
        for (const s of item.servers) {
          if (!existing.servers.some(es => es.embedUrl === s.embedUrl)) {
            existing.servers.push(s);
          }
        }
      }

      // Merge episodes if series
      if (Array.isArray(item.episodes) && item.episodes.length > 0) {
        if (!Array.isArray(existing.episodes)) existing.episodes = [];
        for (const ep of item.episodes) {
          if (!existing.episodes.some(ee => ee.embedUrl === ep.embedUrl)) {
            existing.episodes.push(ep);
          }
        }
      }

      // Keep best poster & backdrop
      if ((!existing.poster || !existing.poster.includes('tmdb')) && item.poster && item.poster.includes('tmdb')) {
        existing.poster = item.poster;
        existing.backdrop = item.backdrop || item.poster;
      }
    }
  }

  const cleanList = Array.from(uniqueMap.values());
  console.log(`✨ Deduplicated to ${cleanList.length} 100% UNIQUE cartoons! (Removed ${cartoons.length - cleanList.length} duplicates)`);

  // Write clean dataset back to JSON
  fs.writeFileSync(dbPath, JSON.stringify(cleanList, null, 2));

  console.log(`🔥 Synchronizing clean deduplicated dataset to Firestore collection 'cartoons'...`);

  // Fetch current Firestore IDs to delete stale duplicates
  const querySnapshot = await getDocs(collection(db, 'cartoons'));
  const currentFirestoreIds = new Set();
  querySnapshot.forEach((docSnap) => {
    currentFirestoreIds.add(docSnap.id);
  });

  const validCleanIds = new Set(cleanList.map(c => c.id));

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

  // Write back clean unique documents
  let uploadedCount = 0;
  for (let i = 0; i < cleanList.length; i++) {
    const item = cleanList[i];
    try {
      await setDoc(doc(db, 'cartoons', item.id), item);
      uploadedCount++;
      if ((i + 1) % 50 === 0 || i === cleanList.length - 1) {
        console.log(`Clean Upload Progress: ${i + 1}/${cleanList.length}...`);
      }
    } catch (e) {
      console.error('Upload error for item:', item.id, e.message);
    }
  }

  console.log(`🎉 COMPLETE! ${uploadedCount} clean unique cartoons synchronized with zero duplicates!`);
  process.exit(0);
}

deduplicateAndSync();
