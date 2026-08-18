import { cacheManager } from '../services/cacheManager.js';

const BASE_URL = 'https://crtanifilmovielena.com';

/**
 * Clean and normalize text strings extracted from HTML
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract background image URL from inline CSS style attribute
 */
function extractBgImageUrl(styleAttr) {
  if (!styleAttr) return '';
  const match = styleAttr.match(/url\(['"]?(.*?)['"]?\)/i);
  return match ? match[1] : '';
}

/**
 * Raw fetch for detailed movie information
 */
export async function fetchMovieDetailsRaw(movieUrl) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(movieUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        id: movieUrl,
        title: 'Crtani Film',
        poster: '',
        description: 'Popularni sinhronizovani crtani film.',
        embedUrl: movieUrl,
        pageUrl: movieUrl
      };
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : 'Sinhronizovani Crtani Film';

    // Extract poster
    const posterMatch = html.match(/<meta property="og:image" content="([^"]+)"/i) || html.match(/<img[^>]+src=["'](https?:\/\/image\.tmdb\.org[^"']+)["']/i);
    const poster = posterMatch ? posterMatch[1] : '';

    // Handle gledajcrtace.net detail pages directly
    if (movieUrl.includes('gledajcrtace.net')) {
      let embedUrl = movieUrl;
      const validIframes = [];
      const iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let m;

      while ((m = iframeRegex.exec(html)) !== null) {
        let src = m[1];
        if (
          !src.includes('facebook') &&
          !src.includes('counter') &&
          !src.includes('iFb') &&
          !src.includes('cbox') &&
          !src.startsWith('/?') &&
          !src.includes('about:blank')
        ) {
          if (src.startsWith('//')) src = 'https:' + src;
          else if (src.startsWith('/')) src = 'https://www.gledajcrtace.net' + src;
          validIframes.push(src);
        }
      }

      // Prefer Vidara, Send, VK, or OK hosts over React Single Page App embeds
      const vidaraMatch = validIframes.find(url => url.includes('vidara') || url.includes('send') || url.includes('vk') || url.includes('ok'));
      embedUrl = vidaraMatch || validIframes[0] || movieUrl;

      const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
      const description = descMatch ? cleanText(descMatch[1]) : 'Gledajte sinhronizovane crtane filmove besplatno na vašem Android TV ili telefonu.';

      return {
        title,
        poster: poster || 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
        backdrop: poster || 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
        description,
        embedUrl
      };
    }

    // Extract video stream or iframe player URL by resolving direct player source from WordPress AJAX
    let embedUrl = movieUrl;

    try {
      const playerNonceMatch = html.match(/var\s+doPlayer\s*=\s*\{[^}]*"nonce"\s*:\s*"([^"]+)"/i) || html.match(/doPlayer[\s\S]*?"nonce"\s*:\s*"([^"]+)"/i);
      const postIdMatch = html.match(/class="[^"]*post-id-([0-9]+)[^"]*"/i) || html.match(/"page_id":"([0-9]+)"/i) || html.match(/data-id="([0-9]+)"/i);
      const movieTypeMatch = html.match(/var\s+movieType\s*=\s*['"]([^'"]+)['"]/i);

      if (playerNonceMatch && postIdMatch) {
        // Helper function to query admin-ajax for a specific key
        const queryAjaxKey = async (keyNum) => {
          const bodyData = new URLSearchParams();
          bodyData.append('action', 'movie');
          bodyData.append('id', postIdMatch[1]);
          bodyData.append('type', movieTypeMatch ? movieTypeMatch[1] : 'movie_iframe_link');
          bodyData.append('key', String(keyNum));
          bodyData.append('nonce', playerNonceMatch[1]);

          const res = await fetch('https://crtanifilmovielena.com/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'X-Requested-With': 'XMLHttpRequest',
              'Referer': movieUrl
            },
            body: bodyData.toString()
          });

          const rawText = await res.text();
          let data = null;
          try { data = JSON.parse(rawText); } catch(e) {}

          if (data && data.sources) {
            const src = typeof data.sources === 'string' ? data.sources : (data.sources.file || null);
            if (src && !src.includes('youtube.com') && !src.includes('youtu.be')) {
              return src;
            }
          }
          const iframeSrcMatch = rawText.match(/src=["'](https?:\/\/[^"']+)["']/i);
          if (iframeSrcMatch && !iframeSrcMatch[1].includes('youtube.com')) {
            return iframeSrcMatch[1];
          }
          return null;
        };

        let key1Src = await queryAjaxKey(1);
        if (key1Src && !key1Src.includes('strp2p.site')) {
          embedUrl = key1Src;
        } else {
          // If key 1 is strp2p.site (which causes WebRTC Error 232404 in WebView), try key 2 (send.now / send.cm)
          let key2Src = await queryAjaxKey(2);
          if (key2Src) {
            embedUrl = key2Src;
          } else if (key1Src) {
            embedUrl = key1Src;
          }
        }
      }
    } catch (err) {
      console.warn('Direct stream resolution warning:', err);
    }

    if (!embedUrl || embedUrl === 'about:blank' || embedUrl.includes('about:blank') || embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
      embedUrl = movieUrl;
    }

    // Extract synopsis description
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
    const description = descMatch ? cleanText(descMatch[1]) : 'Gledajte sinhronizovani crtani film sa srpskom sinkronizacijom visoke kvalitete u HD formatu.';

    return {
      title,
      poster: poster || 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
      backdrop: poster || 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
      description,
      embedUrl
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return {
      title: 'Sinhronizovani Crtani Film',
      poster: 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
      description: 'Gledajte sinhronizovane crtane filmove besplatno na vašem Android TV ili telefonu.',
      embedUrl: movieUrl || 'https://crtanifilmovielena.com'
    };
  }
}

