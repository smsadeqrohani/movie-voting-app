import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// Create HTTP router
const http = httpRouter();

// Image proxy endpoint
http.route({
  path: "/image-proxy",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get("url");
    
    if (!imageUrl) {
      return new Response("Missing image URL", { status: 400 });
    }
    
    try {
      // Fetch image from TMDB
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        return new Response("Image not found", { status: 404 });
      }
      
      const imageBuffer = await response.arrayBuffer();
      
      // Return image with proper headers
      return new Response(imageBuffer, {
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
          "Access-Control-Allow-Origin": "*", // Allow CORS
        },
      });
    } catch (error) {
      console.error("Error proxying image:", error);
      return new Response("Error loading image", { status: 500 });
    }
  }),
});

// Export the router as default
export default http;
