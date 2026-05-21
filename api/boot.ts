import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { ensureDatabaseReady } from "./lib/bootstrap";

const app = new Hono<{ Bindings: HttpBindings }>();
const UPLOADS_ORIGIN = process.env.UPLOADS_ORIGIN || "https://dunasava-cms.onrender.com";

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

app.on(["GET", "HEAD"], "/uploads/*", async (c) => {
  const incoming = new URL(c.req.url);
  const target = new URL(incoming.pathname + incoming.search, UPLOADS_ORIGIN);

  try {
    const upstream = await fetch(target, {
      headers: {
        accept: c.req.header("accept") || "image/*,*/*;q=0.8",
      },
    });

    const contentType = upstream.headers.get("content-type") || "";
    if (upstream.ok && contentType.startsWith("image/")) {
      const headers = new Headers(upstream.headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(upstream.body, {
        status: upstream.status,
        headers,
      });
    }
  } catch {
    // Fall through to the placeholder below.
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="DunaSava">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A1628"/>
        <stop offset="100%" stop-color="#13283D"/>
      </linearGradient>
      <radialGradient id="r" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#4A7C59" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#4A7C59" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <rect width="1200" height="800" fill="url(#r)"/>
    <g opacity="0.22">
      <path d="M120 640h960" stroke="#ffffff" stroke-width="1" stroke-dasharray="4 10"/>
      <path d="M170 520h860" stroke="#ffffff" stroke-width="1" stroke-dasharray="4 10"/>
      <path d="M220 400h760" stroke="#ffffff" stroke-width="1" stroke-dasharray="4 10"/>
    </g>
    <text x="50%" y="52%" text-anchor="middle" fill="#E8E4DF" fill-opacity="0.45" font-family="Arial, sans-serif" font-size="72" letter-spacing="12">DUNASAVA</text>
  </svg>`;

  return c.body(svg, 200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "no-cache",
  });
});

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
  await ensureDatabaseReady();
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
