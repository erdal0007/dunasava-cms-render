import { resolveCmsAssetUrl as resolveSharedCmsAssetUrl } from '@contracts/cms';

export function resolveCmsAssetUrl(url: string | null | undefined) {
  const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  return resolveSharedCmsAssetUrl(url, { runtimeOrigin });
}