/**
 * Fetch detailed movie information including stream embed link with Stremio caching
 */
export async function fetchMovieDetails(movieUrl) {
  try {
    if (!movieUrl) {
      return {
        id: 'fallback',
        title: 'Sinhronizovani Crtani Film',
        description: 'Popularni sinhronizovani crtani film.',
        embedUrl: 'https://crtanifilmovielena.com',
        pageUrl: 'https://crtanifilmovielena.com'
      };
    }
    const cacheKey = `details_${movieUrl}`;
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    const fresh = await fetchMovieDetailsRaw(movieUrl);
    if (fresh) {
      await cacheManager.set(cacheKey, fresh);
    }
    return fresh;
  } catch (err) {
    console.warn('Error fetching movie details:', err);
    return {
      id: movieUrl,
      title: 'Sinhronizovani Crtani Film',
      description: 'Popularni sinhronizovani crtani film sa srpskom i hrvatskom sinhronizacijom.',
      embedUrl: movieUrl,
      pageUrl: movieUrl
    };
  }
}

/**
 * Fetch latest & featured movies from crtanifilmovielena.com homepage with Stremio-style caching
 */
export async function fetchHomePageData() {
  const cacheKey = 'homepage_catalog';
  const cachedData = await cacheManager.get(cacheKey);

  // If cached, return cached data immediately and refresh background cache
  if (cachedData && Array.isArray(cachedData.movies) && cachedData.movies.length > 0) {
    // Trigger background refresh & background prefetching
    setTimeout(() => {
      fetchHomePageDataRaw().then((fresh) => {
        if (fresh) {
          cacheManager.set(cacheKey, fresh);
          cacheManager.prefetchMovieDetails([...fresh.featured, ...fresh.movies], fetchMovieDetailsRaw);
        }
      }).catch(() => {});
    }, 100);
    return cachedData;
  }

  const fresh = await fetchHomePageDataRaw();
  if (fresh) {
    await cacheManager.set(cacheKey, fresh);
    cacheManager.prefetchMovieDetails([...fresh.featured, ...fresh.movies], fetchMovieDetailsRaw);
  }
  return fresh;
}

