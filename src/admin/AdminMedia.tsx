import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Copy, ImageOff, Plus, RefreshCw, Trash2 } from "lucide-react";
import { resolveCmsAssetUrl } from "@/lib/assetUrl";
import WatermarkedImage from "@/components/WatermarkedImage";
import { MEDIA_CATEGORY_OPTIONS } from "@/lib/galleryAssets";

function guessMimeType(url: string) {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

function fileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const part = pathname.split("/").pop() || "image";
    return part || "image";
  } catch {
    return "image";
  }
}

type UrlCheckStatus = "idle" | "checking" | "ok" | "broken";

function shouldResizeImage(file: File) {
  if (!file.type.startsWith("image/")) return false;
  if (file.type === "image/svg+xml") return false;
  if (file.type === "image/gif") return false;
  return true;
}

function shouldWatermarkImage(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/gif";
}

async function resizeImageFile(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.88) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Görsel okunamadı."));
    });
    img.src = objectUrl;
    await loaded;

    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    const targetWidth = Math.max(1, Math.round(img.width * ratio));
    const targetHeight = Math.max(1, Math.round(img.height * ratio));

    if (ratio >= 1) return file;

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), file.type === "image/jpeg" ? "image/jpeg" : "image/webp", quality);
    });
    if (!blob) return file;

    const resizedName = file.name.replace(/\.[a-zA-Z0-9]+$/, file.type === "image/jpeg" ? ".jpg" : ".webp");
    return new File([blob], resizedName, { type: blob.type || file.type, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function addWatermarkToRasterFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Görsel okunamadı."));
    });
    img.src = objectUrl;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0);

    const fontSize = Math.max(20, Math.round(Math.min(img.width, img.height) * 0.03));
    const bandHeight = Math.max(42, Math.round(fontSize * 2.1));
    const padding = Math.round(fontSize * 0.75);

    ctx.save();
    ctx.translate(img.width / 2, img.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const stepX = Math.max(160, fontSize * 9);
    const stepY = Math.max(120, fontSize * 5.5);
    for (let y = -img.height; y <= img.height; y += stepY) {
      for (let x = -img.width; x <= img.width; x += stepX) {
        ctx.fillText("DUNASAVA", x, y);
      }
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.fillRect(0, img.height - bandHeight, Math.min(img.width, Math.max(260, fontSize * 12)), bandHeight);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText("DUNASAVA", padding, img.height - bandHeight / 2);
    ctx.restore();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), file.type === "image/png" ? "image/png" : "image/webp", 0.92);
    });
    if (!blob) return file;

    const extension = file.type === "image/png" ? ".png" : ".webp";
    const nextName = file.name.replace(/\.[a-zA-Z0-9]+$/, extension);
    return new File([blob], nextName, { type: blob.type || file.type, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function addWatermarkToSvgFile(file: File) {
  const svgText = await file.text();
  if (svgText.includes("DUNASAVA")) return file;
  const watermark = `
    <g opacity="0.22">
      <text x="50%" y="94%" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" letter-spacing="6">DUNASAVA</text>
    </g>`;
  const nextSvg = svgText.replace(/<\/svg>\s*$/i, `${watermark}</svg>`);
  return new File([nextSvg], file.name, { type: file.type, lastModified: Date.now() });
}

async function watermarkFile(file: File) {
  if (!shouldWatermarkImage(file)) return file;
  if (file.type === "image/svg+xml") return addWatermarkToSvgFile(file);
  if (file.type === "image/gif") return file;
  return addWatermarkToRasterFile(file);
}

function MediaThumb({
  src,
  alt,
  broken,
  onBroken,
}: {
  src: string;
  alt: string;
  broken: boolean;
  onBroken: () => void;
}) {
  if (broken) {
    return (
      <div className="w-full h-40 rounded mb-3 bg-[#0A1628] border border-dashed border-[#29445B] flex flex-col items-center justify-center gap-2 text-[#8A9BAE]">
        <ImageOff size={22} />
        <span className="text-[11px] text-center px-3">Görsel yüklenemedi</span>
      </div>
    );
  }

  return (
    <WatermarkedImage
      src={src}
      alt={alt}
      className="w-full h-40 rounded mb-3 bg-[#0A1628]"
      imgClassName="w-full h-40 object-cover rounded bg-[#0A1628]"
      onError={onBroken}
    />
  );
}

export default function AdminMedia() {
  const utils = trpc.useUtils();
  const { data: assetList, isLoading, error, refetch } = trpc.cms.assetList.useQuery();
  const [brokenAssets, setBrokenAssets] = useState<Record<number, boolean>>({});
  const [urlChecks, setUrlChecks] = useState<Record<number, UrlCheckStatus>>({});
  const createMut = trpc.cms.assetCreate.useMutation({
    onSuccess: () => {
      utils.cms.assetList.invalidate();
      setUrl("");
      setCategory("general");
    },
  });
  const visibilityMut = trpc.cms.assetSetVisibility.useMutation({
    onSuccess: async (_, vars) => {
      await utils.cms.assetList.invalidate();
      toast.success(vars.isVisible ? "Görsel yeniden görünür yapıldı." : "Görsel panelde gizlendi.");
    },
    onError: (err) => {
      toast.error(`Görsel durumu değiştirilemedi: ${err.message}`);
    },
  });
  const deleteMut = trpc.cms.assetDelete.useMutation({
    onSuccess: async (data) => {
      await utils.cms.assetList.invalidate();
      toast.success(data?.hidden ? "Library görseli gizlendi." : "Medya kaydı silindi.");
    },
    onError: (err) => {
      toast.error(`Medya silinemedi: ${err.message}`);
    },
  });
  const uploadMut = trpc.cms.assetUpload.useMutation({
    onSuccess: () => {
      utils.cms.assetList.invalidate();
      setUploadStatus("Yükleme başarılı.");
      setSelectedFile(null);
      toast.success("Görsel yüklendi.");
    },
    onError: (err) => {
      setUploadStatus(`Yükleme hatası: ${err.message}`);
      toast.error(`Yükleme hatası: ${err.message}`);
    },
  });

  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    setBrokenAssets({});
    setUrlChecks({});
  }, [assetList]);

  const allAssets = assetList || [];
  const visibleAssets = useMemo(
    () => allAssets.filter((asset) => asset.isVisible !== false),
    [allAssets]
  );
  const hiddenAssets = useMemo(
    () => allAssets.filter((asset) => asset.isVisible === false),
    [allAssets]
  );
  const uploadAssets = useMemo(
    () => allAssets.filter((asset) => asset.source !== "library"),
    [allAssets]
  );
  const libraryAssets = useMemo(
    () => allAssets.filter((asset) => asset.source === "library"),
    [allAssets]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assetList || [];
    return (assetList || []).filter(
      (a) =>
        a.url.toLowerCase().includes(q) ||
        a.originalName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.source || "").toLowerCase().includes(q) ||
        (a.isVisible === false ? "hidden" : "visible").includes(q)
    );
  }, [assetList, search]);

  const addAsset = () => {
    if (!url.trim()) return;
    const originalName = fileNameFromUrl(url.trim());
    createMut.mutate({
      filename: originalName,
      originalName,
      mimeType: guessMimeType(url.trim()),
      size: 0,
      url: url.trim(),
      category,
    });
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setUploadStatus("Dosya yükleniyor...");

    const resizedFile = shouldResizeImage(selectedFile)
      ? await resizeImageFile(selectedFile).catch(() => selectedFile)
      : selectedFile;
    const fileToUpload = await watermarkFile(resizedFile).catch(() => resizedFile);

    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Dosya okunamadı."));
      reader.readAsDataURL(fileToUpload);
    });

    uploadMut.mutate({
      fileName: fileToUpload.name,
      mimeType: fileToUpload.type || selectedFile.type || "image/jpeg",
      dataBase64,
      category,
    });
  };

  const validateAssetUrl = (assetId: number, url: string) => {
    setUrlChecks((current) => ({ ...current, [assetId]: "checking" }));
    const resolvedUrl = resolveCmsAssetUrl(url);
    const image = new Image();
    image.onload = () => {
      setUrlChecks((current) => ({ ...current, [assetId]: "ok" }));
    };
    image.onerror = () => {
      setUrlChecks((current) => ({ ...current, [assetId]: "broken" }));
    };
    image.src = resolvedUrl;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-white mb-1">Medya Yönetimi</h1>
        <p className="text-[#8A9BAE] text-sm">
          Görsel URL ekleyin, kopyalayın ve tüm içeriklerde hızlı seçin.
        </p>
        <p className="text-[#8A9BAE] text-xs mt-1">
          Büyük görseller otomatik küçültülür. PVC, HDPE ve GEOCELL kategorilerine eklenen görseller ilgili site bölümünde yayınlanır.
        </p>
      </div>

      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-4">
          <div className="rounded-lg border border-[#1A3A4A] bg-[#0A1628] px-3 py-2">
            <div className="text-[11px] text-[#8A9BAE]">Toplam</div>
            <div className="text-lg text-white font-medium">{allAssets.length}</div>
          </div>
          <div className="rounded-lg border border-[#1A3A4A] bg-[#0A1628] px-3 py-2">
            <div className="text-[11px] text-[#8A9BAE]">Görünür</div>
            <div className="text-lg text-emerald-300 font-medium">{visibleAssets.length}</div>
          </div>
          <div className="rounded-lg border border-[#1A3A4A] bg-[#0A1628] px-3 py-2">
            <div className="text-[11px] text-[#8A9BAE]">Gizli</div>
            <div className="text-lg text-amber-300 font-medium">{hiddenAssets.length}</div>
          </div>
          <div className="rounded-lg border border-[#1A3A4A] bg-[#0A1628] px-3 py-2">
            <div className="text-[11px] text-[#8A9BAE]">Kütüphane</div>
            <div className="text-lg text-white font-medium">{libraryAssets.length}</div>
          </div>
          <div className="rounded-lg border border-[#1A3A4A] bg-[#0A1628] px-3 py-2 col-span-2 md:col-span-1">
            <div className="text-[11px] text-[#8A9BAE]">Yükleme</div>
            <div className="text-lg text-white font-medium">{uploadAssets.length}</div>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://.../resim.jpg veya /assets/images/..."
            className="md:col-span-3 w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
          >
            {MEDIA_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={addAsset}
          className="mt-3 flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69] transition-colors"
        >
          <Plus size={15} /> Görseli Kaydet
        </button>

        <div className="mt-4 pt-4 border-t border-[#1A3A4A]">
          <div className="text-[#8A9BAE] text-xs mb-2">Dosya Yükle (jpg/png/webp/gif/svg)</div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-[#8A9BAE] text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-[#1A3A4A] file:text-[#E6EEF7]"
            />
            <button
              onClick={uploadFile}
              disabled={!selectedFile || uploadMut.isPending}
              className="flex items-center gap-2 bg-[#1A3A4A] text-[#E6EEF7] px-4 py-2 rounded-lg text-sm hover:bg-[#24485B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus size={15} /> {uploadMut.isPending ? "Yükleniyor..." : "Dosyayı Yükle"}
            </button>
          </div>
          {uploadStatus && (
            <div className="mt-2 text-xs text-[#8A9BAE]">{uploadStatus}</div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="URL / isim / kategori ara..."
          className="w-full bg-[#0D1F2D] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="text-[#8A9BAE] text-sm">Yükleniyor...</div>
        ) : error ? (
          <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
            <div className="font-medium">Medya listesi yüklenemedi.</div>
            <div className="mt-1 text-sm text-rose-100/80">{error.message}</div>
            <button
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-500/20 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/30"
            >
              <RefreshCw size={12} />
              Tekrar dene
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-[#1A3A4A] bg-[#0D1F2D] p-6 text-[#8A9BAE]">
            <div className="text-white font-medium">Henüz medya kaydı yok.</div>
            <p className="mt-2 text-sm leading-6">
              İlk görseli üstteki URL alanı veya dosya yükleme bölümüyle ekleyin. Kaydettikten sonra burada görünecek ve sayfa bölümlerinde kullanılabilecek.
            </p>
          </div>
        ) : (
          filtered.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl p-3 ${
                a.isVisible === false
                  ? "bg-[#0B1522] border border-amber-500/30"
                  : "bg-[#0D1F2D] border border-[#1A3A4A]"
              }`}
            >
              <MediaThumb
                src={resolveCmsAssetUrl(a.url)}
                alt={a.originalName}
                broken={Boolean(brokenAssets[a.id])}
                onBroken={() => setBrokenAssets((current) => ({ ...current, [a.id]: true }))}
              />
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-white text-xs truncate">{a.originalName}</div>
                <div className="flex flex-wrap justify-end gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A3A4A] text-[#CFE0EE] uppercase">
                    {a.source === "library" ? "library" : "upload"}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                      a.isVisible === false
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {a.isVisible === false ? "gizli" : "görünür"}
                  </span>
                </div>
              </div>
              <div className="text-[#8A9BAE] text-[11px] mb-2">{a.category}</div>
              <div className="text-[#8A9BAE] text-[11px] break-all mb-2">{a.url}</div>
              <div className="flex items-center gap-2 mb-3 text-[11px]">
                {urlChecks[a.id] === "ok" && (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 size={12} /> URL geçerli
                  </span>
                )}
                {urlChecks[a.id] === "broken" && (
                  <span className="inline-flex items-center gap-1 text-rose-300">
                    <AlertTriangle size={12} /> URL kırık
                  </span>
                )}
                {urlChecks[a.id] === "checking" && (
                  <span className="inline-flex items-center gap-1 text-[#8A9BAE]">
                    <RefreshCw size={12} className="animate-spin" /> Kontrol ediliyor
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => copy(a.url)}
                  className="flex items-center gap-1 bg-[#1A3A4A] text-[#E6EEF7] px-2 py-1.5 rounded text-xs"
                >
                  <Copy size={12} /> URL Kopyala
                </button>
                <button
                  onClick={() => validateAssetUrl(a.id, a.url)}
                  className="flex items-center gap-1 bg-[#24485B] text-[#E6EEF7] px-2 py-1.5 rounded text-xs"
                >
                  <RefreshCw size={12} /> Doğrula
                </button>
                {a.source === "library" ? (
                  <button
                    onClick={() => visibilityMut.mutate({ id: a.id, isVisible: a.isVisible === false })}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs ${
                      a.isVisible === false
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {a.isVisible === false ? "Yayınla" : "Gizle"}
                  </button>
                ) : (
                  <button
                    onClick={() => deleteMut.mutate({ id: a.id })}
                    className="flex items-center gap-1 bg-red-500/15 text-red-300 px-2 py-1.5 rounded text-xs"
                  >
                    <Trash2 size={12} /> Sil
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
