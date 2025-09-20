import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// TMDB API Configuration
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZDMxNTk0ZTdkNGY0ZjgwZGMwMjIyODBmZTIxMjdkYyIsIm5iZiI6MTc1NDgxNDA5Ny40MTI5OTk5LCJzdWIiOiI2ODk4NTY5MTczMzVhMzAzY2U2ZDY3ODUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fzcNq_6T4O7VPTfTWeoxa3QfXH0VQA6uphEQctTsoSs';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Fetch movie/TV data from TMDB API
async function fetchMovieDataFromTMDB(imdbId: string) {
  try {
    console.log(`Fetching content data for IMDb ID: ${imdbId}`);
    
    // Step 1: Find content by IMDb ID using TMDB's find endpoint
    const findResponse = await fetch(`${TMDB_BASE_URL}/find/${imdbId}?external_source=imdb_id`, {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!findResponse.ok) {
      throw new Error(`TMDB API error: ${findResponse.status}`);
    }

    const findData = await findResponse.json();

    // Check for movies first
    if (findData.movie_results && findData.movie_results.length > 0) {
      const movie = findData.movie_results[0];
      console.log(`Found movie in TMDB: ${movie.title}`);
      
      // Step 2: Get detailed information including credits
      const detailsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?append_to_response=credits,external_ids`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!detailsResponse.ok) {
        throw new Error(`TMDB API error: ${detailsResponse.status}`);
      }

      const details = await detailsResponse.json();
      
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
    if (findData.tv_results && findData.tv_results.length > 0) {
      const tvShow = findData.tv_results[0];
      console.log(`Found TV series in TMDB: ${tvShow.name}`);
      
      // Step 2: Get detailed information including credits
      const detailsResponse = await fetch(`${TMDB_BASE_URL}/tv/${tvShow.id}?append_to_response=credits,external_ids`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!detailsResponse.ok) {
        throw new Error(`TMDB API error: ${detailsResponse.status}`);
      }

      const details = await detailsResponse.json();
      
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
    console.error('Error fetching content data from TMDB:', error);
    return null;
  }
}

// Get all movies sorted by votes (desc) then by request time (asc - earlier first)
export const getAllMovies = query({
  args: {},
  handler: async (ctx: any) => {
    const movies = await ctx.db
      .query("movies")
      .collect();
    
    // Sort by votes (descending) then by addedAt (ascending - earlier requests first)
    return movies.sort((a: Doc<"movies">, b: Doc<"movies">) => {
      // First sort by votes (higher votes first)
      if (a.votes !== b.votes) {
        return b.votes - a.votes;
      }
      // If votes are equal, sort by request time (earlier requests first)
      return a.addedAt - b.addedAt;
    });
  },
});

// Get movie by IMDb ID
export const getMovieByImdbId = query({
  args: { imdbId: v.string() },
  handler: async (ctx, args) => {
    const movie = await ctx.db
      .query("movies")
      .withIndex("by_imdb_id", (q) => q.eq("imdbId", args.imdbId))
      .first();
    
    return movie;
  },
});

// Add a new movie with TMDB data (backend handles TMDB API call)
export const addMovieWithTMDB = action({
  args: {
    imdbId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if movie already exists
    const existingMovie = await ctx.runQuery(api.movies.getMovieByImdbId, { imdbId: args.imdbId });
    
    if (existingMovie) {
      throw new Error("این محتوا قبلاً اضافه شده است");
    }
    
    // Fetch data from TMDB
    const movieData = await fetchMovieDataFromTMDB(args.imdbId);
    
    if (!movieData) {
      throw new Error("محتوای مورد نظر در TMDB یافت نشد. لطفاً لینک یا شناسه صحیح وارد کنید");
    }
    
    const movieId: Id<"movies"> = await ctx.runMutation(api.movies.addMovie, {
      ...movieData,
    });
    
    return movieId;
  },
});

// Add a new movie (direct data - for backward compatibility)
export const addMovie = mutation({
  args: {
    imdbId: v.string(),
    title: v.string(),
    year: v.number(),
    director: v.optional(v.string()),
    actors: v.optional(v.array(v.string())),
    plot: v.optional(v.string()),
    poster: v.optional(v.string()),
    imdbRating: v.optional(v.number()),
    genre: v.optional(v.array(v.string())),
    imdbUrl: v.string(),
    addedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if movie already exists
    const existingMovie = await ctx.db
      .query("movies")
      .withIndex("by_imdb_id", (q) => q.eq("imdbId", args.imdbId))
      .first();
    
    if (existingMovie) {
      throw new Error("این محتوا قبلاً اضافه شده است");
    }
    
    const movieId = await ctx.db.insert("movies", {
      ...args,
      votes: 0,
      addedAt: Date.now(),
    });
    
    return movieId;
  },
});

// Vote for a movie (with session tracking)
export const voteForMovie = mutation({
  args: { 
    movieId: v.id("movies"),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    // Check if session already voted for this movie in the last 24 hours
    if (args.sessionId) {
      const recentVote = await ctx.db
        .query("votes")
        .withIndex("by_movie_and_session", (q) => 
          q.eq("movieId", args.movieId).eq("sessionId", args.sessionId)
        )
        .filter((q) => q.gt(q.field("votedAt"), twentyFourHoursAgo))
        .first();
      
      if (recentVote) {
        throw new Error("شما قبلاً به این فیلم رأی داده‌اید");
      }
    }
    
    // Check if user already voted for this movie (for future user auth)
    if (args.userId) {
      const existingVote = await ctx.db
        .query("votes")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("movieId"), args.movieId))
        .first();
      
      if (existingVote) {
        throw new Error("شما قبلاً به این فیلم رأی داده‌اید");
      }
    }
    
    // Add the vote record
    await ctx.db.insert("votes", {
      movieId: args.movieId,
      userId: args.userId,
      sessionId: args.sessionId,
      votedAt: now,
    });
    
    // Update movie vote count
    const movie = await ctx.db.get(args.movieId);
    if (movie) {
      await ctx.db.patch(args.movieId, {
        votes: movie.votes + 1,
      });
    }
    
    return { success: true };
  },
});

// Get movie by ID
export const getMovieById = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);
    return movie;
  },
});
