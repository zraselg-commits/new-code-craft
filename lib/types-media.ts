/**
 * types-media.ts
 * Shared type declarations for the Media Library.
 * Importable from both server-side API routes and client components.
 */

export interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  ext: string;
}
