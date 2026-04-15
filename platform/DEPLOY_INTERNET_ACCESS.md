# Lingvo Public Access (Backend + Registration UI)

## 1) Backend deploy (Render)

1. Push `E:\Lingvo\platform` to a Git repository.
2. In Render create **Blueprint** and point to repo root containing `render.yaml`.
3. Set required env vars in Render:
   - `DATABASE_URL` (Neon/Supabase PostgreSQL URL)
   - `CORS_ALLOWED_ORIGINS` (frontend URL, e.g. `https://lingvo-access.vercel.app`)
   - `JWT_ACCESS_SECRET` (strong random string)
   - `JWT_REFRESH_SECRET` (strong random string)
4. Ensure DB migrations `001..004` are applied on the production DB.
5. Validate backend:
   - `GET /health/live`
   - `GET /health/ready`
   - `POST /auth/register`

## 2) Frontend deploy (Vercel)

1. Import repo in Vercel.
2. Set Root Directory to `platform/frontend`.
3. Deploy static site.
4. Open deployed URL and set the backend URL in the form.

## 3) User access flow

1. User opens frontend URL.
2. User enters email + password in registration form.
3. UI calls `POST /auth/register` on backend.
4. User logs in with same credentials (`POST /auth/login`).

## 4) Minimal smoke checks after deploy

- Register new account from UI.
- Login from UI.
- Check backend health endpoints are green.
- Confirm CORS is configured to frontend domain only.
