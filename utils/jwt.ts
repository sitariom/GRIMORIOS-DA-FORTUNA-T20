import { SignJWT, jwtVerify, errors } from "jose";

const DEFAULT_EXPIRES_IN = 86_400; // 24h

let _cachedSecret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (_cachedSecret) return _cachedSecret;
  let secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn(
      "WARN: JWT_SECRET não configurado no runtime. " +
      "process.env.JWT_SECRET = " + JSON.stringify(process.env.JWT_SECRET) + ". " +
      "Edge Functions não acessam env vars Sensitive/Secret. " +
      "Usando chave aleatória (sessões serão inválidas entre restarts)."
    );
    secret = crypto.randomUUID() + crypto.randomUUID();
  }
  _cachedSecret = new TextEncoder().encode(secret);
  return _cachedSecret;
}

function getExpiresIn(): number {
  const val = process.env.JWT_EXPIRES_IN;
  if (val) {
    const n = Number(val);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return DEFAULT_EXPIRES_IN;
}

export interface JwtPayload {
  sub: string;
  role: "admin" | "guild";
  ver?: number;
}

export async function signToken(payload: JwtPayload): Promise<{ token: string; expiresIn: number }> {
  const expiresIn = getExpiresIn();
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getSecret());
  return { token, expiresIn };
}

export async function verifyToken(token: string): Promise<JwtPayload & { iat: number; exp: number }> {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
  const { sub, role, ver, iat, exp } = payload as any;
  if (typeof sub !== "string" || (role !== "admin" && role !== "guild")) {
    throw new errors.JOSEError("Payload JWT inválido");
  }
  return { sub, role, ver, iat, exp };
}

export function isTokenExpiringSoon(exp: number, thresholdSec = 1800): boolean {
  const now = Math.floor(Date.now() / 1000);
  return exp - now < thresholdSec;
}

export { errors };
