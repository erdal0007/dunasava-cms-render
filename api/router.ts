import { authRouter } from "./auth-router";
import { cmsRouter } from "./cms-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  cms: cmsRouter,
});

export type AppRouter = typeof appRouter;