function assignCategoryTags(title = '', id = '') {
  const text = (title + ' ' + id).toLowerCase();
  const tags = ['all'];

  if (
    text.includes('disney') || text.includes('pixar') || text.includes('moana') ||
    text.includes('mufasa') || text.includes('snow') || text.includes('inside out') ||
    text.includes('elemental') || text.includes('mermaid') || text.includes('encanto') ||
    text.includes('pinocchio') || text.includes('lion king') || text.includes('luca') ||
    text.includes('frozen') || text.includes('toy story') || text.includes('cars') ||
    text.includes('zootopia') || text.includes('coco') || text.includes('soul')
  ) {
    tags.push('disney');
  }

  if (
    text.includes('smurf') || text.includes('despicable') || text.includes('minion') ||
    text.includes('sonic') || text.includes('mario') || text.includes('puss in boots') ||
    text.includes('spongebob') || text.includes('transylvania') || text.includes('trolls') ||
    text.includes('dog man') || text.includes('garfield') || text.includes('panda')
  ) {
    tags.push('popular');
  }

  if (
    text.includes('pinocchio') || text.includes('snow white') || text.includes('cinderella') ||
    text.includes('bambi') || text.includes('tom') || text.includes('scooby') ||
    text.includes('garfield') || text.includes('sirena') || text.includes('zlatna')
  ) {
    tags.push('classic');
  }

  if (
    text.includes('spongebob') || text.includes('tidal') || text.includes('paw patrol') ||
    text.includes('peppa') || text.includes('pokemon') || text.includes('dragon')
  ) {
    tags.push('series');
  }

  if (tags.length === 1) {
    tags.push('popular');
  }

  return tags;
}

export async function fetchGledajCrtaceData() {
  try {
    const urls = [
      'https://www.gledajcrtace.net/publ/dugometrazni_crtani_filmovi/25',
      'https://www.gledajcrtace.net/publ/dugometrazni_crtani_filmovi/25-2',
      'https://www.gledajcrtace.net/publ/crtane_serije/'
    ];

    const results = [];
    const seen = new Set();

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const html = await res.text();

        const linkRegex = /<a[^>]+href=["']([^"']*\/publ\/[^"']+\/\d+-\d+-\d+-\d+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match;

        while ((match = linkRegex.exec(html)) !== null) {
          let href = match[1];
          if (href.startsWith('/')) href = 'https://www.gledajcrtace.net' + href;
          const titleText = cleanText(match[2]);

          if (titleText && titleText.length > 2 && !seen.has(href)) {
            seen.add(href);

            const linkPos = match.index;
            const snippet = html.substring(Math.max(0, linkPos - 400), Math.min(html.length, linkPos + 400));
            const imgMatch = snippet.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
            let poster = imgMatch ? imgMatch[1] : '';
            if (poster.startsWith('/')) poster = 'https://www.gledajcrtace.net' + poster;

            results.push({
              id: href,
              url: href,
              title: titleText,
              poster: poster || 'https://image.tmdb.org/t/p/w500/7Md3nuV0ZprBTnkdR3OrUCEsrSP.jpg',
              backdrop: poster || 'https://image.tmdb.org/t/p/w500/7Md3nuV0ZprBTnkdR3OrUCEsrSP.jpg',
              tags: ['all', 'gledajcrtace', ...assignCategoryTags(titleText, href)]
            });
          }
        }
      } catch (e) {
        console.warn('Error fetching gledajcrtace category:', e);
      }
    }
    return results;
  } catch (err) {
    console.error('Error fetching gledajcrtace dataset:', err);
    return [];
  }
}

