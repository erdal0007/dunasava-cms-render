import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getUploadsDir } from "./lib/uploads";
import { resolveCmsAssetUrl } from "./lib/public-urls";
import fs from "fs/promises";
import path from "path";
import {
  sections,
  products,
  sectors,
  translations,
  siteSettings,
  assets,
  statistics,
} from "@db/schema";
import { eq, asc, desc } from "drizzle-orm";

async function translateTextWithOpenAI(text: string, targetLang: "English" | "Serbian") {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You are a professional website localization translator. Return only the translated text with no quotes or commentary.",
        },
        {
          role: "user",
          content: `Translate this Turkish text to ${targetLang}. Keep tone and meaning suitable for a corporate website:\n\n${text}`,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI translate error: ${response.status} ${errText}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
  };
  const translated = (data.output_text || "").trim();
  if (!translated) {
    throw new Error("OpenAI returned an empty translation.");
  }
  return translated;
}

export const cmsRouter = createRouter({
  autoTranslate: adminQuery
    .input(
      z.object({
        text: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const [en, sr] = await Promise.all([
        translateTextWithOpenAI(input.text, "English"),
        translateTextWithOpenAI(input.text, "Serbian"),
      ]);
      return { en, sr };
    }),

  // ========== TRANSLATIONS ==========
  translationList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(translations).orderBy(asc(translations.category), asc(translations.key));
  }),

  translationByCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(translations)
        .where(eq(translations.category, input.category))
        .orderBy(asc(translations.key));
    }),

  translationCreate: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        sr: z.string().optional(),
        tr: z.string().optional(),
        en: z.string().min(1),
        category: z.string().default("general"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(translations).values(input);
      return { success: true };
    }),

  translationUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        key: z.string().min(1),
        sr: z.string().optional(),
        tr: z.string().optional(),
        en: z.string().min(1),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(translations).set(data).where(eq(translations.id, id));
      return { success: true };
    }),

  translationDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(translations).where(eq(translations.id, input.id));
      return { success: true };
    }),

  // ========== SECTIONS ==========
  sectionList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(sections).orderBy(asc(sections.sortOrder));
  }),

  sectionByType: publicQuery
    .input(z.object({ type: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(sections)
        .where(eq(sections.sectionType, input.type as any))
        .orderBy(asc(sections.sortOrder));
    }),

  sectionCreate: adminQuery
    .input(
      z.object({
        slug: z.string().min(1),
        titleSr: z.string().optional(),
        titleTr: z.string().optional(),
        titleEn: z.string().min(1),
        contentSr: z.string().optional(),
        contentTr: z.string().optional(),
        contentEn: z.string().optional(),
        eyebrowSr: z.string().optional(),
        eyebrowTr: z.string().optional(),
        eyebrowEn: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
        sectionType: z.enum(["hero", "about", "mission", "products", "sectors", "production", "statistics", "contact"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(sections).values(input);
      return { success: true };
    }),

  sectionUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1),
        titleSr: z.string().optional(),
        titleTr: z.string().optional(),
        titleEn: z.string().min(1),
        contentSr: z.string().optional(),
        contentTr: z.string().optional(),
        contentEn: z.string().optional(),
        eyebrowSr: z.string().optional(),
        eyebrowTr: z.string().optional(),
        eyebrowEn: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number(),
        isActive: z.boolean(),
        sectionType: z.enum(["hero", "about", "mission", "products", "sectors", "production", "statistics", "contact"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(sections).set(data).where(eq(sections.id, id));
      return { success: true };
    }),

  sectionDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(sections).where(eq(sections.id, input.id));
      return { success: true };
    }),

  sectionToggle: adminQuery
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(sections).set({ isActive: input.isActive }).where(eq(sections.id, input.id));
      return { success: true };
    }),

  // ========== PRODUCTS ==========
  productList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(products).orderBy(asc(products.sortOrder));
  }),

  productCreate: adminQuery
    .input(
      z.object({
        slug: z.string().min(1),
        titleSr: z.string().optional(),
        titleTr: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionSr: z.string().optional(),
        descriptionTr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const normalizedInput = {
        ...input,
        titleEn:
          input.titleEn?.trim() ||
          input.titleTr?.trim() ||
          input.titleSr?.trim() ||
          input.slug.trim(),
      };
      await db.insert(products).values(normalizedInput);
      return { success: true };
    }),

  productUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1),
        titleSr: z.string().optional(),
        titleTr: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionSr: z.string().optional(),
        descriptionTr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(products)
        .set({
          ...data,
          titleEn:
            data.titleEn?.trim() ||
            data.titleTr?.trim() ||
            data.titleSr?.trim() ||
            data.slug.trim(),
        })
        .where(eq(products.id, input.id));
      return { success: true };
    }),

  productDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  // ========== SECTORS ==========
  sectorList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(sectors).orderBy(asc(sectors.sortOrder));
  }),

  sectorCreate: adminQuery
    .input(
      z.object({
        slug: z.string().min(1),
        number: z.string().min(1),
        titleSr: z.string().optional(),
        titleTr: z.string().optional(),
        titleEn: z.string().min(1),
        descriptionSr: z.string().optional(),
        descriptionTr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        imageUrl2: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(sectors).values(input);
      return { success: true };
    }),

  sectorUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1),
        number: z.string().min(1),
        titleSr: z.string().optional(),
        titleTr: z.string().optional(),
        titleEn: z.string().min(1),
        descriptionSr: z.string().optional(),
        descriptionTr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        imageUrl2: z.string().optional(),
        sortOrder: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(sectors).set(data).where(eq(sectors.id, input.id));
      return { success: true };
    }),

  sectorDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(sectors).where(eq(sectors.id, input.id));
      return { success: true };
    }),

  // ========== STATISTICS ==========
  statisticList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(statistics).orderBy(asc(statistics.sortOrder));
  }),

  statisticCreate: adminQuery
    .input(
      z.object({
        value: z.string().min(1),
        suffix: z.string().default(""),
        labelSr: z.string().optional(),
        labelTr: z.string().optional(),
        labelEn: z.string().min(1),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(statistics).values(input);
      return { success: true };
    }),

  statisticUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        value: z.string().min(1),
        suffix: z.string(),
        labelSr: z.string().optional(),
        labelTr: z.string().optional(),
        labelEn: z.string().min(1),
        sortOrder: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(statistics).set(data).where(eq(statistics.id, input.id));
      return { success: true };
    }),

  statisticDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(statistics).where(eq(statistics.id, input.id));
      return { success: true };
    }),

  // ========== SITE SETTINGS ==========
  settingList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(siteSettings).orderBy(asc(siteSettings.group));
  }),

  settingUpsert: adminQuery
    .input(z.object({ key: z.string().min(1), value: z.string().optional(), group: z.string().default("general") }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, input.key));
      if (existing.length > 0) {
        await db.update(siteSettings).set({ value: input.value, group: input.group }).where(eq(siteSettings.key, input.key));
      } else {
        await db.insert(siteSettings).values(input);
      }
      return { success: true };
    }),

  // ========== ASSETS ==========
  assetList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(assets).orderBy(desc(assets.createdAt));
  }),

  assetCreate: adminQuery
    .input(
      z.object({
        filename: z.string().min(1),
        originalName: z.string().min(1),
        mimeType: z.string().min(1),
        size: z.number(),
        url: z.string().min(1),
        category: z.string().default("general"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(assets).values(input);
      return { success: true };
    }),

  assetUpload: adminQuery
    .input(
      z.object({
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        dataBase64: z.string().min(1),
        category: z.string().default("general"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const extensionFromMime = (() => {
        if (input.mimeType === "image/png") return ".png";
        if (input.mimeType === "image/webp") return ".webp";
        if (input.mimeType === "image/gif") return ".gif";
        if (input.mimeType === "image/svg+xml") return ".svg";
        return ".jpg";
      })();

      const safeBaseName = input.fileName
        .replace(/\.[a-zA-Z0-9]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "image";

      const filename = `${Date.now()}-${safeBaseName}${extensionFromMime}`;
      const uploadsDir = getUploadsDir();
      await fs.mkdir(uploadsDir, { recursive: true });

      const rawBase64 = input.dataBase64.includes(",")
        ? input.dataBase64.split(",")[1]
        : input.dataBase64;
      const buffer = Buffer.from(rawBase64, "base64");
      const targetPath = path.join(uploadsDir, filename);

      await fs.writeFile(targetPath, buffer);

      const url = resolveCmsAssetUrl(`/uploads/${filename}`);
      await db.insert(assets).values({
        filename,
        originalName: input.fileName,
        mimeType: input.mimeType,
        size: buffer.length,
        url,
        category: input.category,
      });

      return { success: true, url };
    }),

  assetDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(assets).where(eq(assets.id, input.id));
      return { success: true };
    }),
});
