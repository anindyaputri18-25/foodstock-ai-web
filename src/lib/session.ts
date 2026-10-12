import { SessionPayloadSchema, type SessionPayload } from "@/types/domain";

// NFR-01: autentikasi & Role-Based Access Control. Cookie sesi ditandatangani
// (HMAC-SHA256) di server melalui Route Handler (app/api/auth/session), lalu
// diverifikasi di middleware.ts sebelum request mencapai rute /admin,
// /dinas, /bulog, /distributor, bukan document.cookie di sisi klien.
//
// SESSION_SECRET dapat diset sebagai environment variable di Vercel; nilai
// default disediakan agar proyek tetap bisa langsung di-deploy tanpa
// konfigurasi tambahan (sesuai kebutuhan proyek akhir front-end).
const SECRET = process.env.SESSION_SECRET ?? "foodstock-ai-default-secret-ganti-di-vercel";
export const SESSION_COOKIE_NAME = "foodstock_session";

function toBase64Url(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const str = atob(padded);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const body = toBase64Url(new TextEncoder().encode(json));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const sigB64 = toBase64Url(new Uint8Array(sig));
  return `${body}.${sigB64}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sigB64] = parts;
  if (!body || !sigB64) return null;
  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64) as BufferSource,
      new TextEncoder().encode(body) as BufferSource,
    );
    if (!valid) return null;
    const json = new TextDecoder().decode(fromBase64Url(body));
    const parsed = SessionPayloadSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
