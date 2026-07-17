# Programs Coverage Strategy

> **Last assessed:** 2026-07-16  
> **Database:** `gsoc-hub`  
> **Audit script:** `node scripts/audit-coverage.js`

---

## 1. Live coverage snapshot

| Dimension | Status |
|-----------|--------|
| Programs catalogued | 8 (after seed: core 6 + GSSoC + NSoC) |
| Organizations | **628** — **100% linked to GSoC** |
| Projects | **12,099** — **100% linked to GSoC** |
| Project years | 2016–2026 (healthy multi-year archive) |
| Year 2026 projects | 1,144 |
| Year 2025+ | 2,335 |
| Tech stack coverage | **100%** of projects have `techStack` |
| Description coverage | **100%** |
| Stars metadata | **100%** have `stars > 0` |
| `saved_items` / `applications` | User-driven (start empty; filled via Save/Track UI) |

### Projects by program (pre-expansion)

| Program | Orgs | Projects | Data source |
|---------|------|----------|-------------|
| `gsoc` | 628 | 12,099 | Historical CSV ingest |
| `outreachy` | 2 | 2 | Project data seeded (Wikimedia, GNOME) |
| `lfx` | 2 | 3 | Project data seeded (CNCF, Hyperledger) |
| `hacktoberfest` | 0 | 0 | Program metadata only |
| `summer-of-bitcoin` | 0 | 0 | Program metadata only |
| `mlh-fellowship` | 2 | 2 | Project data seeded (Meta OSS, Hugging Face) |
| `gssoc` | 1 | 2 | **New** — GirlScript Summer of Code; project data seeded |
| `nsoc` | 1 | 3 | **New** — Nexus Spring of Code; project data seeded |

### Top tech tokens (lowercase in DB)

`python`, `javascript`, `c++`, `c/c++`, `c`, `java`, `android`, `machine learning`, `rust`, `php`, `ruby`, `linux`, `opengl`, `go`, `mysql`

> **Implication for matcher:** skill filters must be case-insensitive and support aliases (`c++` ↔ `c/c++`, `js` ↔ `javascript`).

---

## 2. Gaps

### 2.1 Program metadata vs project inventory

- Eight programs have rich **catalog** data (timeline, stipend, eligibility, steps).
- **GSoC** still holds the bulk of inventory (~12k projects). Sample rows exist for Outreachy, LFX, MLH, GSSoC, NSoC via `npm run db:seed-extra`.
- Homepage featured programs remain a curated hardcoded set; program directory is DB-driven.

### 2.2 Data freshness

| Signal | Assessment |
|--------|------------|
| GSoC 2026 ideas | Present (~1.1k projects with `year: 2026`) |
| Non-GSoC orgs/projects | Sample seed present (`db:seed-extra`); full catalogs still need CSV/scrapers |
| Program timelines | Seeded for 2026 cycles; re-verify near each application window |
| `lastVerifiedAt` | Updated on every `npm run db:seed` |

### 2.3 Project tracking (product)

| Capability | Backend | UI (this pass) |
|------------|---------|-----------------|
| Save project/org | `/api/user/saved` | Wired on ProjectCard, OrgCard, Trending, Matcher |
| Track application | `/api/user/applications` | Wired on ProjectCard, Trending, Matcher |
| Dashboard status change | PATCH applications | Inline status select + delete |
| Empty / loading states | APIs + UI | Matcher loading, dashboard empty, trending empty |

### 2.4 Data quality (known)

- Duplicate orgs/projects prevent strict unique indexes (see `setup-indexes.js` fallbacks).
- Tech tokens are mostly lowercase; UI skill chips use Title Case.
- `programId` may be ObjectId or string in legacy docs.

---

## 3. Coverage strategy (how we expand)

### Tier A — Program shell (done via seed)

Add/update program documents so `/programs` and detail pages work **before** org/project ingest:

1. Official name, slug, organizer, website  
2. Stipend / duration / eligibility summary  
3. Timeline milestones for current cycle  
4. Application steps + resource links  
5. `tier`, `accentColor`, `lastVerifiedAt`

**New in this pass**

| Slug | Program | Rationale |
|------|---------|-----------|
| `gssoc` | GirlScript Summer of Code | High-volume beginner-friendly SoC in India; in product vision |
| `nsoc` | Nexus Spring of Code (NSoC) | Official site **https://nsoc.in**; hands-on contribution sprints with mentors |

### Tier B — Organization + project ingest

Per program, when a public ideas list or CSV is available:

```bash
# Template
node scripts/ingest-csv.js --type org --program <slug> --file path/to/orgs.csv
node scripts/ingest-csv.js --type project --program <slug> --file path/to/projects.csv --dry-run
node scripts/ingest-csv.js --type project --program <slug> --file path/to/projects.csv
```

**Priority order for ingest**

1. **GSoC** — maintain yearly refresh (already large)  
2. **LFX / Outreachy** — paid, high user intent  
3. **GSSoC** — large beginner audience; CSV from GirlScript org lists when available  
4. **NSoC (Nexus Spring of Code)**, MLH, SoB, Hacktoberfest — grow beyond sample seed  
5. Re-run `npm run db:seed-extra` after program seed when adding new sample orgs

### Tier C — Continuous freshness

| Cadence | Action |
|---------|--------|
| Per application season | Re-seed timelines; bump `lastVerifiedAt` |
| After each GSoC ideas release | Ingest new year CSV; set `year` correctly |
| Monthly | Run `audit-coverage.js`; watch `noTech` / year skew |
| Before marketing launches | Confirm no fake stats on homepage (empty states only) |

### Tier D — Tracking product completeness

- Save/Track on project & org cards + matcher results  
- Dashboard inline status + unsave  
- Never invent parallel localStorage trackers  

---

## 4. Success metrics

| Metric | Target |
|--------|--------|
| Programs with metadata | ≥ 8 |
| Programs with ≥ 1 org | Grow beyond GSoC-only |
| Matcher skill hit-rate | Case-insensitive match on top 15 techs |
| Save → dashboard | User can save from projects page and see item on `/dashboard` |
| Empty states | No lorem / fake counts when collections empty |

---

## 5. What we will not do (yet)

- Automated scrapers for every program (legal + maintenance cost)  
- Fake org/project rows for empty programs  
- Dropping or renaming existing GSoC fields  

---

## 6. Commands

```bash
npm run db:seed              # upsert all programs including GSSoC + NSoC
node scripts/audit-coverage.js
npm run db:ingest -- --type project --program gsoc --file ./data.csv --dry-run
```
