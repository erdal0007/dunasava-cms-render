import { execSync } from "node:child_process";
import { runSeed } from "../../db/seed";
import { getDb } from "../queries/connection";
import { sections } from "@db/schema";

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
    console.log("[bootstrap] Missing tables detected. Running db:push...");
    execSync("npm run db:push", {
      stdio: "inherit",
      env: process.env,
    });
  }

  console.log("[bootstrap] Running idempotent seed...");
  await runSeed();
}