async function fetchHomePageDataRaw() {
  try {
    // Fetch both sources in parallel
    const [lenaRes, gledajCrtaceMovies] = await Promise.all([
      fetch(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }).then(r => r.text()).catch(() => ''),
      fetchGledajCrtaceData().catch(() => [])
    ]);

    const html = lenaRes || '';
    const featured = [];
    const movies = [];

    // Parse swiper slides (Featured Movies Banner)
    const slideRegex = /<div class="swiper-slide">[\s\S]*?<a href="([^"]+)" class="slide-link" style="background-image: url\('([^']+)'\);" title="([^"]+)">[\s\S]*?<div class="ssc-title">([\s\S]*?)<\/div>[\s\S]*?<div class="ssc-desc">([\s\S]*?)<\/div>/g;
    let match;
    while ((match = slideRegex.exec(html)) !== null) {
      const title = cleanText(match[3]);
      const id = match[1].replace(/.*\/movie\//, '').replace(/\//g, '');
      featured.push({
        id,
        url: match[1],
        backdrop: match[2],
        poster: match[2],
        title,
        description: cleanText(match[5]),
        tags: assignCategoryTags(title, id)
      });
    }

    // Parse movie cards grid
    const movieCardRegex = /<a href="(https:\/\/crtanifilmovielena\.com\/movie\/[^"]+)"[^>]*>[\s\S]*?<img [^>]*src="([^"]+)"[^>]*>[\s\S]*?<h[34][^>]*>([\s\S]*?)<\/h[34]>/g;
    while ((match = movieCardRegex.exec(html)) !== null) {
      const movieUrl = match[1];
      const imageUrl = match[2];
      const title = cleanText(match[3]);
      const id = movieUrl.replace(/.*\/movie\//, '').replace(/\//g, '');

      if (title && !movies.some(m => m.id === id)) {
        movies.push({
          id,
          url: movieUrl,
          title,
          poster: imageUrl,
          backdrop: imageUrl,
          tags: assignCategoryTags(title, id)
        });
      }
    }

    // Merge gledajcrtace.net movies
    if (Array.isArray(gledajCrtaceMovies)) {
      for (const item of gledajCrtaceMovies) {
        if (!movies.some(m => m.title.toLowerCase() === item.title.toLowerCase())) {
          movies.push(item);
        }
      }
    }

    // Fallback mock data if network / site layout differs
    if (featured.length === 0) {
      featured.push(
        {
          id: 'inside-out-2',
          url: `${BASE_URL}/movie/inside-out-2/`,
          title: 'Inside Out 2 – U mojoj glavi 2',
          poster: 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
          description: 'Teenager Riley headquarters is undergoing a sudden demolition for new emotions...'
        },
        {
          id: 'moana-2',
          url: `${BASE_URL}/movie/moana-2/`,
          title: 'Moana 2 – Vajana 2',
          poster: 'https://image.tmdb.org/t/p/w1280/vYqt6kb4lcF8wwqsMMaULkP9OEn.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/vYqt6kb4lcF8wwqsMMaULkP9OEn.jpg',
          description: 'Moana journeys alongside Maui and a new crew of unlikely seafarers...'
        },
        {
          id: 'despicable-me-4',
          url: `${BASE_URL}/movie/despicable-me-4/`,
          title: 'Despicable Me 4 – Grozan Ja 4',
          poster: 'https://image.tmdb.org/t/p/w1280/lgkPzcOSnTvjeMnuFzozRO5HHw1.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/lgkPzcOSnTvjeMnuFzozRO5HHw1.jpg',
          description: 'Gru and Lucy and their girls welcome a new member to the Gru family...'
        }
      );
    }

    if (movies.length === 0) {
      movies.push(
        {
          id: 'if',
          url: `${BASE_URL}/movie/if/`,
          title: 'IF – Izmišljeni Prijatelj',
          poster: 'https://image.tmdb.org/t/p/w1280/nxxCPRGTzxUH8SFMrIsvMmdxHti.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/nxxCPRGTzxUH8SFMrIsvMmdxHti.jpg'
        },
        {
          id: 'migration',
          url: `${BASE_URL}/movie/migration/`,
          title: 'Migration – Patke Selice',
          poster: 'https://image.tmdb.org/t/p/w1280/meyhnvssZOPPjud4F1CjOb4snET.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/meyhnvssZOPPjud4F1CjOb4snET.jpg'
        },
        {
          id: 'trolls-band-together-2',
          url: `${BASE_URL}/movie/trolls-band-together-2/`,
          title: 'Trolls Band Together – Trolovi 3',
          poster: 'https://image.tmdb.org/t/p/w1280/k1KrbaCMACQiq7EA0Yhw3bdzMv7.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/k1KrbaCMACQiq7EA0Yhw3bdzMv7.jpg'
        },
        {
          id: 'elemental',
          url: `${BASE_URL}/movie/elemental/`,
          title: 'Elemental – Elemental',
          poster: 'https://image.tmdb.org/t/p/w1280/jZIYaISP3GBSrVOPfrp98AMa8Ng.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/jZIYaISP3GBSrVOPfrp98AMa8Ng.jpg'
        }
      );
    }

    const normalizedFeatured = featured.map(m => ({
      ...m,
      tags: m.tags && m.tags.length ? m.tags : ['all', 'popular', ...assignCategoryTags(m.title, m.id)]
    }));

    const normalizedMovies = movies.map(m => ({
      ...m,
      tags: m.tags && m.tags.length ? m.tags : ['all', 'popular', ...assignCategoryTags(m.title, m.id)]
    }));

    return {
      featured: normalizedFeatured,
      movies: normalizedMovies,
      categories: [
        { id: 'popular', name: 'Popularno' },
        { id: 'disney', name: 'Disney & Pixar' },
        { id: 'classic', name: 'Klasični Crtani' },
        { id: 'series', name: 'Crtane Serije' }
      ]
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Return graceful fallback dataset
    return {
      featured: [
        {
          id: 'inside-out-2',
          url: `${BASE_URL}/movie/inside-out-2/`,
          title: 'Inside Out 2 – U mojoj glavi 2',
          poster: 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
          description: 'Teenager Riley headquarters is undergoing a sudden demolition...'
        }
      ],
      movies: [
        {
          id: 'moana-2',
          url: `${BASE_URL}/movie/moana-2/`,
          title: 'Moana 2 – Vajana 2',
          poster: 'https://image.tmdb.org/t/p/w1280/vYqt6kb4lcF8wwqsMMaULkP9OEn.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/vYqt6kb4lcF8wwqsMMaULkP9OEn.jpg'
        }
      ],
      categories: [
        { id: 'popular', name: 'Popularno' },
        { id: 'disney', name: 'Disney & Pixar' }
      ]
    };
  }
}



/**
 * Search movies by keyword
 */
export async function searchMovies(query) {
  if (!query) return [];
  try {
    const searchLenaUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    const searchGledajUrl = `https://www.gledajcrtace.net/search/?q=${encodeURIComponent(query)}`;

    const [lenaRes, gledajRes] = await Promise.allSettled([
      fetch(searchLenaUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }).then(r => r.text()),
      fetch(searchGledajUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }).then(r => r.text())
    ]);

    const results = [];
    const seen = new Set();

    if (lenaRes.status === 'fulfilled' && lenaRes.value) {
      const html = lenaRes.value;
      const movieCardRegex = /<a href="(https:\/\/crtanifilmovielena\.com\/movie\/[^"]+)"[^>]*>[\s\S]*?<img [^>]*src="([^"]+)"[^>]*>[\s\S]*?<h[34][^>]*>([\s\S]*?)<\/h[34]>/g;
      let match;
      while ((match = movieCardRegex.exec(html)) !== null) {
        const movieUrl = match[1];
        const imageUrl = match[2];
        const title = cleanText(match[3]);
        const id = movieUrl.replace(/.*\/movie\//, '').replace(/\//g, '');
        if (title && !seen.has(id)) {
          seen.add(id);
          results.push({
            id,
            url: movieUrl,
            title,
            poster: imageUrl,
            backdrop: imageUrl,
            tags: assignCategoryTags(title, id)
          });
        }
      }
    }

    if (gledajRes.status === 'fulfilled' && gledajRes.value) {
      const html = gledajRes.value;
      const linkRegex = /<a[^>]+href=["']([^"']*\/publ\/[^"']+\/\d+-\d+-\d+-\d+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        let href = match[1];
        if (href.startsWith('/')) href = 'https://www.gledajcrtace.net' + href;
        const titleText = cleanText(match[2].split('">')[0]);

        if (titleText && titleText.length > 2 && !seen.has(href)) {
          seen.add(href);
          results.push({
            id: href,
            url: href,
            title: titleText,
            poster: 'https://image.tmdb.org/t/p/w500/7Md3nuV0ZprBTnkdR3OrUCEsrSP.jpg',
            backdrop: 'https://image.tmdb.org/t/p/w500/7Md3nuV0ZprBTnkdR3OrUCEsrSP.jpg',
            tags: assignCategoryTags(titleText, href)
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
