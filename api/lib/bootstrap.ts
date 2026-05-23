import mysql from "mysql2/promise";
import { runSeed } from "../../db/seed";
import { CMS_SECTION_TYPES } from "@contracts/cms";
import { env } from "./env";

const SECTION_TYPE_ENUM_SQL = CMS_SECTION_TYPES.map((type) => `'${type}'`).join(", ");
const USERS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  unionId VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NULL,
  email VARCHAR(320) NULL,
  avatar TEXT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignInAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const ASSETS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS assets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  originalName VARCHAR(255) NOT NULL,
  mimeType VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  source ENUM('upload', 'library') NOT NULL DEFAULT 'upload',
  isVisible BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export async function ensureDatabaseReady() {
  await ensureSchemaTables();
  await ensureSectionTypeEnum();
  await ensureAssetsTableShape();
  await ensureUsersTableShape();

  console.log("[bootstrap] Running idempotent seed...");
  await runSeed();
}

const createTableStatements = [
  ASSETS_TABLE_SQL,
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
    sectionType ENUM(${SECTION_TYPE_ENUM_SQL}) NOT NULL,
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
];

async function ensureSchemaTables() {
  const connection = await mysql.createConnection(env.databaseUrl);
  try {
    for (const sql of createTableStatements) {
      await connection.execute(sql);
    }
    await connection.execute(
      `ALTER TABLE sections MODIFY sectionType ENUM(${SECTION_TYPE_ENUM_SQL}) NOT NULL`
    );
  } finally {
    await connection.end();
  }
}

async function columnExists(
  connection: Awaited<ReturnType<typeof mysql.createConnection>>,
  tableName: string,
  columnName: string,
) {
  const [rows] = await connection.execute<any[]>(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1
    `,
    [tableName, columnName],
  );
  return rows.length > 0;
}

async function ensureUsersTableShape() {
  const connection = await mysql.createConnection(env.databaseUrl);
  try {
    await connection.execute(USERS_TABLE_SQL);

    const definitions = [
      "unionId VARCHAR(255) NOT NULL UNIQUE",
      "name VARCHAR(255) NULL",
      "email VARCHAR(320) NULL",
      "avatar TEXT NULL",
      "role ENUM('user', 'admin') NOT NULL DEFAULT 'user'",
      "createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      "lastSignInAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    ];

    for (const definition of definitions) {
      const columnName = definition.split(" ")[0].replace(/`/g, "");
      if (await columnExists(connection, "users", columnName)) {
        continue;
      }
      await connection.execute(`ALTER TABLE users ADD COLUMN ${definition}`);
    }
  } finally {
    await connection.end();
  }
}

async function ensureAssetsTableShape() {
  const connection = await mysql.createConnection(env.databaseUrl);
  try {
    await connection.execute(ASSETS_TABLE_SQL);

    const definitions = [
      "category VARCHAR(100) NOT NULL DEFAULT 'general'",
      "source ENUM('upload', 'library') NOT NULL DEFAULT 'upload'",
      "isVisible BOOLEAN NOT NULL DEFAULT TRUE",
    ];

    for (const definition of definitions) {
      const columnName = definition.split(" ")[0].replace(/`/g, "");
      if (await columnExists(connection, "assets", columnName)) {
        continue;
      }
      await connection.execute(`ALTER TABLE assets ADD COLUMN ${definition}`);
    }
  } finally {
    await connection.end();
  }
}

async function ensureSectionTypeEnum() {
  const connection = await mysql.createConnection(env.databaseUrl);
  try {
    await connection.execute(
      `ALTER TABLE sections MODIFY sectionType ENUM(${SECTION_TYPE_ENUM_SQL}) NOT NULL`
    );
  } finally {
    await connection.end();
  }
}
