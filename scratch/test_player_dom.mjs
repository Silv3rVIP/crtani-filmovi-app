async function testLenaHtml() {
  const url = 'https://crtanifilmovielena.com/movie/10-lives/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' } });
  const html = await res.text();
  
  console.log('HTML length:', html.length);
  
  // Find all iframe tags
  const iframes = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  console.log('Static iframes found:', iframes);
  
  // Find player divs or scripts
  const playerDivs = [...html.matchAll(/<div[^>]+id=["']([^"']*player[^"']*)["'][^>]*>/gi)].map(m => m[1]);
  console.log('Player divs:', playerDivs);
  
  // Find options or server buttons
  const serverOptions = [...html.matchAll(/class=["']([^"']*player[^"']*)["']/gi)].map(m => m[1]);
  console.log('Player classes:', serverOptions.slice(0, 10));
}

testLenaHtml();
