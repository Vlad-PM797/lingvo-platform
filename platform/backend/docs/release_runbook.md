# Lingvo Backend Release Runbook

## Purpose
- Standardize release execution for backend MVP.
- Reduce risk during deploy and provide clear rollback steps.

## Pre-Release Inputs
- Target environment URL.
- Valid `DATABASE_URL`.
- Backend env secrets configured (`JWT_*`, `CORS_ALLOWED_ORIGINS`, etc.).
- Latest migrations available (`001` ... `004`).

## Release Procedure
1. Run build checks locally:
   - `npm run typecheck`
   - `npm run build`
   - `npm run preflight:prod`
2. Start backend against target database:
   - `npm start`
3. Run smoke suite:
   - `npm run smoke:release`
4. Verify health/observability endpoints:
   - `GET /health/live`
   - `GET /health/ready`
   - `GET /health/metrics`
5. Confirm auth + learning + admin critical flow from smoke logs.
6. Mark go/no-go checklist before production deploy.

## Production Release Day (T0)
1. Backup current production DB snapshot.
2. Apply migrations in strict order (`001` ... `004`).
3. Deploy backend artifact.
4. Validate:
   - `GET /health/live`
   - `GET /health/ready`
   - `GET /health/metrics`
5. Run `npm run smoke:release` against production URL (or staging mirror).
6. Monitor logs/metrics for at least 30 minutes before closure.

## Rollback Procedure
1. Stop current backend revision.
2. Restore previous backend artifact.
3. Reapply previous env snapshot.
4. Run health checks on rollback artifact.
5. Run smoke suite against rollback revision.
6. Publish incident note with root cause and corrective actions.

## Incident Quick Actions
- `5xx spike`: check server logs with request id correlation.
- `DB degraded`: check `/health/ready`, inspect PostgreSQL availability.
- `Auth failures`: verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- `CORS failures`: verify `CORS_ALLOWED_ORIGINS` value.

## Exit Criteria
- Smoke script passes.
- `ready` health is stable.
- No abnormal `5xx` trend in first 30-60 minutes.
