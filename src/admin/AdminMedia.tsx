import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { Copy, Plus, Trash2 } from "lucide-react";
import SmartImage from "@/components/SmartImage";

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

export default function AdminMedia() {
  const utils = trpc.useUtils();
  const { data: assetList, isLoading } = trpc.cms.assetList.useQuery();
  const createMut = trpc.cms.assetCreate.useMutation({
    onSuccess: () => {
      utils.cms.assetList.invalidate();
      setUrl("");
      setCategory("general");
    },
  });
  const deleteMut = trpc.cms.assetDelete.useMutation({
    onSuccess: async () => {
      await utils.cms.assetList.invalidate();
      toast.success("Medya kaydı silindi.");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assetList || [];
    return (assetList || []).filter(
      (a) =>
        a.url.toLowerCase().includes(q) ||
        a.originalName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
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

    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Dosya okunamadı."));
      reader.readAsDataURL(selectedFile);
    });

    uploadMut.mutate({
      fileName: selectedFile.name,
      mimeType: selectedFile.type || "image/jpeg",
      dataBase64,
      category,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-white mb-1">Medya Yönetimi</h1>
        <p className="text-[#8A9BAE] text-sm">
          Görsel URL ekleyin, kopyalayın ve tüm içeriklerde hızlı seçin.
        </p>
      </div>

      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-4 mb-6">
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
            <option value="general">general</option>
            <option value="hero">hero</option>
            <option value="product">product</option>
            <option value="sector">sector</option>
            <option value="section">section</option>
            <option value="footer">footer</option>
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
        ) : (
          filtered.map((a) => (
            <div key={a.id} className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-3">
              <SmartImage
                src={a.url}
                alt={a.originalName}
                wrapperClassName="w-full h-40 rounded mb-3"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fallbackLabel="DUNASAVA"
              />
              <div className="text-white text-xs mb-1 truncate">{a.originalName}</div>
              <div className="text-[#8A9BAE] text-[11px] mb-2">{a.category}</div>
              <div className="text-[#8A9BAE] text-[11px] break-all mb-3">{a.url}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copy(a.url)}
                  className="flex items-center gap-1 bg-[#1A3A4A] text-[#E6EEF7] px-2 py-1.5 rounded text-xs"
                >
                  <Copy size={12} /> URL Kopyala
                </button>
                <button
                  onClick={() => deleteMut.mutate({ id: a.id })}
                  className="flex items-center gap-1 bg-red-500/15 text-red-300 px-2 py-1.5 rounded text-xs"
                >
                  <Trash2 size={12} /> Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
