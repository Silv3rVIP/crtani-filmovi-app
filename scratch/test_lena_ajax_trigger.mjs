async function testAjaxScript() {
  const url = 'https://crtanifilmovielena.com/movie/10-lives/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' } });
  const html = await res.text();
  
  // Find script tags related to player
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    if (s.includes('player') || s.includes('action') || s.includes('do_player')) {
      console.log('--- SCRIPT MATCH ---');
      console.log(s.slice(0, 500));
    }
  }
}

testAjaxScript();
