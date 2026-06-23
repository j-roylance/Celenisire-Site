import { z } from 'zod';
import { DocumentSourceType } from '@prisma/client';
import { isSupabaseStorageConfigured } from './env.js';
import {
  buildStoragePath,
  FINANCIAL_REPORTS_BUCKET,
  MAX_PDF_SIZE,
  RESEARCH_PUBLICATIONS_BUCKET,
  uploadPdf,
} from './supabaseStorage.js';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parseBooleanField(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

const externalUrlSchema = z.string().url().optional().or(z.literal(''));

export interface FileSourceResult {
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  storagePath: string | null;
  sourceType: DocumentSourceType;
}

export async function resolveFileSource(
  file: Express.Multer.File | undefined,
  externalUrl: string | undefined,
  bucket: string,
  pathPrefix: string,
): Promise<FileSourceResult | null> {
  if (file) {
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }
    if (file.size > MAX_PDF_SIZE) {
      throw new Error('File exceeds 10 MB limit');
    }
    if (!isSupabaseStorageConfigured()) {
      throw new Error('Supabase Storage is not configured. Use an external URL or set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    const storagePath = buildStoragePath(pathPrefix, file.originalname);
    const fileUrl = await uploadPdf(bucket, storagePath, file.buffer, file.mimetype);
    return {
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      storagePath,
      sourceType: DocumentSourceType.upload,
    };
  }

  const parsedUrl = externalUrlSchema.parse(externalUrl ?? '');
  if (parsedUrl) {
    const fileName = parsedUrl.split('/').pop() || 'document.pdf';
    return {
      fileUrl: parsedUrl,
      fileName,
      fileSize: null,
      storagePath: null,
      sourceType: DocumentSourceType.external,
    };
  }

  return null;
}

export function getFinancialBucket() {
  return FINANCIAL_REPORTS_BUCKET;
}

export function getResearchBucket() {
  return RESEARCH_PUBLICATIONS_BUCKET;
}
