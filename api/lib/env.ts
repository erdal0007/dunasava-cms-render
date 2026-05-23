import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  adminEmail: required("ADMIN_EMAIL"),
  adminPassword: required("ADMIN_PASSWORD"),
  appId: optional("APP_ID") || optional("VITE_APP_ID"),
  appSecret: optional("APP_SECRET"),
  kimiAuthUrl: optional("KIMI_AUTH_URL") || optional("VITE_KIMI_AUTH_URL") || "https://kimi.moonshot.cn",
  kimiOpenUrl: optional("KIMI_OPEN_URL") || "https://kimi.moonshot.cn",
  ownerUnionId: optional("OWNER_UNION_ID"),
};
