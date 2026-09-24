/**
 * High-performance image optimization helper.
 * Automatically resizes CDN images (Unsplash) to appropriate display resolutions,
 * drastically reducing payload sizes from several megabytes down to ~20-40KB.
 */

export function optimizeImageUrl(
  url: string | undefined | null, 
  width = 500, 
  quality = 75
): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // If it's a base64 data URL or blob, return as is
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Optimize Unsplash images dynamically
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.set('w', width.toString());
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      return parsed.toString();
    } catch {
      // Fallback regex replacement if URL constructor encounters a malformed string
      let optimized = trimmed;
      if (/w=\d+/.test(optimized)) {
        optimized = optimized.replace(/w=\d+/, `w=${width}`);
      } else {
        optimized += (optimized.includes('?') ? '&' : '?') + `w=${width}`;
      }
      if (/q=\d+/.test(optimized)) {
        optimized = optimized.replace(/q=\d+/, `q=${quality}`);
      } else {
        optimized += `&q=${quality}`;
      }
      if (!optimized.includes('auto=format')) {
        optimized += '&auto=format';
      }
      if (!optimized.includes('fit=crop')) {
        optimized += '&fit=crop';
      }
      return optimized;
    }
  }

  return trimmed;
}

/**
 * Preload category or dish images into browser cache so they appear immediately.
 */
export function preloadCategoryImages(categories: { imageUrl?: string; image?: string }[], maxToPreload = 12) {
  if (typeof window === 'undefined') return;

  const slice = categories.slice(0, maxToPreload);
  slice.forEach(cat => {
    const rawUrl = cat.imageUrl || cat.image;
    if (!rawUrl) return;
    const optimized = optimizeImageUrl(rawUrl, 500, 75);
    if (!optimized || optimized.startsWith('data:')) return;
    
    const img = new Image();
    img.src = optimized;
  });
}
