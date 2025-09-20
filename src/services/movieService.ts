import axios from 'axios';

export interface MovieData {
  imdbId: string;
  title: string;
  year: number;
  director?: string;
  actors?: string[];
  plot?: string;
  poster?: string;
  imdbRating?: number;
  genre?: string[];
  imdbUrl: string;
}

// TMDB API Configuration
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZDMxNTk0ZTdkNGY0ZjgwZGMwMjIyODBmZTIxMjdkYyIsIm5iZiI6MTc1NDgxNDA5Ny40MTI5OTk5LCJzdWIiOiI2ODk4NTY5MTczMzVhMzAzY2U2ZDY3ODUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fzcNq_6T4O7VPTfTWeoxa3QfXH0VQA6uphEQctTsoSs';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchMovieData(imdbId: string): Promise<MovieData | null> {
  try {
    console.log(`Fetching content data for IMDb ID: ${imdbId}`);
    
    // Step 1: Find content by IMDb ID using TMDB's find endpoint
    const findResponse = await axios.get(`${TMDB_BASE_URL}/find/${imdbId}`, {
      params: {
        external_source: 'imdb_id'
      },
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Check for movies first
    if (findResponse.data.movie_results && findResponse.data.movie_results.length > 0) {
      const movie = findResponse.data.movie_results[0];
      console.log(`Found movie in TMDB: ${movie.title}`);
      
      // Step 2: Get detailed information including credits
      const detailsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}`, {
        params: {
          append_to_response: 'credits,external_ids'
        },
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const details = detailsResponse.data;
      
      // Extract director from crew
      const director = details.credits?.crew?.find((person: any) => 
        person.job === 'Director' || person.job === 'Co-Director'
      )?.name;
      
      // Get top 5 actors
      const actors = details.credits?.cast?.slice(0, 5).map((actor: any) => actor.name) || [];
      
      // Get genres
      const genres = details.genres?.map((genre: any) => genre.name) || [];
      
      // Get poster URL
      const poster = details.poster_path ? 
        `https://image.tmdb.org/t/p/w500${details.poster_path}` : undefined;
      
      // Get year from release date
      const year = details.release_date ? 
        new Date(details.release_date).getFullYear() : 
        new Date().getFullYear();
      
      return {
        imdbId: imdbId,
        title: details.title,
        year: year,
        director: director,
        actors: actors,
        plot: details.overview,
        poster: poster,
        imdbRating: undefined, // TMDB doesn't provide IMDb rating directly
        genre: genres,
        imdbUrl: `https://www.imdb.com/title/${imdbId}/`,
      };
    }
    
    // Check for TV series
    if (findResponse.data.tv_results && findResponse.data.tv_results.length > 0) {
      const tvShow = findResponse.data.tv_results[0];
      console.log(`Found TV series in TMDB: ${tvShow.name}`);
      
      // Step 2: Get detailed information including credits
      const detailsResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tvShow.id}`, {
        params: {
          append_to_response: 'credits,external_ids'
        },
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const details = detailsResponse.data;
      
      // For TV series, we'll use creator instead of director
      const creator = details.created_by && details.created_by.length > 0 ? 
        details.created_by[0].name : undefined;
      
      // Get top 5 actors
      const actors = details.credits?.cast?.slice(0, 5).map((actor: any) => actor.name) || [];
      
      // Get genres
      const genres = details.genres?.map((genre: any) => genre.name) || [];
      
      // Get poster URL
      const poster = details.poster_path ? 
        `https://image.tmdb.org/t/p/w500${details.poster_path}` : undefined;
      
      // Get year from first air date
      const year = details.first_air_date ? 
        new Date(details.first_air_date).getFullYear() : 
        new Date().getFullYear();
      
      return {
        imdbId: imdbId,
        title: details.name,
        year: year,
        director: creator, // Using creator for TV series
        actors: actors,
        plot: details.overview,
        poster: poster,
        imdbRating: undefined, // TMDB doesn't provide IMDb rating directly
        genre: genres,
        imdbUrl: `https://www.imdb.com/title/${imdbId}/`,
      };
    }
    
    console.log('No content found in TMDB for this IMDb ID');
    return null;
    
  } catch (error) {
    console.error('Error fetching movie data from TMDB:', error);
    return null;
  }
}

// Helper function to extract IMDb ID from URL or return the ID if it's already an ID
export function extractImdbId(input: string): string | null {
  // If it's already an IMDb ID (starts with tt and has numbers)
  if (/^tt\d+$/.test(input.trim())) {
    return input.trim();
  }
  
  // Extract from IMDb URL
  const imdbUrlMatch = input.match(/imdb\.com\/title\/(tt\d+)/);
  if (imdbUrlMatch) {
    return imdbUrlMatch[1];
  }
  
  return null;
}

// Helper function to validate IMDb URL or ID
export function isValidImdbInput(input: string): boolean {
  const imdbId = extractImdbId(input);
  return imdbId !== null;
}