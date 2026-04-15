import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string().min(1),
  CORS_ALLOWED_ORIGINS: z.string().default("*"),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL_DAYS: z.string().default("30"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = {
  port: Number(parsed.data.PORT),
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  corsAllowedOrigins: parsed.data.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  jwtAccessSecret: parsed.data.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsed.data.JWT_REFRESH_SECRET,
  jwtAccessTtl: parsed.data.JWT_ACCESS_TTL,
  jwtRefreshTtlDays: Number(parsed.data.JWT_REFRESH_TTL_DAYS),
};
