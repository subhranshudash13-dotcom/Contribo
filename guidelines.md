2. REQUIREMENTS (Functional + Non-Functional)

2.1 Functional Requirements

AreaRequirementProgramsList, filter, search all open source programs; each has detail pageOrganizationsFilterable by program, tech stack, topic (ML, Web, Blockchain, etc.)Projects12,000+ searchable; filter by year, org, program, difficulty, techAI MatcherInput skills/interests → ranked project + program matches with reasoningGuidelinesStatic/CMS content per program: eligibility, timeline, stipend, application processDashboardSaved projects, application tracker, deadline reminders, notesAuthLogin (GitHub OAuth strongly preferred — target audience already has GitHub)SearchGlobal search bar (already present) — extend to cross-programAdminInternal CMS/admin panel to add/edit programs, orgs, projects without a redeploy

2.2 Non-Functional Requirements


Performance: 12,000+ project dataset must be paginated/indexed (Elasticsearch/Algolia or Postgres full-text search) — do not client-side filter all 12k records
SEO: SSR/SSG for program, org, and project pages (Next.js — you're likely already using this given Vercel deploy)
Accessibility: WCAG AA minimum — contrast, keyboard nav, screen-reader labels (dark theme especially needs contrast checking)
Scalability: Schema must support N programs without schema migration each time
Data integrity: Versioned ingestion (know when a program's data was last verified/updated — show "last updated" per program)
Security: Rate-limit AI matcher endpoint, sanitize any user-submitted content, standard OAuth practices



3. CONTENT PLAN (own page: /guidelines + /programs/[slug])

This is the layer your current site is missing entirely — GSoC-only sites don't need it because everyone already knows GSoC's rules. A multi-program hub lives or dies on this.

3.1 Programs Directory content (per program, minimum fields)


Name, logo, one-line tagline, accent color
Organizing body (Google, Linux Foundation, Software Freedom Conservancy, etc.)
Stipend range
Duration (weeks)
Timeline (application open/close, results, coding period) — ideally as a visual timeline bar
Eligibility summary (age, student status, region restrictions, underrepresented-group focus, etc.)
Tech focus / domains
"Best for" one-liner (e.g., "Best for: students wanting long mentorship + biggest stipend" vs "Best for: underrepresented groups in tech")
Official link + your internal project/org browse link


Confirmed programs to seed the directory (from research), grouped by tier:

Tier 1 — high stipend, well known, prioritize first:
GSoC, Outreachy, LFX Mentorship, MLH Fellowship, Season of Docs, Season of KDE

Tier 2 — solid stipend, active:
Linux Kernel Mentorship, LFN (Linux Foundation Networking) Mentorship, CNCF Mentoring, Open Mainframe Project Mentorship, Summer of Bitcoin, Hyperledger Mentorship, C4GT (Code for GovTech), FOSSEE Summer Fellowship

Tier 3 — swag/recognition-based or contest-style (great for beginners, no stipend):
Hacktoberfest, GirlScript Summer of Code (GSSoC), 24 Pull Requests, FOSSASIA Codeheat, Julia Seasons of Contributions


Note: exact dates/stipends shift yearly — build the schema so these are data fields, not hardcoded copy, and mark each program with a "last verified" date so you're never accidentally showing stale deadlines.



3.2 Guidelines Hub content (separate from program pages — this is the "how do I actually succeed" layer)


How to choose a program (decision-helper: student vs professional, stipend vs experience, region eligibility)
How to write a proposal (generic + program-specific tips)
How to make your first contribution (git basics, finding good-first-issues, communicating with mentors)
Application timeline calendar — a single unified calendar view merging every program's key dates (huge differentiator vs any single-program site)
Glossary (PR, issue, mentor, proposal, community bonding period, etc.) — useful for first-year students specifically
FAQ per program + platform-wide FAQ


3.3 Content ownership & format


Store as MDX or headless CMS entries (Sanity/Contentful/Notion-as-CMS), not hardcoded JSX strings — so you (or teammates) can update guidelines without a code deploy
Every content page needs a visible "last updated" date — trust matters a lot for deadline-sensitive content