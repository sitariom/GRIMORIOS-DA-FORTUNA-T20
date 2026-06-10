import { verifyToken, signToken, isTokenExpiringSoon, errors } from "../../utils/jwt";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não suportado" }), { status: 405 });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Token necessário" }), { status: 401 });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);

    // Renova se estiver perto de expirar ou se foi solicitado explicitamente
    const { token: newToken, expiresIn } = await signToken({
      sub: payload.sub,
      role: payload.role,
      ver: payload.ver,
    });

    return new Response(
      JSON.stringify({
        success: true,
        token: newToken,
        expiresIn,
        role: payload.role,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      return new Response(JSON.stringify({ error: "Token expirado. Faça login novamente." }), { status: 401 });
    }
    return new Response(JSON.stringify({ error: "Token inválido." }), { status: 401 });
  }
}
