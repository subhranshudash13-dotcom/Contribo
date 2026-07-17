# Contribo — Project Context

> **Purpose of this file:** Hand-off / restart document. Read this first when resuming work so you do not need to rediscover architecture, decisions, or open gaps.

**Last updated:** 2026-07-16  
**Workspace path:** `C:\Users\Hp\Desktop\SSD_javaprojects\GSOC contributor hub\Contribo`  
**Package name:** `contribo-app` (v0.1.0)

---

## 1. Overall project goal

**Contribo** is a universal open-source mentorship programs hub. It aggregates programs, organizations, and project ideas so contributors can:

1. **Discover** — search and filter programs, orgs, and projects (GSoC, Outreachy, LFX, MLH, Hacktoberfest, GSSoC, NSoC, Summer of Bitcoin, and more).
2. **Understand** — structured metadata (stipends, timelines, eligibility, application steps).
3. **Prepare** — AI semantic matcher, guidelines/resources, roadmaps.
4. **Track** — personal dashboard: saved items, application status, deadlines (GitHub-meets-Linear style workspace).

### Product principles (non-negotiable)

- **Program-first hierarchy:** Program → Organizations → Projects (GSoC is one module, not the whole product).
- **Additive schema only:** do not drop/rename shared fields on `organizations` / `projects`; only add fields.
- **Real data over placeholders:** no lorem ipsum, mock logos, or fake production stats; prefer empty states.
- **Backward-compatible APIs and URLs** when generalizing beyond GSoC.
- **WCAG AA** accessibility baseline.

### Live data scale (verified 2026-07-16)

| Collection       | Approx. count / notes |
|------------------|------------------------|
| `programs`       | **8** (core 6 + `gssoc` + `nsoc`) |
| `organizations`  | ~628 GSoC + multi-program samples from `db:seed-extra` |
| `projects`       | ~12,099 GSoC + multi-program samples |
| `users`          | small (auth) |
| `saved_items`    | user-driven |
| `applications`   | user-driven |

MongoDB database name resolved from URI path: **`gsoc-hub`**.

**Coverage doc:** `programs-coverage.md`  
**Audit:** `npm run db:audit` → `scripts/audit-coverage.js`

---

## 2. Current architecture

### 2.1 Stack

| Layer            | Choice                                      |
|------------------|---------------------------------------------|
| Framework        | Next.js **16.2.10** (App Router)            |
| UI               | React 19, Tailwind CSS v4, Framer Motion    |
| Language         | TypeScript (strict)                         |
| Database         | MongoDB (official driver `mongodb` v6)      |
| Auth             | NextAuth v5 (`next-auth` beta) + MongoDB adapter |
| AI               | OpenAI SDK (`gpt-4o-mini`) for matcher      |
| Content          | MDX via `next-mdx-remote`, `gray-matter`     |
| Hosting target   | Vercel-friendly (SSR/SSG, edge middleware)  |

> **Note:** Older design docs mention Postgres. The **implemented** system is MongoDB.

### 2.2 High-level layout

```
Contribo/
├── PROJECT_CONTEXT.md
├── programs-coverage.md        ← coverage strategy + gaps
├── package.json                ← db:setup, db:seed, db:seed-extra, db:audit, smoke
├── scripts/
│   ├── seed-programs.js        ← upsert 8 programs (incl. GSSoC, NSoC)
│   ├── seed-additional-projects.js  ← sample orgs/projects for non-GSoC programs
│   ├── setup-indexes.js
│   ├── ingest-csv.js
│   ├── audit-coverage.js
│   └── smoke-api.js
└── src/
    ├── auth.ts
    ├── proxy.ts                ← rate limit + dashboard cookie gate
    ├── lib/repositories/       ← data access
    ├── components/
    │   ├── dashboard/DashboardClient.tsx
    │   ├── home/TrendingProjects.tsx
    │   └── ui/SaveTrackActions.tsx, ProjectCard, OrgCard, …
    └── app/                    ← pages + API routes
```

### 2.3 Programs (seeded)

| Slug | Name |
|------|------|
| `gsoc` | Google Summer of Code |
| `outreachy` | Outreachy |
| `lfx` | LFX Mentorship |
| `hacktoberfest` | Hacktoberfest |
| `summer-of-bitcoin` | Summer of Bitcoin |
| `mlh-fellowship` | MLH Fellowship |
| `gssoc` | GirlScript Summer of Code |
| `nsoc` | **Nexus Spring of Code (NSoC)** — https://nsoc.in, accent `#8B5CF6` |

### 2.4 API surface (summary)

**Public catalog**
- `GET /api/programs`, `GET /api/programs/:slug` (`?includeGuide=1`)
- `GET /api/organizations`, `GET /api/organizations/:slug`
- `GET /api/projects`, `GET /api/projects/:id`
- `GET /api/search?q=&type=&limit=`
- `GET /api/stats`
- `GET /api/meta/filters` — distinct tech / difficulty / year / topics
- `GET /api/trending?domain=all|web|ai|systems`
- `GET /api/guidelines?program=`
- `GET /api/health` — Mongo readiness probe
- `POST /api/match` — AI + heuristic matcher

**Auth (session required)**
- `GET|PATCH|DELETE /api/user`
- `GET|POST|DELETE /api/user/saved`
- `GET|POST|PATCH|DELETE /api/user/applications` (POST idempotent by `projectId`)
- `GET /api/user/dashboard`
- `POST /api/user/status` — batch saved/tracked lookup
- NextAuth: `/api/auth/[...nextauth]`  

