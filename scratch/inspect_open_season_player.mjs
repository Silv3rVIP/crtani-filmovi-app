async function inspectOpenSeason() {
  const url = 'https://crtanifilmovielena.com/movie/open-season/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' } });
  const html = await res.text();
  
  console.log('HTML size:', html.length);
  
  // Look for iframe, player, cover, or AJAX elements
  const frameCover = html.match(/id=["']frame-cover["'][^>]*>/gi);
  console.log('Frame cover:', frameCover);
  
  const playerFrame = html.match(/id=["']player-frame["'][^>]*>[\s\S]*?<\/div>/gi);
  console.log('Player frame:', playerFrame ? playerFrame[0].slice(0, 300) : null);
  
  // Look for nonce or AJAX keys
  const ajaxKeys = html.match(/var\s+movieType\s*=\s*['"]([^'"]+)['"]/i);
  console.log('movieType:', ajaxKeys ? ajaxKeys[1] : null);
}

inspectOpenSeason();
