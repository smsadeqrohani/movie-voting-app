import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

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

// Add a new movie (only if it doesn't exist)
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
      throw new Error("این فیلم قبلاً اضافه شده است");
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
