import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uxqynrtqxcrfdklwydhl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cXlucnRxeGNyZmRrbHd5ZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMjI1MzQsImV4cCI6MjEwNzc5ODUzNH0.qr4ls3aNkRtAMHDcqOyvrRS6IghBWwnjxuHHZReBy-g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

/**
 * Uploads an image file directly to the public Supabase Storage bucket 'restaurant-assets'.
 * Returns the permanent CDN public URL (e.g. https://...supabase.co/storage/v1/object/public/...)
 */
export async function uploadImageToSupabase(
  file: File,
  folder: 'dishes' | 'categories' | 'banners' = 'dishes',
  customId?: string
): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const cleanId = (customId || Date.now().toString()).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${folder}/${cleanId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('restaurant-assets')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg'
    });

  if (uploadError) {
    throw new Error(`Failed to upload to Supabase storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('restaurant-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
