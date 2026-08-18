async function testAjaxPlayer() {
  const url = 'https://crtanifilmovielena.com/movie/open-season/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  
  // Extract post ID & nonce & do_player parameters
  const postIdMatch = html.match(/class=["'][^"']*post-(\d+)[^"']*["']/i) || html.match(/data-id=["'](\d+)["']/i);
  console.log('Post ID match:', postIdMatch ? postIdMatch[1] : null);
  
  // Find player options
  const playerOptions = [...html.matchAll(/class=["']do-player-option["'][^>]*data-type=["']([^"']+)["'][^>]*data-post=["']([^"']+)["'][^>]*data-nume=["']([^"']+)["']/gi)];
  console.log('Player options count:', playerOptions.length);
  playerOptions.forEach(opt => {
    console.log('Type:', opt[1], 'Post:', opt[2], 'Nume:', opt[3]);
  });
  
  // Test calling WordPress AJAX directly
  if (playerOptions.length > 0) {
    const opt = playerOptions[0];
    const ajaxUrl = 'https://crtanifilmovielena.com/wp-admin/admin-ajax.php';
    const form = new URLSearchParams();
    form.append('action', 'doo_player_ajax');
    form.append('post', opt[2]);
    form.append('nume', opt[3]);
    form.append('type', opt[1]);
    
    const ajaxRes = await fetch(ajaxUrl, {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': url
      }
    });
    
    const json = await ajaxRes.json();
    console.log('AJAX Response:', json);
  }
}

testAjaxPlayer();
