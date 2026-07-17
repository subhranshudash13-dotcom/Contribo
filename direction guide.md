Antigravity Direction Guide

Building Contribo as a new platform — same MongoDB cluster, nothing else carried over from GSoCHub

Scope, stated plainly: Contribo is a brand-new codebase — new repo, new frontend, new design system, new file structure. The only things reused from GSoCHub are: the MongoDB database (the 624 organizations, 12,000+ projects, and any other existing collections), and the existing content (guidelines/copy worth keeping, pulled out as data — not old page components). Everything else in this guide exists to make sure Antigravity's agents never blur that line.


1. Before opening Antigravity — what to have ready


A new, empty repo/folder for Contribo. Do not point Antigravity at the old GSoCHub repo as the working Project.
The existing MongoDB connection string (Atlas URI), kept in .env on the new repo — Contribo's new backend connects to the same cluster directly. No export, no import, no migration step.
A short note of the current collection names/fields in that cluster (organizations, projects, plus anything else) — or just let the agent inspect them live via MCP (Section 5) instead of guessing.
If there's GSoCHub content worth keeping (guidelines text, FAQ copy, etc.) that lives in old frontend files rather than the DB, pull it into plain text/markdown now, before starting — that's the only thing you manually carry over; the DB carries itself.

5. Give Antigravity direct, read-only DB access via MCP

Connect Contribo's Antigravity Project to the same MongoDB cluster so agents can inspect the real collections instead of guessing:

json{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mongodb"],
      "env": {
        "MONGODB_URI": "your-existing-connection-string-here"
      }
    }
  }
}

Use a read-only DB user for this MCP connection during normal build work. Only swap in a write-capable connection string for a specific, human-approved task (e.g. adding the programId field), then swap back to read-only immediately after.

Practical use: before any task that touches organizations/projects, prompt the agent to inspect the live collections via this tool and report actual field names and counts back to you before writing code.

6. A dedicated Skill: how the shared data works

.agents/skills/shared-gsoc-data/SKILL.md:

markdown---
name: shared-gsoc-data
description: Use whenever a task touches organizations, projects, programs, or
  the matcher. Explains the shared MongoDB cluster Contribo reads from, and the
  rule for extending it with new Contribo-only concepts.
---

# Shared GSoC Data (read this before touching orgs/projects/programs)

## What's already in the shared cluster (do not regenerate)
- `organizations`: 624 docs — (confirm exact fields via MCP inspection, e.g.
  name, slug, logoUrl, techTags[], description)
- `projects`: 12,000+ docs — (confirm exact fields via MCP inspection, e.g.
  orgId, year, title, description, techStack[], mentors[])

## What Contribo adds on top (new, additive only)
- `programs` collection — new concept, doesn't exist in the old data (GSoC,
  Outreachy, LFX, etc. as first-class entities)
- `programId` field added to existing `organizations`/`projects` docs,
  defaulted to the GSoC program's id — this is the one schema change that
  touches existing documents, and it must be additive (new field only, no
  existing field removed or renamed)
- Any Contribo-specific collections (contributors, applications, matcher data)
  are entirely new — build these fresh, no old-data constraints apply


7. Suggested Workflows (slash commands)

.agents/workflows/:


/inspect-shared-data — connects via MongoDB MCP, reports live document counts and field names for organizations/projects, no code changes — run this first, every session that touches data
/audit-mock-data — greps the Contribo codebase for Math.random, hardcoded arrays, or mock fallbacks anywhere touching orgs/projects/programs
/add-programid-field — the one approved additive migration: adds programId to existing docs, defaults to GSoC, prints before/after counts, run against a local test copy first
/add-program <name> — scaffolds a new program end-to-end (new programs doc, detail route, directory + matcher wiring) using the existing org/project document shape as the template
/verify-real-data — before marking any UI task done, agent opens the built-in browser and confirms displayed numbers/logos match a live query, not a mockup placeholder



8. Autonomy mode by task type

Task typeRecommended modeWhyNew Contribo frontend/UI (no DB writes)Agent-drivenFresh code, low risk, easy to revertReading/inspecting the shared clusterAgent-driven (read-only MCP user)No risk if the MCP connection truly is read-onlyprogramId migration or any schema-additive changeReview-drivenTouches the live shared cluster — human checkpoint requiredAny script capable of deleting/overwriting documentsSecure modeShould essentially never run without direct supervision


9. Guardrails file (grows as you correct agents)

.agents/GUARDRAILS.md, started now:

markdown# Guardrails

- Contribo is a new codebase. Never copy structure/components/logic from the
  old GSoCHub repo — it isn't in this Project's context, and it should stay
  that way.
- Never fall back to mock/random data when a query against the shared cluster
  returns empty — show an empty state instead.
- Never modify or drop `organizations`/`projects` fields — additive only.
- Always run /inspect-shared-data at the start of a session before writing any
  query or schema code.


10. First actual prompt to give Antigravity

Once the files above exist, start with (Plan mode, so you get a reviewable Plan Artifact before anything runs):


"Read AGENTS.md, the data-integrity rule, and the shared-gsoc-data skill. This is a new project called Contribo — do not reference any old codebase. Connect to the shared MongoDB cluster via the MongoDB MCP tool, inspect the organizations and projects collections, and report back the real document counts and field names. Do not write any code yet — just confirm you're working from the real shared data before we start Phase 0."