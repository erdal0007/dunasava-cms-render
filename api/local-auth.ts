import * as cookie from "cookie";
import * as jose from "jose";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

const JWT_ALG = "HS256";

type SessionPayload = {
  sub: string;
};

function sessionSecret() {
  return new TextEncoder().encode(
    `local-auth:${env.adminEmail}:${env.adminPassword}`,
  );
}

function adminUnionId() {
  return `local-admin:${env.adminEmail.toLowerCase()}`;
}

export async function signSessionToken(): Promise<string> {
  return new jose.SignJWT({ sub: adminUnionId() } satisfies SessionPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(sessionSecret());
}

async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, sessionSecret(), {
      algorithms: [JWT_ALG],
    });
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export async function ensureAdminUser() {
  const unionId = adminUnionId();
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);

  if (existing[0]) return existing[0];

  await db.insert(schema.users).values({
    unionId,
    name: "Admin",
    email: env.adminEmail,
    role: "admin",
    lastSignInAt: new Date(),
  });

  const created = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);

  if (!created[0]) {
    throw new Error("Failed to create admin user");
  }
  return created[0];
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  const claim = await verifySessionToken(token || "");
  if (!claim || claim.sub !== adminUnionId()) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  return ensureAdminUser();
}

export function validateAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === env.adminEmail.toLowerCase() &&
    password === env.adminPassword
  );
}
