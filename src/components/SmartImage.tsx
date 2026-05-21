import { useEffect, useMemo, useState } from "react";
import { resolveCmsAssetUrl } from "@/lib/assetUrl";
import { resolveMediaUrl } from "@/lib/media";

type SmartImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  loading?: "eager" | "lazy";
  decoding?: "sync" | "async" | "auto";
  fallbackLabel?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

const placeholderBackground =
  "bg-[radial-gradient(circle_at_30%_30%,rgba(74,124,89,0.18),transparent_28%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,#08111d_0%,#0f1f2b_100%)]";

function Placeholder({ label }: { label?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center ${placeholderBackground}`}>
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
      <span className="relative z-10 font-display text-white/50 tracking-[0.35em] text-[10px] md:text-xs">
        {label || "DUNASAVA"}
      </span>
    </div>
  );
}

export default function SmartImage({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  loading = "lazy",
  decoding = "async",
  fallbackLabel,
  onClick,
}: SmartImageProps) {
  const resolvedSrc = useMemo(
    () => resolveCmsAssetUrl(resolveMediaUrl(src)),
    [src],
  );
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(resolvedSrc ? "loading" : "error");

  useEffect(() => {
    setStatus(resolvedSrc ? "loading" : "error");
  }, [resolvedSrc]);

  if (!resolvedSrc || status === "error") {
    return (
      <div className={`relative overflow-hidden ${wrapperClassName}`} onClick={onClick}>
        <Placeholder label={fallbackLabel} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`} onClick={onClick}>
      {status !== "loaded" && <Placeholder label={fallbackLabel} />}
      <img
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`relative z-10 transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  );
}
