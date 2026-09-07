import "server-only";

import type { R2Config } from "@/lib/r2-sign";
import {
  presignGet as presignGetRaw,
  r2OriginalKey,
  r2PreviewKey,
} from "@/lib/r2-sign";

export { r2OriginalKey, r2PreviewKey };

export function r2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export async function presignGet(cfg: R2Config, key: string, expires = 900): Promise<string> {
  return presignGetRaw(cfg, key, expires);
}

/** Logical gallery source `r2:gallery/<slug>/<file>` -> original + preview keys. */
export function r2KeysFromSource(source: string): { original: string; preview: string } | null {
  if (!source.startsWith("r2:")) return null;
  const original = source.slice(3);
  const [, slug, file] = original.split("/");
  if (!slug || !file) return null;
  return { original, preview: r2PreviewKey(slug, file) };
}