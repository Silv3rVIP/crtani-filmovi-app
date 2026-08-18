async function testNonceAjax() {
  const url = 'https://crtanifilmovielena.com/movie/open-season/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  
  // Extract doPlayer config
  const doPlayerMatch = html.match(/var\s+doPlayer\s*=\s*({[^}]+})/i);
  console.log('doPlayer:', doPlayerMatch ? doPlayerMatch[1] : null);
  
  if (doPlayerMatch) {
    const doPlayer = JSON.parse(doPlayerMatch[1]);
    console.log('Parsed doPlayer:', doPlayer);
    
    // Call AJAX directly
    const form = new URLSearchParams();
    form.append('action', 'movie');
    form.append('id', '572');
    form.append('type', 'movie_iframe_link');
    form.append('key', '0');
    form.append('nonce', doPlayer.nonce);
    
    const ajaxRes = await fetch(doPlayer.url, {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': url
      }
    });
    
    const text = await ajaxRes.text();
    console.log('AJAX result:', text);
  }
}

testNonceAjax();
