import process from "node:process";

const DEFAULT_TIMEOUT_MS = 15000;
const REQUIRED_ROUTES = Object.freeze([
  Object.freeze({ path: "/", expectedContentType: "text/html" }),
  Object.freeze({ path: "/portal", expectedContentType: "text/html" }),
  Object.freeze({ path: "/landing", expectedContentType: "text/html" }),
  Object.freeze({ path: "/trainer", expectedContentType: "text/html" }),
  Object.freeze({ path: "/main.js", expectedContentType: "javascript" }),
  Object.freeze({ path: "/js/app.bundle.js", expectedContentType: "javascript" }),
  Object.freeze({ path: "/theme.js", expectedContentType: "javascript" }),
  Object.freeze({ path: "/project", expectedContentType: "text/html" }),
  Object.freeze({ path: "/fonts/Rutenia2008.woff2", expectedContentType: "woff2" }),
]);

function normalizeBaseUrl(inputUrl) {
  return String(inputUrl || "").trim().replace(/\/+$/, "");
}

async function checkRoute(baseUrl, routeConfig) {
  const routeUrl = `${baseUrl}${routeConfig.path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(routeUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes(routeConfig.expectedContentType)) {
      throw new Error(`unexpected content-type: ${contentType}`);
    }

    console.info(`[SMOKE_OK] ${routeConfig.path} -> ${response.status} (${contentType})`);
  } catch (error) {
    console.error(`[SMOKE_FAIL] ${routeConfig.path} -> ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runSmokeChecks() {
  const baseUrl = normalizeBaseUrl(process.argv[2]);
  if (!baseUrl) {
    console.error("Usage: npm run smoke:url -- <https://your-domain.vercel.app>");
    process.exit(1);
  }

  console.info(`[SMOKE_START] ${baseUrl}`);
  for (const routeConfig of REQUIRED_ROUTES) {
    await checkRoute(baseUrl, routeConfig);
  }
  console.info("[SMOKE_DONE] all required routes are healthy");
}

try {
  await runSmokeChecks();
} catch (error) {
  console.error("[SMOKE_ABORT] smoke check failed");
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}
