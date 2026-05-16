import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

const defaultAllowedOrigins = new Set([
  "https://dunasava.com",
  "https://www.dunasava.com",
  "https://dunasava-cms.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of configuredOrigins) {
  defaultAllowedOrigins.add(origin);
}

function applyCorsHeaders(headers: Headers, origin: string) {
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-trpc-source",
  );
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Max-Age", "86400");
  headers.append("Vary", "Origin");
}

app.use("/api/*", async (c, next) => {
  const origin = c.req.header("origin");
  const isAllowed = !!origin && defaultAllowedOrigins.has(origin);

  if (isAllowed && origin) {
    applyCorsHeaders(c.res.headers, origin);
  }

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();

  if (isAllowed && origin) {
    applyCorsHeaders(c.res.headers, origin);
  }
});

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
