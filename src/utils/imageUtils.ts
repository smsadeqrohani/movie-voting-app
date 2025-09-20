// Image utility functions

// Get Convex file URL from file ID
export function getImageUrl(fileId?: string): string | undefined {
  if (!fileId) {
    return undefined;
  }
  
  // If it's already a full URL, return as is
  if (fileId.startsWith('http')) {
    return fileId;
  }
  
  // For Convex file IDs, we need to use the storage.getUrl() function
  // This will be handled in the component using useQuery
  return fileId;
}
