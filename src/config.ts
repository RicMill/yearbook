export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Resolves static mock images vs uploaded user portraits from the database.
 * If the path starts with http, https, or data:, it is returned directly.
 * Otherwise, it prepends the backend server base URL.
 */
export const getImageUrl = (photoPath: string | null | undefined): string => {
  if (!photoPath) return '';
  
  if (
    photoPath.startsWith('http://') || 
    photoPath.startsWith('https://') || 
    photoPath.startsWith('data:') ||
    photoPath.startsWith('/src/assets/') || // Vite local dev assets
    photoPath.includes('blob:')             // Browser blob URLs
  ) {
    return photoPath;
  }
  
  return `${API_BASE_URL}${photoPath}`;
};
