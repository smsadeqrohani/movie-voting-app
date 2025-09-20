// Extract IMDb ID from URL or return the ID if it's already an ID
export function extractImdbId(input: string): string | null {
  const cleanInput = input.trim();
  
  // If it's already an IMDb ID (starts with tt and has numbers)
  if (/^tt\d+$/.test(cleanInput)) {
    return cleanInput;
  }
  
  // Extract from IMDb URL
  const imdbUrlMatch = cleanInput.match(/imdb\.com\/title\/(tt\d+)/i);
  if (imdbUrlMatch) {
    return imdbUrlMatch[1];
  }
  
  return null;
}

// Validate IMDb URL or ID
export function isValidImdbUrl(input: string): boolean {
  return extractImdbId(input) !== null;
}

// Get IMDb URL from ID
export function getImdbUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/`;
}
