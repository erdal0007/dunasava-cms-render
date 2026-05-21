const REMOTE_CMS_ORIGIN = import.meta.env.VITE_CMS_ORIGIN || "https://dunasava-cms.onrender.com";

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function normalizeRelativeUploadPath(value: string) {
  if (value.startsWith("uploads/")) return `/${value}`;
  if (value.startsWith("assets/")) return `/${value}`;
  return value;
}

export function resolveMediaUrl(src?: string | null) {
  if (!src) return "";

  const trimmed = src.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const normalized = normalizeRelativeUploadPath(trimmed);

  if (isHttpUrl(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/uploads/")) {
    return normalized;
  }

  return normalized;
}

export function getUploadsProxyOrigin() {
  return REMOTE_CMS_ORIGIN;
}
