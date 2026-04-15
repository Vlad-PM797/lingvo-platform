"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("4000"),
    NODE_ENV: zod_1.z.string().default("development"),
    DATABASE_URL: zod_1.z.string().min(1),
    CORS_ALLOWED_ORIGINS: zod_1.z.string().default("*"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    JWT_ACCESS_TTL: zod_1.z.string().default("15m"),
    JWT_REFRESH_TTL_DAYS: zod_1.z.string().default("30"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}
exports.env = {
    port: Number(parsed.data.PORT),
    nodeEnv: parsed.data.NODE_ENV,
    databaseUrl: parsed.data.DATABASE_URL,
    corsAllowedOrigins: parsed.data.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
    jwtAccessSecret: parsed.data.JWT_ACCESS_SECRET,
    jwtRefreshSecret: parsed.data.JWT_REFRESH_SECRET,
    jwtAccessTtl: parsed.data.JWT_ACCESS_TTL,
    jwtRefreshTtlDays: Number(parsed.data.JWT_REFRESH_TTL_DAYS),
};
