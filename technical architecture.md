5. TECHNICAL ARCHITECTURE (own section)

5.1 Suggested stack evolution (assuming current stack: React/Next.js + some DB, on Vercel)


Frontend: Next.js (SSR/SSG for SEO on program/org/project pages), Tailwind (matches current aesthetic), component library from Phase 2
Database: Postgres (relational — programs → orgs → projects → contributors fits relational far better than a document store, especially for filtering/joins across 12k+ rows)
Search: Add Algolia or Meilisearch in front of Postgres once you exceed comfortable full-text search performance — critical once you're past ~10-15k combined rows across programs
AI Matcher: Keep as a service layer (embeddings-based matching: skill/interest text → embedding → cosine similarity against project descriptions) — this generalizes cleanly across programs since it's all just "project descriptions," program becomes an extra filter/facet, not a separate model
CMS: Headless CMS (Sanity or a simple Notion-as-CMS integration given team size) for Guidelines Hub content — keeps non-engineers able to edit copy
Auth: GitHub OAuth (audience already has GitHub accounts) + optional email
Hosting: Continue Vercel — fine at this scale


5.2 Data model sketch (conceptual, not code)

Program (id, name, slug, organizer, stipend_range, duration_weeks,
         timeline[], eligibility_summary, accent_color, tier, last_verified_at)
   └─ Organization (id, program_id, name, logo, tech_tags[], description)
         └─ Project (id, org_id, program_id, year, title, description,
                      tech_stack[], difficulty, mentor_names[], status)
Contributor (id, github_id, skills[], interests[], saved_projects[], applications[])
Application (id, contributor_id, project_id, program_id, status, notes, deadline)
GuidelineArticle (id, slug, program_id?, category, title, body_mdx, last_updated)

5.3 API surface (high level)


GET /api/programs, GET /api/programs/:slug
GET /api/organizations?program=&tags=
GET /api/projects?program=&org=&year=&search=
POST /api/matcher (skills/interests → ranked results)
GET /api/guidelines?program=&category=
Auth + dashboard endpoints (existing pattern likely reusable)


