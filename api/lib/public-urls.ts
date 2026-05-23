import { resolveCmsAssetUrl as resolveSharedCmsAssetUrl } from "@contracts/cms";

export function resolveCmsAssetUrl(url: string | null | undefined) {
  return resolveSharedCmsAssetUrl(url);
}
