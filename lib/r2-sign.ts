import { createHmac, createHash } from "node:crypto";

const REGION = "auto";
const SERVICE = "s3";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

function serviceHost(cfg: R2Config): string {
  return `${cfg.accountId}.r2.cloudflarestorage.com`;
}

export function r2OriginalKey(slug: string, file: string): string {
  return `gallery/${slug}/${file}`;
}

export function r2PreviewKey(slug: string, file: string): string {
  return `gallery/${slug}/preview/${file}.webp`;
}

function canonicalUri(key: string): string {
  return key
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
}

function sha256hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function dates(date: Date): { dateStamp: string; amz: string } {
  const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const amz = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { dateStamp, amz };
}

function signingKey(cfg: R2Config, dateStamp: string): Buffer {
  const kDate = hmac(`AWS4${cfg.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

function scopeDate(dateStamp: string): string {
  return `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
}

function canonicalQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

function sign(
  cfg: R2Config,
  key: string,
  method: string,
  params: Record<string, string>,
  payloadHash: string,
  headers: Record<string, string>,
  date: Date,
): { amz: string; uri: string; query: string; authorization: string; signedHeaders: string[]; signature: string } {
  const { dateStamp, amz } = dates(date);
  const uri = `/${cfg.bucket}/${canonicalUri(key)}`;
  const all: Record<string, string> = { host: serviceHost(cfg), ...headers };
  const signedHeaders = Object.keys(all).sort();
  const block = signedHeaders.map((h) => `${h}:${all[h]}`).join("\n");

  const canonicalRequest = [
    method,
    uri,
    canonicalQuery(params),
    block,
    "",
    signedHeaders.join(";"),
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amz,
    scopeDate(dateStamp),
    sha256hex(canonicalRequest),
  ].join("\n");

  const signature = hmac(signingKey(cfg, dateStamp), stringToSign).toString("hex");
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scopeDate(dateStamp)}, ` +
    `SignedHeaders=${signedHeaders.join(";")}, Signature=${signature}`;

  return { amz, uri, query: canonicalQuery(params), authorization, signedHeaders, signature };
}

/**
 * Presigned GET for display/download. Expiry in seconds (max 604800 for R2).
 */
export async function presignGet(
  cfg: R2Config,
  key: string,
  expires = 900,
  date = new Date(),
): Promise<string> {
  const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const params = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${cfg.accessKeyId}/${scopeDate(dateStamp)}`,
    "X-Amz-Date": dates(date).amz,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  };
  const { uri, query, signature } = sign(cfg, key, "GET", params, "UNSIGNED-PAYLOAD", {}, date);
  return `https://${serviceHost(cfg)}${uri}?${query}&X-Amz-Signature=${signature}`;
}

/**
 * Signed upload headers for PUT. Must match the payload exactly.
 */
export async function signedPutHeaders(
  cfg: R2Config,
  key: string,
  body: Buffer,
  contentType: string,
  date = new Date(),
): Promise<Record<string, string>> {
  const payloadHash = sha256hex(body);
  const { amz, authorization } = sign(
    cfg,
    key,
    "PUT",
    {},
    payloadHash,
    { "content-type": contentType, "x-amz-content-sha256": payloadHash },
    date,
  );
  return {
    authorization,
    "x-amz-date": amz,
    "x-amz-content-sha256": payloadHash,
    "content-type": contentType,
  };
}