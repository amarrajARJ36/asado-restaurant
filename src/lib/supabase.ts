import { createClient } from '@supabase/supabase-js';
import { compressImage, compressCategoryPhoto } from './imageCompressor';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://uxqynrtqxcrfdklwydhl.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cXlucnRxeGNyZmRrbHd5ZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMjI1MzQsImV4cCI6MjEwNzc5ODUzNH0.qr4ls3aNkRtAMHDcqOyvrRS6IghBWwnjxuHHZReBy-g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

/**
 * Uploads an image file directly to the public Supabase Storage bucket 'restaurant-assets'.
 * Automatically compresses images into ultra-light WebP (under 50-70KB) before uploading,
 * dramatically saving Supabase storage egress bandwidth to stay 100% on the Free plan.
 * Returns the permanent CDN public URL (e.g. https://...supabase.co/storage/v1/object/public/...)
 */
export async function uploadImageToSupabase(
  file: File,
  folder: 'dishes' | 'categories' | 'banners' | 'gallery' = 'dishes',
  customId?: string
): Promise<string> {
  let uploadBlob: Blob = file;
  let fileExt = 'webp';

  // Automatically compress images before uploading
  try {
    const isImage = file.type?.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name || '');
    if (isImage) {
      if (folder === 'categories') {
        const compressedDataUrl = await compressCategoryPhoto(file);
        const res = await fetch(compressedDataUrl);
        uploadBlob = await res.blob();
      } else {
        const options = folder === 'banners'
          ? { maxWidth: 1200, maxHeight: 600, quality: 0.70 }
          : folder === 'gallery'
          ? { maxWidth: 960, maxHeight: 960, quality: 0.70 }
          : { maxWidth: 640, maxHeight: 640, quality: 0.65 };

        const compressedDataUrl = await compressImage(file, options);
        const res = await fetch(compressedDataUrl);
        uploadBlob = await res.blob();
      }
      fileExt = 'webp';
    } else {
      fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    }
  } catch (compErr) {
    console.warn('In-browser image compression skipped, uploading original:', compErr);
    uploadBlob = file;
    fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
  }

  const cleanId = (customId || Date.now().toString()).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${folder}/${cleanId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('restaurant-assets')
    .upload(filePath, uploadBlob, {
      upsert: true,
      contentType: uploadBlob.type || 'image/webp'
    });

  if (uploadError) {
    throw new Error(`Failed to upload to Supabase storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('restaurant-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
