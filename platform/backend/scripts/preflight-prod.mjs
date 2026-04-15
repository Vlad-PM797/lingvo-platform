const REQUIRED_PROD_KEYS = [
  "PORT",
  "NODE_ENV",
  "DATABASE_URL",
  "CORS_ALLOWED_ORIGINS",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_TTL",
  "JWT_REFRESH_TTL_DAYS",
];

const MIN_SECRET_LENGTH = 24;

function fail(message) {
  console.error(`[preflight-prod] ${message}`);
  process.exitCode = 1;
}

function assertCondition(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function validateRequiredKeys() {
  for (const envKey of REQUIRED_PROD_KEYS) {
    assertCondition(Boolean(process.env[envKey]), `Missing required env var: ${envKey}`);
  }
}

function validateNodeEnv() {
  assertCondition(process.env.NODE_ENV === "production", "NODE_ENV must be 'production' for production preflight");
}

function validatePort() {
  const portValue = Number(process.env.PORT);
  assertCondition(Number.isInteger(portValue) && portValue > 0 && portValue <= 65535, "PORT must be a valid integer");
}

function validateSecrets() {
  const accessSecret = String(process.env.JWT_ACCESS_SECRET || "");
  const refreshSecret = String(process.env.JWT_REFRESH_SECRET || "");
  assertCondition(accessSecret.length >= MIN_SECRET_LENGTH, "JWT_ACCESS_SECRET is too short");
  assertCondition(refreshSecret.length >= MIN_SECRET_LENGTH, "JWT_REFRESH_SECRET is too short");
}

function validateDatabaseUrl() {
  const databaseUrl = String(process.env.DATABASE_URL || "");
  assertCondition(databaseUrl.startsWith("postgresql://"), "DATABASE_URL must use postgresql:// scheme");
}

function validateCors() {
  const origins = String(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  assertCondition(origins.length > 0, "CORS_ALLOWED_ORIGINS must contain at least one origin");
}

function validateTtl() {
  const accessTtl = String(process.env.JWT_ACCESS_TTL || "").trim().toLowerCase();
  const refreshDays = Number(process.env.JWT_REFRESH_TTL_DAYS);
  const accessTtlIsValid = /^\d+$/.test(accessTtl) || /^\d+[smhd]$/.test(accessTtl);
  assertCondition(accessTtlIsValid, "JWT_ACCESS_TTL must be number or pattern like 15m/1h/30s");
  assertCondition(Number.isInteger(refreshDays) && refreshDays > 0, "JWT_REFRESH_TTL_DAYS must be positive integer");
}

function run() {
  validateRequiredKeys();
  validateNodeEnv();
  validatePort();
  validateSecrets();
  validateDatabaseUrl();
  validateCors();
  validateTtl();

  if (process.exitCode && process.exitCode !== 0) {
    return;
  }

  console.log("[preflight-prod] OK");
}

run();
