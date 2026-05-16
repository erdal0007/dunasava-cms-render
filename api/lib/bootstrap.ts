import mysql from "mysql2/promise";
import { runSeed } from "../../db/seed";
import { getDb } from "../queries/connection";
import { sections } from "@db/schema";
import { env } from "./env";

function isMissingTableError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "").toString();
  return (
    message.includes("doesn't exist") ||
    message.includes("ER_NO_SUCH_TABLE") ||
    message.includes("Table") && message.includes("doesn't exist")
  );
}

export async function ensureDatabaseReady() {
  const db = getDb();
  try {
    await db.select({ id: sections.id }).from(sections).limit(1);
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
    console.log("[bootstrap] Missing tables detected. Creating schema...");
    await createSchemaIfMissing();
  }

  console.log("[bootstrap] Running idempotent seed...");
  await runSeed();
}

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    originalName VARCHAR(255) NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    titleSr TEXT NULL,
    titleTr TEXT NULL,
    titleEn TEXT NOT NULL,
    descriptionSr TEXT NULL,
    descriptionTr TEXT NULL,
    descriptionEn TEXT NULL,
    imageUrl TEXT NULL,
    sortOrder INT NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    titleSr TEXT NULL,
    titleTr TEXT NULL,
    titleEn TEXT NOT NULL,
    contentSr TEXT NULL,
    contentTr TEXT NULL,
    contentEn TEXT NULL,
    eyebrowSr TEXT NULL,
    eyebrowTr TEXT NULL,
    eyebrowEn TEXT NULL,
    imageUrl TEXT NULL,
    sortOrder INT NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    sectionType ENUM('hero', 'about', 'mission', 'products', 'sectors', 'production', 'statistics', 'contact') NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sectors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    number VARCHAR(10) NOT NULL,
    titleSr TEXT NULL,
    titleTr TEXT NULL,
    titleEn TEXT NOT NULL,
    descriptionSr TEXT NULL,
    descriptionTr TEXT NULL,
    descriptionEn TEXT NULL,
    imageUrl TEXT NULL,
    imageUrl2 TEXT NULL,
    sortOrder INT NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`key\` VARCHAR(255) NOT NULL UNIQUE,
    \`value\` TEXT NULL,
    \`group\` VARCHAR(100) NOT NULL DEFAULT 'general',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS statistics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(50) NOT NULL,
    suffix VARCHAR(20) NOT NULL DEFAULT '',
    labelSr TEXT NULL,
    labelTr TEXT NULL,
    labelEn TEXT NOT NULL,
    sortOrder INT NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS translations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`key\` VARCHAR(255) NOT NULL,
    sr TEXT NULL,
    tr TEXT NULL,
    en TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    unionId VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NULL,
    email VARCHAR(320) NULL,
    avatar TEXT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastSignInAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function createSchemaIfMissing() {
  const connection = await mysql.createConnection(env.databaseUrl);
  try {
    for (const sql of createTableStatements) {
      await connection.execute(sql);
    }
  } finally {
    await connection.end();
  }
}
