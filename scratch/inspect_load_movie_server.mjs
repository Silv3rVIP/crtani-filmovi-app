async function inspectScripts() {
  const url = 'https://crtanifilmovielena.com/movie/open-season/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  
  const scriptTags = [...html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  console.log('Script tags:', scriptTags);
  
  for (const s of scriptTags) {
    if (s.includes('player') || s.includes('custom') || s.includes('main') || s.includes('theme') || s.includes('app')) {
      const sRes = await fetch(s);
      const sText = await sRes.text();
      if (sText.includes('loadMovieServer')) {
        console.log('Found loadMovieServer in:', s);
        console.log(sText.slice(0, 1000));
      }
    }
  }
}

inspectScripts();
