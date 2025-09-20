import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  movies: defineTable({
    imdbId: v.string(),
    title: v.string(),
    year: v.number(),
    director: v.optional(v.string()),
    actors: v.optional(v.array(v.string())),
    plot: v.optional(v.string()),
    poster: v.optional(v.string()),
    imdbRating: v.optional(v.number()),
    genre: v.optional(v.array(v.string())),
    votes: v.number(),
    imdbUrl: v.string(),
    addedAt: v.number(),
    addedBy: v.optional(v.string()),
    addedBySession: v.optional(v.string()), // Session ID of who added the movie
    // Special properties
    isDouble: v.optional(v.boolean()), // double ezafe shod
    hasSubtitle: v.optional(v.boolean()), // ba zirnevis ezafe shod
    hasContentIssue: v.optional(v.boolean()), // moshkele mohtavai darad
  })
    .index("by_imdb_id", ["imdbId"])
    .index("by_votes", ["votes"])
    .index("by_added_at", ["addedAt"]),
  
  votes: defineTable({
    movieId: v.id("movies"),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()), // برای tracking session
    votedAt: v.number(),
  })
    .index("by_movie", ["movieId"])
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_movie_and_session", ["movieId", "sessionId"]),
});
