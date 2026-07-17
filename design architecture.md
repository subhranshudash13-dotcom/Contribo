4.1 Color palette — "Ledger" (navy · graphite · brass)

Grounded in the instrument-panel/schematic idea: deep graphite and navy structure, with a muted brass/gold as the premium signal color (the color of a good fountain pen or a private bank's foil-stamped letterhead — reads as trustworthy and premium without reading as "AI-generated tech startup"), a slate-blue as the informational/link color, and a muted forest green for the one semantic borrowed directly from git: merged/accepted/matched.

Dark mode

TokenHexUsebg-base#0D1013page background — graphite-black, warmer/softer than pure blackbg-surface #161A1F cards, panelsbg-surface-raised #1F252C modals, hover elevationborder-hairline #2A3138 dividers, schematic linestext-primary #E9EAEA headings, bodytext-muted #8D9299  captions, metadataaccent-brass #C9A24B primary CTAs, stipend highlights, premium signalaccent-slate #5B7C99 links, informational tags, secondary actionsaccent-merge #3E8863 matched/accepted/merged states (git-derived semantic)accent-alert #C77B3B deadlines, "closing soon" (burnt copper, not red — calmer)

Light mode

TokenHexUsebg-base #F6F6F4 page background — cool paper, not creambg-surface #FFFFFF cards, panelsbg-surface-raised #EFEFEC hover elevationborder-hairline #DCDCD8 dividers, schematic linestext-primary #16181A headings, bodytext-muted #5A5E63 captions, metadataaccent-brass #9C7A2E (deepened for contrast on white)primary CTAs, stipend highlightsaccent-slate #365974 links, informational tagsaccent-merge #276B49 matched/accepted statesaccent-alert #A85A22 deadlines

Each program still gets exactly one accent chip layered on this neutral base (drawn from that program's own real brand color where possible — Outreachy's coral, LFX's Linux Foundation blue — since these are real trademarked identities, not invented tints). This is the only place saturated, varied color is allowed in; the platform's own chrome stays disciplined to graphite/brass/slate.

Theme toggle lives in the top nav as a small labeled switch (not just a sun/moon icon — label it "Light / Dark" in the utility mono face, which itself reinforces the instrument-panel feel). Defaults to OS preference, persists per user.

4.2 Typography


Display face: Söhne or Neue Haas Grotesk Display — a precise, slightly condensed grotesk with real optical weight at large sizes. Used only for H1/H2 and the hero headline. Avoid rounded/friendly geometric sans (Poppins-style) entirely — that reads as consumer-app, not enterprise-instrument.
Body face: Inter or IBM Plex Sans — IBM Plex in particular is a deliberate choice: it's literally IBM's enterprise design-system typeface, so using it (or something in its family) for body copy is a small, real signal of "enterprise-grade" rather than "generated."
Utility/data face: IBM Plex Mono or JetBrains Mono for every number, date, tech-tag, org handle, and stat. Non-negotiable for stipend amounts and deadlines specifically — money and dates in mono is what makes a dashboard feel audited rather than decorated.


4.3 Imagery, logos & iconography — the section that carries most of the "real, not vibe-coded" weight

Program & organization logos


Use each program's actual official SVG logo (GSoC, Outreachy, LFX, CNCF, MLH, etc.) pulled from their published brand/press kits, stored locally as optimized SVGs — never a generic AI-drawn approximation of a logo. Real trademarks signal "this is a real, current directory," not a mockup.
Store two variants per logo where the source provides them: full-color (for program detail hero) and a single-tone currentColor version (for compact list/grid views in both themes) so logos don't clash with the graphite/brass system at small sizes.
For the 624 GSoC organizations, same rule: real org logos (already available from your existing dataset), displayed at a consistent bounding box (e.g., 40×40px) with consistent padding so a hand-drawn indie-project logo and a polished corporate one sit at equal visual weight in a grid.
Add a brief visible attribution/brand-guideline note in the footer ("Program and organization logos are trademarks of their respective owners") — small detail, but it's exactly the kind of care an "enterprise-grade, not vibe-coded" product has and a rushed one skips.


The platform's own logo


Not a gradient circle or abstract blob (the current #1 AI-startup-logo cliché). Direction: a wordmark-led logo — the platform name set in the display face, paired with a small monogram built from the branch-graph signature itself (a single node with two lines merging into it — literally one piece of the hero graphic, reused as the mark). This ties identity directly to the one real idea in the whole system instead of an arbitrary icon.
Deliver as SVG in both a full-color and a single-color (currentColor) version for dark/light and for favicon/social-share use.


Photography & illustration policy


No stock photography of generic people at laptops, and no blob-character illustration. Two approved image categories only:

Real product screenshots inside a plain browser-chrome frame (thin, correct-looking window bar — no fake glossy MacBook mockups) — used in the hero and feature sections to show the actual dashboard/matcher, because showing the real tool is more convincing than illustrating a metaphor for it.
Technical line-diagrams in the branch-graph/schematic style (SVG, hairline strokes, brass/slate accents) for anything conceptual — "how matching works," "your application journey," the comparison widget.



If a human element is ever needed (e.g., a contributor testimonial section in Phase 5), use real photos of real contributors/mentors (with permission) rather than any illustrated or AI-generated face — a single real, slightly imperfect photo reads as more trustworthy than a polished illustrated avatar.


Iconography


One icon family only, used at one stroke weight throughout: Phosphor Icons or Lucide, both in their "regular"/1.5px-stroke variants — never mix in emoji or filled Material-style icons alongside them.
Icons are functional labels (search, filter, external-link, calendar), never decorative filler next to headings "just because it looks nice."


4.4 Layout concept


Hero is the branch graph itself, rendered as a real technical diagram (hairline strokes, brass node at the convergence point, small mono-face labels naming each program branch) — animated on load, not a headline over a gradient blob.
Directly beneath the hero: a thin live-stats strip in the mono face using your real current numbers ("12,482 projects · 624 organizations · 9 programs tracked · updated Jun 2026") — the specificity and the "updated" timestamp are both realism signals.
Body layouts are dense, grid-aligned, and information-forward (8px base spacing grid) — this is a working tool for a decision with money and deadlines attached, not a landing page trying to sell a feeling.
Cards: 1px hairline border, near-zero shadow, a 1–2px brass or program-accent top rule — elevation communicated by background-tone shift (bg-surface → bg-surface-raised) rather than shadow blur, which keeps the enterprise-instrument feel instead of a soft consumer-app feel.


4.5 Key UI patterns to design


Program card: real logo (currentColor variant), name, stipend chip (mono numerals, brass), duration chip, single accent-colored top hairline
Timeline / branch bar: the schematic connector motif showing application → results → coding period, per program
Comparison widget: 2–3 programs' branch-lines run side by side so duration/timing differences are legible at a glance, real logos anchoring each column
Unified deadline calendar: month grid, program-accent dots, mono-face date numerals
Matcher result card: program logo + org logo + project title + reasoning, with the "match" itself shown as a branch merging into a labeled node — reuses the signature motif instead of a generic percentage badge or a gradient "AI match!" pill
Empty/loading/error states: designed in both themes, calm and specific copy (see 4.7)


4.6 Motion


One orchestrated moment: the hero schematic draws in on load (SVG line-draw, ~800ms, eased) — the single place "boldness" is spent
Elsewhere: quiet functional micro-interactions only — hover raises a card by one background-tone step, theme toggle crossfades, timeline bars fill on scroll-into-view once
Respect prefers-reduced-motion everywhere — swap animated reveals for instant appearance


4.7 Writing/microcopy direction


Plain and specific: "3 open Outreachy projects match your skills," not "Unlock your potential!"
Empty states explain and invite action: "No projects match these filters yet — try widening the tech stack," not a bare "No results."
Deadline copy stays factual, never manufactured urgency: "Applications close in 6 days," not "Hurry, don't miss out!"


4.8 UX flows to map explicitly


New visitor → "I don't know what program fits me" → Guidelines "how to choose" → Matcher → Program detail → Org → Project → Save to dashboard
Returning contributor → Dashboard → tracked applications across programs → deadline reminders
Power user → Direct search/filter across all 12k projects without going through matcher


4.9 Design deliverables


Full design system file: both token sets (dark/light), type scale, 8px spacing grid, component library, the branch-graph signature asset and platform monogram as reusable SVGs
A sourced logo library: official SVGs for every program and organization, each with a currentColor variant generated
8–10 high-fidelity screens in both themes: Home (with animated schematic hero + live-stats strip), Programs Directory, Program Detail, Guidelines Hub, Comparison tool, Matcher result, Dashboard, Project detail, empty/error states
A final pass against the Section 4.0 realism checklist on every screen before build sign-off