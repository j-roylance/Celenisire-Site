import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseStorageConfigured } from './env.js';

export const FINANCIAL_REPORTS_BUCKET = 'financial-reports';
export const RESEARCH_PUBLICATIONS_BUCKET = 'research-publications';
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

function getSupabase() {
  if (!isSupabaseStorageConfigured()) {
    throw new Error('Supabase Storage is not configured');
  }
  return createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function uploadPdf(
  bucket: string,
  storagePath: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteStorageFile(bucket: string, storagePath: string): Promise<void> {
  if (!storagePath || !isSupabaseStorageConfigured()) return;
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) throw new Error(error.message);
}

export function buildStoragePath(prefix: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${prefix}/${Date.now()}-${safeName}`;
}
