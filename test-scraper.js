import { fetchHomePageData, fetchMovieDetails } from './src/api/scraper.js';

async function test() {
  console.log('Testing crtanifilmovielena.com Scraper...');
  const homeData = await fetchHomePageData();
  console.log(`Found ${homeData.featured.length} featured movies, ${homeData.movies.length} catalog movies.`);

  if (homeData.movies.length > 0) {
    const firstMovie = homeData.movies[0];
    console.log(`Testing detail page for: ${firstMovie.title}`);
    const details = await fetchMovieDetails(firstMovie.url || `https://crtanifilmovielena.com/movie/${firstMovie.id}/`);
    console.log('Movie Details:', details);
  }
}

test();
