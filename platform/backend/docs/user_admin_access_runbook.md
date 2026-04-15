# User and Admin Access Runbook

## Public URLs
- Frontend access portal: `https://lingvo-access.vercel.app`
- Backend API: `https://lingvo-backend.onrender.com`

## User Registration (self-service)
1. Open frontend portal.
2. Set **Backend URL** to `https://lingvo-backend.onrender.com`.
3. Fill email and password (8+ chars).
4. Click **Register**.
5. Click **Login** with same credentials.

## Manual User Registration (API)
```bash
curl -X POST "https://lingvo-backend.onrender.com/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"new.user@example.com","password":"Password123!"}'
```

## Promote User to Admin
Use SQL on production database:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'new.user@example.com';
```

## Admin Login Validation
1. Login via `POST /auth/login`.
2. Call an admin endpoint with Bearer token:

```bash
curl -X POST "https://lingvo-backend.onrender.com/admin/courses" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Course","description":"Admin check"}'
```

## Operational Security
- Rotate leaked tokens immediately:
  - Render API key
  - Vercel token
  - Neon DB password
- Keep `CORS_ALLOWED_ORIGINS` restricted to production frontend domains only.
- Do not store production secrets in repository files.
