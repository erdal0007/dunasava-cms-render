import { useMemo } from 'react';
import { trpc } from '@/providers/trpc';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';

export const MEDIA_CATEGORY_OPTIONS = [
  { value: 'general', label: 'Genel' },
  { value: 'hero', label: 'Hero / Ana görsel' },
  { value: 'product', label: 'Ürün kartı' },
  { value: 'sector', label: 'Sektör kartı' },
  { value: 'section', label: 'Sayfa bölümü' },
  { value: 'pvc-geomembrane', label: 'PVC Geomembran galerisi' },
  { value: 'hdpe-geomembrane', label: 'HDPE Geomembran galerisi' },
  { value: 'geocell', label: 'GEOCELL galerisi' },
  { value: 'footer', label: 'Footer' },
] as const;

export const PROJECT_GALLERY_CATEGORIES = [
  'pvc-geomembrane',
  'hdpe-geomembrane',
  'geocell',
] as const;

export type ProjectGalleryCategory = (typeof PROJECT_GALLERY_CATEGORIES)[number];

export type GalleryImage = {
  key: string;
  src: string;
  alt: string;
};

export function useGalleryImages(
  category: ProjectGalleryCategory,
  fallbackImages: GalleryImage[],
  fallbackAlt: string
) {
  const { data: assetList } = trpc.cms.assetList.useQuery();

  return useMemo(() => {
    if (!assetList) return fallbackImages;

    return assetList
      .filter((asset) => asset.isVisible !== false)
      .filter((asset) => asset.category === category)
      .sort((a, b) => a.id - b.id)
      .map((asset, index) => ({
        key: `asset-${asset.id}`,
        src: resolveCmsAssetUrl(asset.url),
        alt: asset.originalName || `${fallbackAlt} ${index + 1}`,
      }));
  }, [assetList, category, fallbackAlt, fallbackImages]);
}
