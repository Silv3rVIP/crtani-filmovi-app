async function testStrp2pPlayer() {
  const lenaUrl = 'https://crtanifilmovielena.com/movie/open-season/';
  const res = await fetch(lenaUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  
  // Find player url or iframe
  console.log('Lena HTML length:', html.length);
}

testStrp2pPlayer();
