# Task: Public Deployment + User Registration Access

## Implementation Details
- Prepare a deploy-ready setup for multi-user internet access.
- Keep backend auth routes as the source of truth (`/auth/register`, `/auth/login`).
- Add a minimal frontend auth portal so a new user can register and log in without manual API calls.
- Add deployment manifests for free-tier hosting (backend + static frontend).

## Subtasks
- [x] Create/update implementation plan
- [x] Add minimal web registration/login page
- [x] Add deploy configs for backend and frontend
- [x] Keep CORS/env contract explicit for production
- [x] Validate changed files with linter diagnostics

## Testing Plan
- [ ] Register user from web form
- [ ] Login user from web form
- [ ] Verify `/health/live` and `/health/ready` on deployed backend
- [ ] Verify frontend can call backend with CORS in production
- [x] Linter check for modified files

## Verification
- [x] Deployment artifacts created
- [x] Public registration path exists in frontend
- [ ] Services deployed to public URLs
- [ ] End-to-end registration from internet verified
