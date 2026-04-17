/**
 * Застосовує всі .sql з каталогу migrations у алфавітному порядку (001 … 005).
 * Потрібні змінні середовища: DATABASE_URL (див. .env.example).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[migrate] Missing DATABASE_URL. Copy .env.example to .env and set DATABASE_URL.");
  process.exit(1);
}

const migrationsDir = path.join(rootDir, "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("[migrate] No .sql files in migrations/");
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  for (const fileName of files) {
    const fullPath = path.join(migrationsDir, fileName);
    const sql = fs.readFileSync(fullPath, "utf8");
    console.info(`[migrate] Applying ${fileName} …`);
    await client.query(sql);
    console.info(`[migrate] OK ${fileName}`);
  }
  console.info("[migrate] All migrations applied.");
} catch (error) {
  console.error("[migrate] Failed:", error instanceof Error ? error.message : String(error));
  if (error instanceof AggregateError) {
    for (const subError of error.errors) {
      console.error("[migrate] Sub-error:", subError);
    }
  }
  console.error("[migrate] Full:", error);
  process.exit(1);
} finally {
  await client.end().catch(() => undefined);
}
