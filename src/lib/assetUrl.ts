const DEFAULT_CMS_ASSET_ORIGIN = "https://dunasava-cms.onrender.com";

export function resolveCmsAssetUrl(url: string | null | undefined) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    const origin = import.meta.env.VITE_PUBLIC_ASSET_BASE_URL?.trim() || DEFAULT_CMS_ASSET_ORIGIN;
    return new URL(url, origin).toString();
  }
  return url;
}
