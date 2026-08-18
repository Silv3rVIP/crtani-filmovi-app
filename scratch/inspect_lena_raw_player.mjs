async function inspectLena() {
  const url = 'https://crtanifilmovielena.com/movie/open-season/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  
  const playerSection = html.match(/<div id="player"[\s\S]*?<\/div>\s*<\/div>/i) || html.match(/<div id="player-frame"[\s\S]*?<\/div>/i);
  console.log('Player HTML snippet:');
  console.log(playerSection ? playerSection[0].slice(0, 1000) : 'Not found');
  
  // Search for any script containing ajax or iframe
  const allScripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  allScripts.forEach((s, idx) => {
    if (s.includes('player-frame') || s.includes('embed') || s.includes('strp2p') || s.includes('src')) {
      console.log(`Script ${idx}:`, s.slice(0, 400));
    }
  });
}

inspectLena();
