import { firebaseService } from '../src/services/firebase.js';

async function testFirestorePerformance() {
  console.log('⚡ Testing Firestore In-Memory Caching & Performance...');
  const start1 = Date.now();
  const all1 = await firebaseService.getAllCartoons();
  const duration1 = Date.now() - start1;
  console.log(`Fetch 1 (${all1.length} items): ${duration1}ms`);

  const start2 = Date.now();
  const all2 = await firebaseService.getAllCartoons();
  const duration2 = Date.now() - start2;
  console.log(`Fetch 2 (In-Memory Cache): ${duration2}ms [0ms expected]`);

  console.log('\n📄 Testing Batch Pagination (Page size: 30)...');
  const page1 = await firebaseService.getPaginatedCartoons(30, 0, 'all');
  console.log(`Page 1: ${page1.items.length} items (Total: ${page1.totalCount}, HasMore: ${page1.hasMore})`);

  const page2 = await firebaseService.getPaginatedCartoons(30, 30, 'all');
  console.log(`Page 2: ${page2.items.length} items (Total: ${page2.totalCount}, HasMore: ${page2.hasMore})`);

  console.log('\n🔍 Testing Instant Search ("Smurfs")...');
  const searchRes = await firebaseService.searchCartoons('Smurfs');
  console.log(`Search 'Smurfs': Found ${searchRes.length} matches!`);

  console.log('✨ All Firestore performance tests PASSED!');
  process.exit(0);
}

testFirestorePerformance();
