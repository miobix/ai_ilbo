const SESSION_TTL_SECONDS = 60 * 60;
const SECRET = "yeongnam-ai-hardcoded-secret";

function toBase64(bytes) {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(bytes).toString("base64");
  }
  // Browser environment
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(base64) {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  // Browser environment
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function toBase64Url(bytes) {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return fromBase64(base64);
}

async function getHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(user) {
  const payload = {
    sub: user.username,
    role: user.role,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };

  const payloadEncoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadEncoded)
  );

  return `${payloadEncoded}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  const [payloadEncoded, sigEncoded] = token.split(".");
  if (!payloadEncoded || !sigEncoded) return null;

  const key = await getHmacKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(sigEncoded),
    new TextEncoder().encode(payloadEncoded)
  );

  if (!valid) return null;

  try {
    const payloadText = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const payload = JSON.parse(payloadText);
    if (!payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_TTL_SECONDS };
