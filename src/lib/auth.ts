import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const domain = process.env.AUTH0_DOMAIN?.trim();
const audience = process.env.AUTH0_AUDIENCE?.trim();

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
if (domain) {
  jwks = createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`));
}

export async function ensureAuth(req: Request): Promise<Response | void> {
  if (process.env.SKIP_AUTH === "true" || !domain || !audience || !jwks) {
    return; // skip in local dev by default
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const token = auth.slice(7);
  try {
    await jwtVerify(token, jwks, {
      issuer: `https://${domain}/`,
      audience,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}

export type AuthPayload = JWTPayload;

