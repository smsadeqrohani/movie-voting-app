// Image utility functions

// Convert proxy URL to full Convex URL
export function getImageUrl(posterUrl?: string): string | undefined {
  if (!posterUrl) {
    return undefined;
  }
  
  // If it's already a full URL, return as is
  if (posterUrl.startsWith('http')) {
    return posterUrl;
  }
  
  // If it's a proxy URL, make it full
  if (posterUrl.startsWith('/image-proxy')) {
    const convexUrl = process.env.REACT_APP_CONVEX_URL;
    if (!convexUrl) {
      console.error('REACT_APP_CONVEX_URL is not defined');
      return posterUrl;
    }
    
    // Extract the deployment name from the URL
    // e.g., https://cool-goldfish-981.convex.cloud -> cool-goldfish-981
    const match = convexUrl.match(/https:\/\/([^.]+)\.convex\.cloud/);
    if (!match) {
      console.error('Invalid Convex URL format');
      return posterUrl;
    }
    
    const deploymentName = match[1];
    const fullConvexUrl = `https://${deploymentName}.convex.cloud`;
    
    return `${fullConvexUrl}${posterUrl}`;
  }
  
  // Default case
  return posterUrl;
}
