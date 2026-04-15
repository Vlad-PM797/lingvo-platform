import { Pool } from "pg";

const DEFAULT_BASE_URL = "http://127.0.0.1:4015";
const DEFAULT_PASSWORD = "Password123!";
const REQUIRED_ENV_KEYS = ["DATABASE_URL"];

function logInfo(message, payload = {}) {
  console.log(JSON.stringify({ level: "info", message, payload, at: new Date().toISOString() }));
}

function logError(message, error, payload = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      message,
      payload,
      error: error instanceof Error ? error.message : String(error),
      at: new Date().toISOString(),
    }),
  );
}

function requireEnv() {
  for (const envKey of REQUIRED_ENV_KEYS) {
    if (!process.env[envKey]) {
      throw new Error(`Missing required env var: ${envKey}`);
    }
  }
}

async function requestJson(baseUrl, path, method, payload, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const bodyText = await response.text();
  const body = bodyText ? JSON.parse(bodyText) : null;

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} at ${path}`);
    error.statusCode = response.status;
    error.responseBody = body;
    throw error;
  }
  return { status: response.status, body, headers: response.headers };
}

async function assertStatus(baseUrl, path, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`);
  if (response.status !== expectedStatus) {
    throw new Error(`Unexpected status for ${path}: got ${response.status}, expected ${expectedStatus}`);
  }
}

async function promoteAdmin(pool, email) {
  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
}

function randomEmail(prefix) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}

async function run() {
  let pool = null;
  try {
    requireEnv();
    const baseUrl = process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL;
    const password = process.env.SMOKE_TEST_PASSWORD || DEFAULT_PASSWORD;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });

    logInfo("release_smoke.started", { baseUrl });

    await assertStatus(baseUrl, "/health/live", 200);
    await assertStatus(baseUrl, "/health/ready", 200);
    await assertStatus(baseUrl, "/health/metrics", 200);
    logInfo("release_smoke.health_checks.passed");

    const userEmail = randomEmail("stage5.user");
    const adminEmail = randomEmail("stage5.admin");

    await requestJson(baseUrl, "/auth/register", "POST", { email: userEmail, password });
    await requestJson(baseUrl, "/auth/register", "POST", { email: adminEmail, password });
    logInfo("release_smoke.auth.register.passed", { userEmail, adminEmail });

    await promoteAdmin(pool, adminEmail);
    logInfo("release_smoke.admin.promote.passed", { adminEmail });

    const userLogin = await requestJson(baseUrl, "/auth/login", "POST", { email: userEmail, password });
    const userAccessToken = userLogin.body.accessToken;
    const userRefreshToken = userLogin.body.refreshToken;

    const refreshResponse = await requestJson(baseUrl, "/auth/refresh", "POST", { refreshToken: userRefreshToken });
    await requestJson(baseUrl, "/auth/logout", "POST", { refreshToken: refreshResponse.body.refreshToken });
    logInfo("release_smoke.auth.refresh_logout.passed");

    const userRelogin = await requestJson(baseUrl, "/auth/login", "POST", { email: userEmail, password });
    const activeUserToken = userRelogin.body.accessToken;

    const coursesResponse = await requestJson(baseUrl, "/learning/courses", "GET", undefined, activeUserToken);
    if (!Array.isArray(coursesResponse.body.courses) || coursesResponse.body.courses.length === 0) {
      throw new Error("No courses returned from learning API");
    }

    const firstCourse = coursesResponse.body.courses[0];
    const firstLesson = firstCourse.lessons?.[0];
    if (!firstLesson?.id) {
      throw new Error("No lessons returned in first course");
    }

    await requestJson(
      baseUrl,
      "/learning/attempts",
      "POST",
      {
        lessonId: firstLesson.id,
        promptType: "translate_ua_to_en",
        sourceText: "привіт",
        expectedAnswers: ["hello", "hi"],
        userAnswer: "hello",
      },
      activeUserToken,
    );
    const progressResponse = await requestJson(baseUrl, "/learning/progress/me", "GET", undefined, activeUserToken);
    if (!Array.isArray(progressResponse.body.byLesson) || progressResponse.body.byLesson.length === 0) {
      throw new Error("Progress rows were not created");
    }
    logInfo("release_smoke.learning_progress.passed");

    const adminLogin = await requestJson(baseUrl, "/auth/login", "POST", { email: adminEmail, password });
    const adminToken = adminLogin.body.accessToken;

    const createdCourse = await requestJson(
      baseUrl,
      "/admin/courses",
      "POST",
      {
        code: `stage5-course-${Date.now()}`,
        title: "Stage 5 Smoke Course",
        description: "Temporary course for release smoke verification",
      },
      adminToken,
    );

    const createdLesson = await requestJson(
      baseUrl,
      "/admin/lessons",
      "POST",
      {
        courseId: createdCourse.body.id,
        code: `stage5-lesson-${Date.now()}`,
        title: "Stage 5 Smoke Lesson",
        description: "Temporary lesson for release smoke verification",
        ordinal: 1,
      },
      adminToken,
    );

    await requestJson(
      baseUrl,
      `/admin/lessons/${createdLesson.body.id}`,
      "PUT",
      { title: "Stage 5 Smoke Lesson Updated" },
      adminToken,
    );

    await requestJson(baseUrl, `/admin/lessons/${createdLesson.body.id}`, "DELETE", undefined, adminToken);
    await requestJson(baseUrl, `/admin/courses/${createdCourse.body.id}`, "DELETE", undefined, adminToken);
    logInfo("release_smoke.admin_crud.passed");

    logInfo("release_smoke.completed");
  } catch (error) {
    logError("release_smoke.failed", error);
    process.exitCode = 1;
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (error) {
        logError("release_smoke.pool_close.failed", error);
      }
    }
  }
}

void run();