### 2.5 Auth & security

- Providers: GitHub, Google, Credentials (scrypt).
- JWT sessions; dashboard protected via `proxy.ts` cookie presence + page-level `auth()`.
- Rate limits (in-memory): auth/match/user **10/min**, other APIs **60/min**.
- Match API: skill count/length caps, JSON validation, blended AI+heuristic scoring (no inflated 72% floor).
- No path/query logging of potentially sensitive URLs in proxy.
- Account purge removes user + accounts + sessions + saved_items + applications.

---

## 3. Key decisions

| Decision | Status |
|----------|--------|
| MongoDB over Postgres | Locked |
| Repository layer | Implemented |
| Matcher: case-insensitive tech + aliases + recent-year preference + AI blend | Implemented 2026-07-16 |
| NSoC = Nexus Spring of Code (not oSoC) | Product choice — use seed data as source of truth |
| Save/Track with `initialSaved` / `initialTracked` SSR hydration | Implemented |
| Sample multi-program data via `db:seed-extra` | Implemented |
| Additive schema | Policy |

### Known data-quality issues

- Duplicate orgs/projects on legacy GSoC data (unique indexes may fall back).
- Tech tokens mostly lowercase; UI uses Title Case chips — matcher aliases handle this.
- `programId` may be ObjectId or string — filters use dual form where needed.

---

## 4. Progress summary

### Done (including 2026-07-16 pass)

- [x] Next.js app shell, design tokens, major pages.
- [x] MongoDB + seed programs (8) + CSV ingest tooling.
- [x] Sample non-GSoC orgs/projects (`seed-additional-projects.js`).
- [x] Coverage assessment doc (`programs-coverage.md`).
- [x] NextAuth + dashboard APIs (saved, applications, summary, purge).
- [x] **Save / Track UI** on ProjectCard, OrgCard, homepage Trending, Matcher.
- [x] SSR initial saved/tracked state on home, projects, orgs pages.
- [x] **Dashboard redesign** — interactive status select, unsave/remove, empty states.
- [x] **Trending Projects UI** — domain tabs (web/ai/systems), spotlight + grid, save/track.
- [x] **AI matcher harden** — alias expansion, regex tech match, difficulty/year scoring, honest %, Save/Track on results.
- [x] Rate limiting + security hygiene on proxy.
- [x] Smoke script: `npm run smoke`.

### Partial / next

- [ ] Deduplicate legacy GSoC org/project rows for strict unique indexes.
- [ ] Full org/project catalogs for Outreachy/LFX/GSSoC/NSoC (beyond samples).
- [ ] Profile edit UI (PATCH `/api/user` exists).
- [ ] E2E tests beyond smoke script.
- [ ] Production rate-limit store (Redis) if multi-instance.

---

## 5. npm scripts

```bash
npm run dev
npm run build
npm run db:indexes
npm run db:seed              # programs only (8 programs)
npm run db:seed-extra        # sample orgs/projects for Outreachy, LFX, MLH, GSSoC, NSoC
npm run db:setup             # indexes + program seed
npm run db:ingest            # CSV ingest (args after --)
npm run db:audit             # coverage report
npm run smoke                # public + 401 API smoke (needs dev server)
```

---

## 6. Environment reference

```env
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/gsoc-hub
# optional:
MONGODB_DB=gsoc-hub

AUTH_SECRET=...
NEXTAUTH_SECRET=...
AUTH_URL=http://localhost:3000

AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

OPENAI_API_KEY=...
AI_PROVIDER=openai

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GSOC_YEAR=2026
```

---

## 7. How to restart work

1. Open `...\GSOC contributor hub\Contribo`
2. Read **this file** + `programs-coverage.md`
3. Confirm `.env` has working `MONGODB_URI` → DB `gsoc-hub`
4. `npm install` if needed → `npm run db:seed` → `npm run db:seed-extra`
5. `npm run dev` → hit `/api/stats`, `/api/programs`, `/programs/gssoc`, `/programs/nsoc`
6. Backend: repositories first, then thin routes
7. Tracking UI: only `/api/user/*` — no parallel localStorage
8. Schema **additive** only
9. `npx tsc --noEmit` before calling a pass done

---

## 8. Related docs

| File | Use when |
|------|----------|
| `programs-coverage.md` | Data gaps, ingest strategy, GSSoC/NSoC notes |
| `README.md` | Setup overview |
| `specifications.md` | Design system / a11y |
| `security.md` | Secret/PII checklist |
| `ai matcher.md` | Matcher product notes |

---

## 9. Session history (2026-07-16)

**Assessment**

- Inventory was GSoC-heavy; non-GSoC programs had metadata only until sample seed.
- Tech stacks lowercase → matcher needed case-insensitive + alias expansion.
- Save/Track APIs existed but cards were not wired (now wired + SSR hydration).

**Implemented**

- Seed: GSSoC + Nexus Spring of Code (NSoC).
- Sample multi-program projects via `seed-additional-projects.js` (user-authored data retained).
- Matcher hardening + matcher UI Save/Track + empty/loading.
- Dashboard client interactions.
- Trending Projects domain UI (user redesign retained; limit bumped to 18 for filters).
- NSoC logo accent aligned to `#8B5CF6`.
- Smoke + audit npm scripts; PROJECT_CONTEXT refresh.

**User edits respected**

- NSoC naming/branding (Nexus Spring of Code, nsoc.dev).
- TrendingProjects domain/spotlight redesign.
- `initialSaved` / `initialTracked` across cards and pages.
- `seed-additional-projects.js` multi-program samples.
