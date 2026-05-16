import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const DUNASAVA_HOSTS = new Set(["dunasava.com", "www.dunasava.com"]);
const REMOTE_CMS_ORIGIN = "https://dunasava-cms.onrender.com";

function resolveTrpcUrl() {
  if (typeof window === "undefined") return "/api/trpc";
  const host = window.location.hostname.toLowerCase();
  if (DUNASAVA_HOSTS.has(host)) {
    return `${REMOTE_CMS_ORIGIN}/api/trpc`;
  }
  return "/api/trpc";
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: resolveTrpcUrl(),
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
