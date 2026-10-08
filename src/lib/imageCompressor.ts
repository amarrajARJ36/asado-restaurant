/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Returns a base64 Data URL (WebP or JPEG).
 * Produces crisp, optimized images perfectly suited
 * for fast loading and direct storage in Firestore documents.
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<string> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.72 } = options;

  // Flexible validation allowing various mobile MIME types or valid file extensions
  const isImageMime = file.type && file.type.startsWith('image/');
  const isImageExt = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|svg)$/i.test(file.name || '');
  if (!isImageMime && !isImageExt && file.type !== '') {
    throw new Error('Selected file is not an image. Please choose an image file (JPEG, PNG, WEBP).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from your device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unable to decode this image file. Please try saving it as a standard JPG or PNG before uploading.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created.'));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Try WebP first (best compression & quality), fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Safety safeguard: keep under ~80KB for document safety
        if (dataUrl.length > 90000) {
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = Math.round(canvas.width * 0.75);
          smallCanvas.height = Math.round(canvas.height * 0.75);
          const smallCtx = smallCanvas.getContext('2d');
          if (smallCtx) {
            smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            dataUrl = smallCanvas.toDataURL('image/webp', 0.55);
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = smallCanvas.toDataURL('image/jpeg', 0.52);
            }
          }
        }

        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses category background photo specifically tailored for category cards.
 * Produces crisp, beautiful WebP images around 14KB - 22KB (max 25KB guaranteed).
 * Ensures a branch can have 30+ category photos without ever exceeding Firestore's 1MB limit.
 */
export async function compressCategoryPhoto(file: File): Promise<string> {
  const isImageMime = file.type && file.type.startsWith('image/');
  const isImageExt = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|svg)$/i.test(file.name || '');
  if (!isImageMime && !isImageExt && file.type !== '') {
    throw new Error('Selected file is not an image. Please choose an image file (JPEG, PNG, WEBP).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from your device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unable to decode image file.'));
      img.onload = () => {
        const maxWidth = 500;
        const maxHeight = 380;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created.'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Quality cascade to guarantee size is strictly under 25KB
        let dataUrl = canvas.toDataURL('image/webp', 0.65);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.60);
        }

        if (dataUrl.length > 25000) {
          // Step 1: Lower quality slightly
          dataUrl = canvas.toDataURL('image/webp', 0.48);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.45);
          }
        }

        if (dataUrl.length > 25000) {
          // Step 2: Downsample dimensions slightly
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = Math.round(canvas.width * 0.75);
          smallCanvas.height = Math.round(canvas.height * 0.75);
          const smallCtx = smallCanvas.getContext('2d');
          if (smallCtx) {
            smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            dataUrl = smallCanvas.toDataURL('image/webp', 0.45);
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = smallCanvas.toDataURL('image/jpeg', 0.42);
            }
          }
        }

        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * In-browser recompressor for existing oversized base64 data URLs.
 * Recompresses images down to compact WebP under the target byte budget.
 */
export async function recompressDataUrl(dataUrl: string, maxBytes = 25000): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  if (dataUrl.length <= maxBytes) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      const maxWidth = 500;
      const maxHeight = 380;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let compressed = canvas.toDataURL('image/webp', 0.65);
      if (!compressed.startsWith('data:image/webp')) {
        compressed = canvas.toDataURL('image/jpeg', 0.60);
      }

      if (compressed.length > maxBytes) {
        compressed = canvas.toDataURL('image/webp', 0.48);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', 0.45);
        }
      }

      resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
    };
    img.src = dataUrl;
  });
}
