import path from "path";
import { env } from "./env";

export function getUploadsDir() {
  return (
    process.env.UPLOADS_DIR?.trim() ||
    (env.isProduction
      ? "/var/data/uploads"
      : path.resolve(process.cwd(), "dist/public/uploads"))
  );
}
