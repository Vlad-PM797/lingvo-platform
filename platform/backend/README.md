# Lingvo Backend (Stage 1-6)

Node.js + TypeScript + Express backend for Lingvo platform stage 1-6.

## Scope
- Foundation backend structure
- PostgreSQL integration
- Auth endpoints:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- Learning content endpoints (authorized):
  - `GET /learning/courses`
  - `GET /learning/courses/:courseId/lessons`
  - `GET /learning/lessons/:lessonId`
- Learning progress endpoints (authorized):
  - `POST /learning/attempts`
  - `GET /learning/progress/me` (повертає також `streakDays` за календарними днями завершень і `spotlightLesson` для останньої активності)
- Admin endpoints (admin-only):
  - `POST /admin/courses`
  - `PUT /admin/courses/:courseId`
  - `DELETE /admin/courses/:courseId`
  - `POST /admin/lessons`
  - `PUT /admin/lessons/:lessonId`
  - `DELETE /admin/lessons/:lessonId`
  - `POST /admin/words`
  - `PUT /admin/words/:wordId`
  - `DELETE /admin/words/:wordId`
  - `POST /admin/phrases`
  - `PUT /admin/phrases/:phraseId`
  - `DELETE /admin/phrases/:phraseId`
- Health/observability endpoints:
  - `GET /health`
  - `GET /health/live`
  - `GET /health/ready`
  - `GET /health/metrics`

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and fill values.
   - For CORS set `CORS_ALLOWED_ORIGINS` (comma-separated origins or `*`). Для GitHub Pages проєкту обов’язково додай **`https://vlad-pm797.github.io`** (див. `.env.production.example` та `platform/render.yaml`).
3. Install dependencies:
   - `npm install`
4. Run migrations in order:
   - `migrations/001_init_auth.sql`
   - `migrations/002_learning_core.sql`
   - `migrations/003_seed_learning_core.sql`
   - `migrations/004_admin_audit.sql`
   - `migrations/005_lesson_dialogue_scenes.sql`
5. Start development server:
   - `npm run dev`

## Build
- `npm run build`
- `npm start`

## Release Verification
- `npm run smoke:release` - runs critical API smoke/regression flow.
- `npm run verify:release` - runs `typecheck + build + smoke`.
- `npm run preflight:prod` - validates production env variables.
- `npm run verify:prod-ready` - runs `typecheck + build + production preflight`.
- Smoke script uses:
  - `SMOKE_BASE_URL` (default: `http://127.0.0.1:4015`)
  - `SMOKE_TEST_PASSWORD` (default: `Password123!`)
  - `DATABASE_URL` (required, used to promote test admin account)

## Production Templates
- `.env.production.example` - production environment template.
- `docs/release_runbook.md` - deploy/rollback runbook.
- `docs/post_release_report_template.md` - first 72h monitoring report template.

## Notes
- This workspace previously had no Node runtime, so project files were generated first.
- After Node install, run dependency install and verification commands.
