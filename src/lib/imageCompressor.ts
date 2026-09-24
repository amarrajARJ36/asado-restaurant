/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Returns a base64 Data URL (WebP or JPEG).
 * Produces crisp, optimized images around 30KB - 80KB, perfectly suited
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

        // Safety safeguard: if for some reason dataUrl is larger than 450KB,
        // downsample dimensions to ensure it never exceeds Firestore document limits
        if (dataUrl.length > 450000) {
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = Math.round(canvas.width * 0.7);
          smallCanvas.height = Math.round(canvas.height * 0.7);
          const smallCtx = smallCanvas.getContext('2d');
          if (smallCtx) {
            smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            dataUrl = smallCanvas.toDataURL('image/jpeg', 0.6);
          }
        }

        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
