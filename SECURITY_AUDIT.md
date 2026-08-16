# Contribo Security Audit & Hardening Summary

**Date:** 2026-08-10  
**Scope:** `src/` App Router API, auth, client mutations, secrets handling

---

## What was already solid

| Area | Status |
|------|--------|
| Password hashing | scrypt + salt + `timingSafeEqual` |
| Auth secret | No `default_secret` fallback in production |
| User enumeration | Generic login / register errors |
| Owner-scoped proposals | Reads/writes require `userId` match |
| Profile API | Password & tokens projected out |
| Account deletion | Purges users, OAuth accounts, sessions, saved, apps, proposals, feedback |
| Rate limiting | In-proxy sliding windows (auth, AI, user writes) |
| Health endpoints | No DB names / connection strings leaked |
| `.env` | Listed in gitignore; secrets via env only |

---

## Hardening applied in this pass

### Backend structure
- **`src/lib/security.ts`** — origin checks, body size, redaction, request IDs (no cycle with api)
- **`src/lib/api.ts`** — `parseMutationBody`, `requireUserMutation`, security headers on JSON, safe logs
- Mutating routes use **same-origin + size caps + auth** where appropriate:
  - `/api/user`, applications, saved
  - `/api/proposals`, `[id]`, `ai-improve`
  - `/api/feedback`, `/api/match`

### Transport & browser
- **CSP**, **HSTS** (prod), frame deny, referrer, permissions policy in `proxy.ts`
- Stricter rate buckets for auth / AI / user writes

### Secrets
- Gemini key moved from query string → **`x-goog-api-key` header**; failures never log full URL
- `.gitignore` no longer swallows **`.env.example`**
- `.env.example` documents `GEMINI_API_KEY`, `AUTH_URL` / origin usage

### Account deletion UX + API
- API requires body `{ "confirm": "DELETE" }`
- Client sends confirm token; Danger Zone requires typing **DELETE**

### Registration
- Per-IP soft throttle + letter+number password rule

---

## Residual risks (ops / multi-instance)

1. **In-memory rate limits** reset per instance — use Redis / edge rate limits on multi-region deploys.
2. **Origin allowlist** depends on `AUTH_URL` / `NEXT_PUBLIC_APP_URL` being set correctly in production.
3. **Credentials provider** has no email verification yet — OAuth preferred for production trust.
4. **No CAPTCHA** on public feedback / register — add if abuse appears.
5. **AI cost abuse** mitigated by rate limits; consider auth-gating matcher in high-traffic deploys.
6. Rotate any secrets that ever appeared in git history.

---

## Data map (PII)

| Data | Entry | Storage | External |
|------|--------|---------|----------|
| Email, name | Register / OAuth | Mongo `users` | Auth providers |
| Password | Register | scrypt hash only | Never |
| Skills / interests | Profile PATCH | `users` | Optional AI match prompt (skills only) |
| Saved / applications | Dashboard APIs | `saved_items`, `applications` | None |
| Proposal drafts | Studio APIs | `proposals` | Gemini/OpenAI section text when AI used |
| Feedback | Feedback form | `user_feedback` | None |
| Session | NextAuth JWT | Cookie httpOnly | — |

Deletion: **DELETE /api/user** with confirm purges personal collections.

---

## Platform improvement ideas

### Product
1. **Email verification + password reset** for credentials accounts  
2. **Auth-required AI matcher** (or daily free quota) to control cost  
3. **Notification center** for program deadlines  
4. **Public contributor profiles** (opt-in) with GitHub stats  
5. **Proposal export** PDF + shareable read-only links  
6. **Org follow / digest** weekly email of new projects  

### Engineering
1. Redis-backed rate limit + session store for horizontal scale  
2. Structured logging (pino) with request IDs, no PII  
3. OpenAPI spec generated from route contracts  
4. Integration tests for authz (cross-user proposal access must 404)  
5. Dependabot + `npm audit` in CI  
6. Mongo indexes audit script in deploy pipeline  

### UX
1. Global toast system for save / offline / errors (partially present)  
2. Optimistic UI rollback with clear “couldn’t save” states  
3. Skeleton consistency across catalog pages  
4. Keyboard-first command palette discovery onboarding  
5. Empty states with one primary CTA per page  

---

## Verify

```bash
cd Contribo
npm run build
npm start
```

Smoke-check: login, save project, proposal autosave, matcher, type-DELETE account flow (on a throwaway user).
