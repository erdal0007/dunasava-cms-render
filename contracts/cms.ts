export const DEFAULT_CMS_ASSET_ORIGIN = 'https://dunasava-cms.onrender.com';

export const CMS_SECTION_TYPES = [
  'hero',
  'about',
  'mission',
  'production',
  'pvcGeomembrane',
  'hdpeGeomembrane',
  'geocell',
  'products',
  'sectors',
  'statistics',
  'contact',
  'content',
] as const;

export type CmsSectionType = (typeof CMS_SECTION_TYPES)[number];
export type CmsLanguage = 'sr' | 'tr' | 'en';

export type CmsLocalizedText = {
  sr: string;
  tr: string;
  en: string;
};

export type CmsSectionMeta = {
  label: CmsLocalizedText;
  navLabel?: CmsLocalizedText;
  defaultSortOrder: number;
  visibleInNav: boolean;
  layout: 'hero' | 'split' | 'gallery' | 'cards' | 'metrics' | 'contact' | 'content';
};

export type CmsSectionLike = {
  sectionType: CmsSectionType;
  slug: string;
  titleSr?: string | null;
  titleTr?: string | null;
  titleEn?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
};

export type CmsSectionRecord = CmsSectionLike & {
  id: number;
  contentSr?: string | null;
  contentTr?: string | null;
  contentEn?: string | null;
  eyebrowSr?: string | null;
  eyebrowTr?: string | null;
  eyebrowEn?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CmsNavItem = {
  href: string;
  label: string;
  sectionType: CmsSectionType;
  slug: string;
};

export const CMS_SECTION_META: Record<CmsSectionType, CmsSectionMeta> = {
  hero: {
    label: { sr: 'Hero', tr: 'Hero', en: 'Hero' },
    defaultSortOrder: 10,
    visibleInNav: false,
    layout: 'hero',
  },
  about: {
    label: { sr: 'O nama', tr: 'Hakkımızda', en: 'About' },
    navLabel: { sr: 'O nama', tr: 'Hakkımızda', en: 'About' },
    defaultSortOrder: 20,
    visibleInNav: true,
    layout: 'split',
  },
  mission: {
    label: { sr: 'Misija', tr: 'Misyon', en: 'Mission' },
    defaultSortOrder: 30,
    visibleInNav: false,
    layout: 'content',
  },
  production: {
    label: { sr: 'Proizvodnja', tr: 'Üretim', en: 'Production' },
    navLabel: { sr: 'Proizvodnja', tr: 'Üretim', en: 'Production' },
    defaultSortOrder: 40,
    visibleInNav: true,
    layout: 'split',
  },
  pvcGeomembrane: {
    label: { sr: 'PVC geomembrana', tr: 'PVC geomembran', en: 'PVC Geomembrane' },
    navLabel: { sr: 'PVC geomembrana', tr: 'PVC Geomembran', en: 'PVC Geomembrane' },
    defaultSortOrder: 50,
    visibleInNav: true,
    layout: 'gallery',
  },
  hdpeGeomembrane: {
    label: { sr: 'HDPE geomembrana', tr: 'HDPE geomembran', en: 'HDPE Geomembrane' },
    navLabel: { sr: 'HDPE geomembrana', tr: 'HDPE Geomembran', en: 'HDPE Geomembrane' },
    defaultSortOrder: 60,
    visibleInNav: true,
    layout: 'gallery',
  },
  geocell: {
    label: { sr: 'Geocell', tr: 'Geocell', en: 'Geocell' },
    navLabel: { sr: 'Geocell', tr: 'Geocell', en: 'Geocell' },
    defaultSortOrder: 70,
    visibleInNav: true,
    layout: 'gallery',
  },
  products: {
    label: { sr: 'Proizvodi', tr: 'Ürünler', en: 'Products' },
    navLabel: { sr: 'Proizvodi', tr: 'Ürünler', en: 'Products' },
    defaultSortOrder: 80,
    visibleInNav: true,
    layout: 'cards',
  },
  sectors: {
    label: { sr: 'Sektori', tr: 'Sektörler', en: 'Sectors' },
    navLabel: { sr: 'Sektori', tr: 'Sektörler', en: 'Sectors' },
    defaultSortOrder: 90,
    visibleInNav: true,
    layout: 'cards',
  },
  statistics: {
    label: { sr: 'Statistika', tr: 'İstatistikler', en: 'Statistics' },
    navLabel: { sr: 'Statistika', tr: 'İstatistikler', en: 'Statistics' },
    defaultSortOrder: 100,
    visibleInNav: true,
    layout: 'metrics',
  },
  contact: {
    label: { sr: 'Kontakt', tr: 'İletişim', en: 'Contact' },
    navLabel: { sr: 'Kontakt', tr: 'İletişim', en: 'Contact' },
    defaultSortOrder: 110,
    visibleInNav: true,
    layout: 'contact',
  },
  content: {
    label: { sr: 'Sadržaj', tr: 'İçerik', en: 'Content' },
    defaultSortOrder: 120,
    visibleInNav: false,
    layout: 'content',
  },
};

export const CMS_SECTION_ANCHORS: Record<CmsSectionType, string> = {
  hero: 'hero',
  about: 'about',
  mission: 'mission',
  production: 'production',
  pvcGeomembrane: 'pvc-geomembrane',
  hdpeGeomembrane: 'hdpe-geomembrane',
  geocell: 'geocell',
  products: 'products',
  sectors: 'sectors',
  statistics: 'statistics',
  contact: 'contact',
  content: 'content',
};

export function getCmsSectionMeta(type: CmsSectionType): CmsSectionMeta {
  return CMS_SECTION_META[type];
}

export function getCmsSectionLabel(type: CmsSectionType, language: CmsLanguage): string {
  const meta = CMS_SECTION_META[type];
  return getLocalizedValue(meta.label, language);
}

export function getCmsSectionNavLabel(type: CmsSectionType, language: CmsLanguage): string {
  const meta = CMS_SECTION_META[type];
  return getLocalizedValue(meta.navLabel || meta.label, language);
}

export function getCmsSectionAnchor(type: CmsSectionType, slug?: string | null): string {
  if (type === 'content' && slug?.trim()) {
    return slug.trim();
  }
  return CMS_SECTION_ANCHORS[type];
}

export function getCmsSectionNavLabelForSection(section: CmsSectionLike, language: CmsLanguage): string {
  if (section.sectionType === 'content') {
    return pickLocalizedText(section, 'title', language, section.slug);
  }
  return getCmsSectionNavLabel(section.sectionType, language);
}

export function buildCmsSectionNavItems(
  sections: CmsSectionLike[],
  language: CmsLanguage
): CmsNavItem[] {
  const items: CmsNavItem[] = [];
  const seen = new Set<string>();

  const orderedSections = [...sections]
    .filter((section) => section.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  for (const section of orderedSections) {
    if (section.sectionType !== 'content' && !CMS_SECTION_META[section.sectionType].visibleInNav) {
      continue;
    }

    const href = `#${getCmsSectionAnchor(section.sectionType, section.slug)}`;
    if (seen.has(href)) {
      continue;
    }
    seen.add(href);

    items.push({
      href,
      label: getCmsSectionNavLabelForSection(section, language),
      sectionType: section.sectionType,
      slug: section.slug,
    });
  }

  return items;
}

export function getCmsVisibleNavSectionTypes(): CmsSectionType[] {
  return CMS_SECTION_TYPES.filter((type) => CMS_SECTION_META[type].visibleInNav);
}

export function getDefaultCmsSectionRows(): CmsSectionLike[] {
  return CMS_SECTION_TYPES.filter((type) => type !== 'content').map((sectionType) => ({
    sectionType,
    slug: CMS_SECTION_ANCHORS[sectionType],
    isActive: true,
    sortOrder: CMS_SECTION_META[sectionType].defaultSortOrder,
  }));
}

export function getLocalizedValue<T extends Record<string, unknown>>(
  record: T | null | undefined,
  language: CmsLanguage,
  fallback = ''
): string {
  if (!record) return fallback;
  const key = language === 'sr' ? 'sr' : language === 'tr' ? 'tr' : 'en';
  const value = record[key] ?? record.en ?? fallback;
  return typeof value === 'string' ? value : fallback;
}

export function pickLocalizedText<T extends Record<string, unknown>>(
  record: T | null | undefined,
  baseKey: string,
  language: CmsLanguage,
  fallback = ''
): string {
  if (!record) return fallback;
  const suffix = language === 'sr' ? 'Sr' : language === 'tr' ? 'Tr' : 'En';
  const preferred = record[`${baseKey}${suffix}`];
  const english = record[`${baseKey}En`];
  const fallbackValue = record[`${baseKey}Tr`] ?? record[`${baseKey}Sr`] ?? fallback;

  const value = preferred ?? english ?? fallbackValue;
  return typeof value === 'string' ? value : fallback;
}

function normalizeOrigin(origin?: string | null) {
  return origin?.trim().replace(/\/+$/, '') || '';
}

export function isLocalOrigin(origin?: string | null) {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (parsed.protocol === 'file:') return false;
    return ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function getCmsAssetOriginCandidates(options?: {
  runtimeOrigin?: string | null;
  assetOrigin?: string | null;
}) {
  const candidates: string[] = [];
  const add = (candidate?: string | null) => {
    const normalized = normalizeOrigin(candidate);
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  add(options?.assetOrigin);
  if (isLocalOrigin(options?.runtimeOrigin)) {
    add(options?.runtimeOrigin);
  }
  add(DEFAULT_CMS_ASSET_ORIGIN);

  return candidates;
}

function getUploadPath(src: string) {
  try {
    const parsed = new URL(src, DEFAULT_CMS_ASSET_ORIGIN);
    return parsed.pathname.startsWith('/uploads/') ? parsed.pathname : '';
  } catch {
    return src.startsWith('/uploads/') ? src : '';
  }
}

export function resolveCmsAssetUrl(
  url: string | null | undefined,
  options?: { runtimeOrigin?: string | null; assetOrigin?: string | null }
) {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const [origin] = getCmsAssetOriginCandidates(options);
    return new URL(url, origin || DEFAULT_CMS_ASSET_ORIGIN).toString();
  }
  return url;
}

export function buildCmsAssetCandidates(
  src: string,
  options?: { runtimeOrigin?: string | null; assetOrigin?: string | null }
) {
  if (!src) return [];
  if (src.startsWith('data:')) return [src];

  const uploadPath = getUploadPath(src);
  if (!uploadPath) return [src];

  const candidates: string[] = [];
  const add = (candidate: string) => {
    if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
  };

  if (/^(https?:)?\/\//i.test(src)) {
    add(src);
  }

  for (const origin of getCmsAssetOriginCandidates(options)) {
    try {
      add(new URL(uploadPath, origin).toString());
    } catch {
      // Ignore invalid origins and continue with the next fallback.
    }
  }

  if (options?.runtimeOrigin) {
    try {
      add(new URL(uploadPath, options.runtimeOrigin).toString());
    } catch {
      // Ignore invalid runtime origins and keep the remaining fallbacks.
    }
  }

  add(src);
  return candidates;
}
