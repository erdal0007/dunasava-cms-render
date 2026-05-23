import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
} from "drizzle-orm/mysql-core";
import { CMS_SECTION_TYPES } from "@contracts/cms";

// Users (auth)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Translations - 3 language support (SR, TR, EN)
export const translations = mysqlTable("translations", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull(),
  sr: text("sr"),
  tr: text("tr"),
  en: text("en").notNull(),
  category: varchar("category", { length: 100 }).default("general").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;

// Site Sections - Manageable content sections
export const sections = mysqlTable("sections", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  titleSr: text("titleSr"),
  titleTr: text("titleTr"),
  titleEn: text("titleEn").notNull(),
  contentSr: text("contentSr"),
  contentTr: text("contentTr"),
  contentEn: text("contentEn"),
  eyebrowSr: text("eyebrowSr"),
  eyebrowTr: text("eyebrowTr"),
  eyebrowEn: text("eyebrowEn"),
  imageUrl: text("imageUrl"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sectionType: mysqlEnum("sectionType", CMS_SECTION_TYPES).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

// Products
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  titleSr: text("titleSr"),
  titleTr: text("titleTr"),
  titleEn: text("titleEn").notNull(),
  descriptionSr: text("descriptionSr"),
  descriptionTr: text("descriptionTr"),
  descriptionEn: text("descriptionEn"),
  imageUrl: text("imageUrl"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Sectors
export const sectors = mysqlTable("sectors", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  number: varchar("number", { length: 10 }).notNull(),
  titleSr: text("titleSr"),
  titleTr: text("titleTr"),
  titleEn: text("titleEn").notNull(),
  descriptionSr: text("descriptionSr"),
  descriptionTr: text("descriptionTr"),
  descriptionEn: text("descriptionEn"),
  imageUrl: text("imageUrl"),
  imageUrl2: text("imageUrl2"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Sector = typeof sectors.$inferSelect;
export type InsertSector = typeof sectors.$inferInsert;

// Site Settings
export const siteSettings = mysqlTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  group: varchar("group", { length: 100 }).default("general").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// Uploaded Images / Assets
export const assets = mysqlTable("assets", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: int("size").notNull(),
  url: text("url").notNull(),
  category: varchar("category", { length: 100 }).default("general").notNull(),
  source: mysqlEnum("source", ["upload", "library"]).default("upload").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

// Statistics
export const statistics = mysqlTable("statistics", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 50 }).notNull(),
  suffix: varchar("suffix", { length: 20 }).default("").notNull(),
  labelSr: text("labelSr"),
  labelTr: text("labelTr"),
  labelEn: text("labelEn").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;
