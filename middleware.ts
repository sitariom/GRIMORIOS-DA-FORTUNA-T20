import { jwtVerify, errors } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET || crypto.randomUUID() + crypto.randomUUID();
  return new TextEncoder().encode(secret);
};

export const config = {
  matcher: "/api/:path*",
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);

  // Rotas públicas: GET /api/guilds sem id, GET /api/admin com action=login
  if (request.method === "GET") {
    const id = url.searchParams.get("id") || url.pathname.split("/").filter(Boolean)[2];
    if (!id) return undefined; // listagem pública
  }

  if (request.method === "POST" && url.pathname === "/api/admin") {
    const body = await request.clone().json().catch(() => ({}));
    if (body.action === "login") return undefined; // login público
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined; // passa adiante — serverless valida senha
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { sub, role } = payload as any;

    if (typeof sub !== "string" || (role !== "admin" && role !== "guild")) {
      return new Response(JSON.stringify({ error: "Token JWT inválido: payload corrompido" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      return new Response(JSON.stringify({ error: "Token expirado. Faça login novamente." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    // JWT inválido — passa adiante (senha pode funcionar)
  }

  return undefined;
}
