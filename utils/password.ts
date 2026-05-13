const FORMAT_PREFIX = "pbkdf2$";
const DEFAULT_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const DK_BITS = 256;

const getCrypto = () => {
  const c = (globalThis as any).crypto as Crypto | undefined;
  if (!c?.subtle) throw new Error("WebCrypto indisponível neste runtime.");
  return c;
};

const utf8 = (s: string) => new TextEncoder().encode(s);

const b64Encode = (bytes: Uint8Array) => {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const b64Decode = (b64: string) => {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const constantTimeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

export const isHashedPassword = (stored: string) => stored.startsWith(FORMAT_PREFIX);

export const hashPassword = async (password: string, opts?: { iterations?: number; saltB64?: string }) => {
  const crypto = getCrypto();
  const iterations = opts?.iterations ?? DEFAULT_ITERATIONS;
  const salt = opts?.saltB64 ? b64Decode(opts.saltB64) : crypto.getRandomValues(new Uint8Array(SALT_BYTES));

  const key = await crypto.subtle.importKey("raw", utf8(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", iterations, salt },
    key,
    DK_BITS
  );
  const dk = new Uint8Array(bits);
  return `${FORMAT_PREFIX}${iterations}$${b64Encode(salt)}$${b64Encode(dk)}`;
};

export const verifyPassword = async (stored: string, candidate: string) => {
  if (!isHashedPassword(stored)) return candidate === stored;

  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = b64Decode(parts[2]);
  const expected = b64Decode(parts[3]);
  const computed = b64Decode(await hashPassword(candidate, { iterations, saltB64: parts[2] }).then((s) => s.split("$")[3]));
  return constantTimeEqual(expected, computed);
};

export const verifyAndMaybeUpgradePassword = async (stored: string, candidate: string) => {
  const ok = await verifyPassword(stored, candidate);
  if (!ok) return { ok: false as const };
  if (isHashedPassword(stored)) return { ok: true as const };
  const upgraded = await hashPassword(candidate);
  return { ok: true as const, upgraded };
};
