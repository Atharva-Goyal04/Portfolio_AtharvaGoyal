import { createHmac, createHash } from "node:crypto";

interface Env {
  R2_BUCKET: R2Bucket;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
}

const REGION = "auto";
const SERVICE = "s3";

const PUBLIC_PREFIX = "portfolio/";
const PRIVATE_PREFIX = "galleries/";

const CACHE_PUBLIC = "public, max-age=31536000, immutable";

function serviceHost(cfg: { accountId: string }): string {
  return `${cfg.accountId}.r2.cloudflarestorage.com`;
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

function signingKey(secretAccessKey: string, dateStamp: string): Buffer {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
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

function canonicalUri(key: string): string {
  return key
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
}

function sign(
  cfg: { accessKeyId: string; secretAccessKey: string },
  key: string,
  method: string,
  params: Record<string, string>,
  payloadHash: string,
  headers: Record<string, string>,
  date: Date,
): { amz: string; uri: string; query: string; authorization: string; signedHeaders: string[]; signature: string } {
  const { dateStamp, amz } = dates(date);
  const uri = `/${cfg.accessKeyId ? "bucket" : "bucket"}/${canonicalUri(key)}`;
  const all: Record<string, string> = { host: serviceHost({ accountId: cfg.accessKeyId ? "" : "" }), ...headers };
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

  const signature = hmac(signingKey(cfg.secretAccessKey, dateStamp), stringToSign).toString("hex");
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scopeDate(dateStamp)}, ` +
    `SignedHeaders=${signedHeaders.join(";")}, Signature=${signature}`;

  return { amz, uri, query: canonicalQuery(params), authorization, signedHeaders, signature };
}

async function verifyPresignedGet(
  cfg: { accountId: string; accessKeyId: string; secretAccessKey: string },
  request: Request,
  key: string,
): Promise<boolean> {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const algorithm = searchParams.get("X-Amz-Algorithm");
  const credential = searchParams.get("X-Amz-Credential");
  const date = searchParams.get("X-Amz-Date");
  const expires = searchParams.get("X-Amz-Expires");
  const signedHeaders = searchParams.get("X-Amz-SignedHeaders");
  const signature = searchParams.get("X-Amz-Signature");

  if (!algorithm || !credential || !date || !expires || !signedHeaders || !signature) {
    return false;
  }

  const expiresNum = parseInt(expires, 10);
  if (isNaN(expiresNum) || expiresNum > 604800) {
    return false;
  }

  const now = Date.now();
  const reqDate = new Date(
    date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8) +
    "T" + date.slice(9, 11) + ":" + date.slice(11, 13) + ":" + date.slice(13, 15) + "Z"
  ).getTime();

  if (Math.abs(now - reqDate) > 15 * 60 * 1000) {
    return false;
  }

  const expiryTime = reqDate + expiresNum * 1000;
  if (now > expiryTime) {
    return false;
  }

  const expectedParams: Record<string, string> = {
    "X-Amz-Algorithm": algorithm,
    "X-Amz-Credential": credential,
    "X-Amz-Date": date,
    "X-Amz-Expires": expires,
    "X-Amz-SignedHeaders": signedHeaders,
  };

  const { uri, query, authorization: expectedAuth } = sign(
    { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    key,
    "GET",
    expectedParams,
    "UNSIGNED-PAYLOAD",
    { host: serviceHost({ accountId: cfg.accountId }) },
    new Date(reqDate)
  );

  const expectedSignature = expectedAuth.split("Signature=")[1];
  return signature === expectedSignature;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    if (!path) {
      return new Response("Lumen CDN Worker", { status: 200 });
    }

    const cfg = {
      accountId: env.R2_ACCOUNT_ID,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    };

    if (path.startsWith(PUBLIC_PREFIX)) {
      const object = await env.R2_BUCKET.get(path);
      if (!object) {
        return new Response("Not found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Cache-Control", CACHE_PUBLIC);
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(object.body, {
        status: 200,
        headers,
      });
    }

    if (path.startsWith(PRIVATE_PREFIX)) {
      const verified = await verifyPresignedGet(cfg, request, path);
      if (!verified) {
        return new Response("Invalid or expired signature", { status: 403 });
      }

      const object = await env.R2_BUCKET.get(path);
      if (!object) {
        return new Response("Not found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Cache-Control", "private, max-age=0, must-revalidate");
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(object.body, {
        status: 200,
        headers,
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;