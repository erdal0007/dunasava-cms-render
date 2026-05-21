import type { ReactNode } from "react";
import { TRPCProvider } from "@/providers/trpc";

export default function CmsProviders({ children }: { children: ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
