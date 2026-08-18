import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const cartoons = JSON.parse(fs.readFileSync('./src/data/cartoons_db.json', 'utf8'));

const firebaseConfig = {
  projectId: "crtanifilmovisilv3r",
  authDomain: "crtanifilmovisilv3r.firebaseapp.com",
  storageBucket: "crtanifilmovisilv3r.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadViaSDK() {
  console.log(`🚀 Uploading ${cartoons.length} cartoons via Firebase SDK to project: "${firebaseConfig.projectId}"...`);
  let success = 0;
  let failed = 0;

  for (let i = 0; i < cartoons.length; i++) {
    const item = cartoons[i];
    const docRef = doc(db, 'cartoons', item.id);
    try {
      await setDoc(docRef, item);
      success++;
      if ((i + 1) % 10 === 0 || i === cartoons.length - 1) {
        console.log(`Uploaded ${i + 1}/${cartoons.length} items to Firestore...`);
      }
    } catch (e) {
      if (failed === 0) {
        console.error('Firestore SDK error:', e.message);
      }
      failed++;
    }
  }

  console.log(`✨ SDK Upload Finish: ${success} uploaded successfully, ${failed} failed!`);
  process.exit(0);
}

uploadViaSDK();
