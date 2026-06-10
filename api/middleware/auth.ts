import { verifyToken, errors } from "../../utils/jwt";
import { hashPassword, verifyAndMaybeUpgradePassword } from "../../utils/password";

export interface AuthResult {
  userId: string;
  role: "admin" | "guild";
  token?: string;
  expiresIn?: number;
}

function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function authenticate(
  request: Request,
  options?: { allowAdmin?: boolean }
): Promise<AuthResult> {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new AuthError("Token de autenticação necessário", 401);
  }

  // 1. Tenta validar como JWT primeiro
  try {
    const payload = await verifyToken(token);
    if (options?.allowAdmin === false && payload.role === "admin") {
      throw new AuthError("Acesso admin não permitido neste recurso", 403);
    }
    return { userId: payload.sub, role: payload.role };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      throw new AuthError("Token expirado", 401);
    }
    if (err instanceof errors.JOSEError) {
      // Não é JWT válido — tenta fallback para senha
    } else {
      throw err;
    }
  }

  // 2. Fallback: valida como senha (retrocompatibilidade)
  throw new AuthError("Token JWT inválido. Faça login novamente.", 401);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

export { verifyToken, signToken } from "../../utils/jwt";
