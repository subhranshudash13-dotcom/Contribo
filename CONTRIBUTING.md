# Contributing to Contribo 🚀

Thank you for your interest in contributing to **Contribo**! Contribo is an open-source hub that empowers developers worldwide to discover, prepare for, and track open-source mentorship programs—including Google Summer of Code (GSoC), Outreachy, Linux Foundation Mentorship (LFX), Season of KDE, and **Ensoc Nexus Summer of Code (NSoC)**.

We welcome contributions of all types: bug fixes, UI improvements, new program integrations, documentation updates, and accessibility enhancements.

To keep the development process organized, transparent, and fair to all participants, we adhere to the standards followed by major open-source organizations. **Please read this guide thoroughly before submitting any contributions.**

---

## 📜 Table of Contents
1. [🚨 Critical Policy: Issue Creation & Assignment](#-critical-policy-issue-creation--assignment)
2. [Code of Conduct](#-code-of-conduct)
3. [Finding an Issue](#-finding-an-issue)
4. [Requesting Assignment](#-requesting-assignment)
5. [Local Development Setup](#-local-development-setup)
6. [Branching & Commit Conventions](#-branching--commit-conventions)
7. [Code & Design Standards](#-code--design-standards)
8. [Testing & Quality Checks](#-testing--quality-checks)
9. [Submitting a Pull Request (PR)](#-submitting-a-pull-request-pr)
10. [Review Process & Feedback](#-review-process--feedback)

---

## 🚨 Critical Policy: Issue Creation & Assignment

> [!IMPORTANT]
> **Contributors are free and encouraged to open new issues. However, YOU MUST NOT START WORKING ON AN ISSUE OR SUBMIT A PULL REQUEST UNTIL A MAINTAINER OFFICIALLY ASSIGNS THE ISSUE TO YOU.**

### Why does this rule exist?
- **Prevents Duplicate Work:** In competitive open-source programs like NSoC, multiple contributors often rush to fix the same issue simultaneously. This leads to redundant effort and disappointment when one PR has to be rejected.
- **Architectural Alignment:** Maintainers need to review whether an issue aligns with the project roadmap, verify security considerations, and approve the proposed technical approach before code is written.
- **Fair Opportunity:** We want to ensure equitable distribution of tasks among all participants rather than one person claiming everything.

### Policy Enforcement:
- **Unassigned Pull Requests:** Any PR opened without prior assignment or without a linked assigned issue will be **placed on hold or closed**.
- **One Issue at a Time:** To give everyone a fair chance during NSoC, contributors may only be assigned **one issue at a time**. Once your PR is reviewed and merged, you are free to request another issue.
- **Inactivity Window:** Once assigned, you have **48 to 72 hours** to open a draft PR or provide an update on your progress. If there is no activity or communication, the issue will be unassigned and reassigned to another contributor.

---

## 🤝 Code of Conduct

Contribo follows standard open-source community guidelines. We are committed to providing a friendly, safe, and welcoming environment for all contributors regardless of background, identity, or experience level.

- Be respectful and constructive in comments and reviews.
- Focus on what is best for the community and project.
- Gracefully accept constructive feedback.

---

## 🔍 Finding an Issue

Explore the [GitHub Issues](https://github.com/subhranshudash13-dotcom/Contribo/issues) tab. Issues are labeled to help you navigate:

| Label | Description |
|---|---|
| `good first issue` | Beginner-friendly tasks, great for newcomers to the project. |
| `nsoc-2026` | Official tasks curated for Ensoc Nexus Summer of Code. |
| `difficulty: easy` | Straightforward UI polish, styling fixes, or copy updates. |
| `difficulty: medium` | Feature additions, component logic, database seed expansion, API routes. |
| `area: proposal-studio` | Features related to the proposal drafting workspace. |
| `area: dashboard` | User tracking, bookmarks, checklist, and readiness metrics. |
| `area: resources` | Guides, checklists, search, and onboarding content. |
| `area: programs` | Open-source program catalog, logos, and explorer filters. |

---

## 🙋 Requesting Assignment

### If you find an existing open issue:
1. Verify the issue is **not already assigned** to someone else.
2. Read the issue description and requirements carefully.
3. Leave a comment expressing your interest with a **brief summary of your proposed approach**:
   ```markdown
   Hi @maintainer! I would like to work on this issue under NSoC 2026.
   
   **Proposed Approach:**
   - I will update `src/components/ui/ProgramCard.tsx` to compute status based on timeline dates.
   - I will add a dynamic pulse badge using Tailwind styling compatible with dark mode.
   - I will verify the changes locally with `npm run test` and `npm run lint`.
   
   Could you please assign this to me?
   ```
4. Wait for a maintainer to assign the issue to you before creating branches or writing code.

### If you discover a bug or want to propose a new feature:
1. Search existing issues to confirm it hasn't already been reported.
2. Open a new issue using a descriptive title (e.g. `[Bug] Navigation bar overflows on mobile Safari`).
3. Fill in the issue description with reproduction steps or motivation.
4. Add a note: *"I'd like to work on this once reviewed and approved."*
5. Wait for maintainer review and assignment.

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: `v20.x` or later (Node 22 LTS recommended)
- **npm**: `v10.x` or later
- **Git**
- **MongoDB**: A local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

### 1. Fork and Clone
Fork the repository on GitHub, then clone your fork locally:
```bash
git clone https://github.com/<your-username>/Contribo.git
cd Contribo
```

### 2. Configure Remote Upstream
Keep your fork in sync with the primary repository:
```bash
git remote add upstream https://github.com/subhranshudash13-dotcom/Contribo.git
git fetch upstream
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the necessary variables in `.env`:
- `MONGODB_URI`: Your MongoDB connection string.
- `AUTH_SECRET`: A random string (generate with `openssl rand -base64 32` or similar).
- `OPENAI_API_KEY`: *(Optional, for AI matcher)*

> [!IMPORTANT]
> **OAuth providers are enabled only with real credentials.** Leaving `AUTH_GITHUB_*` / `AUTH_GOOGLE_*` at their `.env.example` placeholders is fine — the login page simply hides those buttons instead of failing with a Configuration error. If you do configure GitHub, set your OAuth app's **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`. Note that `npm run db:*` scripts read `.env` via dotenv, while Next.js also loads `.env.local` (which overrides `.env`).

### 5. Seed the Database
Populate the program and sample project database:
```bash
npm run db:setup
```

### Sync Hacktoberfest partners and projects

After configuring a development database in `.env`, run either command from the repository root:

```bash
npm run db:sync-hacktoberfest
# Equivalent:
node scripts/sync-hacktoberfest.js
```

The script reads `.env` with dotenv; existing shell variables take precedence. It uses
`MONGODB_DB` first, then the database in `MONGODB_URI`, and refuses an implicit database.
For local development, set `MONGODB_DB=contribo_dev` and use your local MongoDB URI.
Verify the target before running; do not use production credentials. Never share the URI.

The sync upserts the Hacktoberfest program, 14 partner organizations, and 14 verified
repository projects for 2026. Organizations are keyed by program and slug; projects
by program, organization, title, and year. Repeating the command retains the same IDs
and values. It preserves other programs, historical projects, and existing curated
fields such as stars, difficulty, and mentors. It does not delete legacy catalog entries.
Unknown metrics and participation history are not invented. Gauge (withgauge.com)
is a confirmed sponsor but has no verified public project repository in this catalog.
Repository inclusion provides ecosystem learning resources, not automatic challenge eligibility.

Metadata was checked on 2026-10-24 against the [official sponsor wall](https://hacktoberfest.com/)
and each linked project repository. The roadmap follows the [participant FAQs](https://hacktoberfest.com/questions/),
[Fest directory](https://hacktoberfest.com/fests/), [DEV Challenges](https://dev.to/challenges),
[Global Hack Week](https://ghw.mlh.com/events/open-source), and [sticker milestones](https://hacktoberfest.com/online/).
The issue's former `/participation/` URL returns 404, so the roadmap uses `/questions/`.
The GHW URL now names the October event "Hacktoberfest". The 3/10/15 milestones count
virtual stickers: a physical pack, a bonus holographic sticker, then Completionist status
and raffle entry. They are not physical pack sizes.

### 6. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌿 Branching & Commit Conventions

### Branch Naming
Always branch off the latest `main` branch:
```bash
git checkout main
git pull upstream main
git checkout -b <type>/<short-description>
```
Examples:
- `feat/proposal-studio-markdown-preview`
- `fix/dark-mode-contrast-footer`
- `docs/nsoc-contributor-guide`
- `refactor/resource-search-filter`

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```text
<type>(<scope>): <short imperative description>

[optional body]

[optional footer(s)]
```

**Allowed Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, white-space)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding or correcting tests
- `chore`: Changes to build process, dependency updates, or tooling

**Examples:**
```bash
git commit -m "feat(resources): add copy-to-clipboard button for code snippets"
git commit -m "fix(programs): resolve date parsing overflow in program timeline"
git commit -m "docs: add nsoc onboarding guidelines"
```

---

## 🎨 Code & Design Standards

### Tech Stack Overview
- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind CSS v4, Vanilla CSS variables
- **Language:** TypeScript (Strict mode enabled)
- **Database:** MongoDB Node.js official driver
- **Animations:** Framer Motion

### Design Rules
1. **Accessibility (WCAG AA):**
   - Ensure adequate color contrast in both light and dark themes.
   - Interactive elements must have visible focus rings (`focus-visible:ring-2 focus-visible:ring-accent`).
   - Icon-only buttons must have descriptive `aria-label`s.
2. **Design Aesthetic:**
   - Contribo uses curated HSL tokens (`bg-surface`, `bg-surface-raised`, `border-hairline`, `text-primary`, `text-secondary`, `text-accent`). Avoid arbitrary plain color utilities like `bg-red-500` or `text-black`.
   - Ensure responsive layouts across mobile (375px+), tablet (768px+), and desktop (1024px+).
3. **No Unused Imports or Any Types:**
   - Strictly type all props and state. Avoid using `any`.
   - Clean up unused imports before committing.

---

## 🧪 Testing & Quality Checks

Before submitting a PR, verify all linting and test suites pass locally:

```bash
# 1. Run ESLint checks
npm run lint

# 2. Run unit and integration tests
npm test

# 3. Check database coverage integrity (if modifying seeds or repos)
npm run audit
```

If any command fails, fix the errors before pushing your branch.

---

## 🚀 Submitting a Pull Request (PR)

1. **Push your branch to your fork:**
   ```bash
   git push origin feat/your-feature-name
   ```
2. **Open a Pull Request:**
   - Go to your fork on GitHub and click **"Compare & pull request"**.
   - Target base repository: `subhranshudash13-dotcom/Contribo` on branch `main`.
3. **Fill out the PR Template:**
   - **Title:** Keep it clear and prefixed with conventional commit types, e.g., `feat(ui): add word counter to Proposal Studio`.
   - **Linked Issue:** Explicitly link the issue you were assigned:
     ```markdown
     Closes #<issue_number>
     ```
   - **Description:** Summarize the changes made and any design decisions.
   - **Visual Proof:** For any UI/UX change, **attach screenshots or a screen recording (GIF/MP4)** demonstrating the fix in both **light and dark modes**.
4. **Mark as Draft (Optional):** If your work is still in progress, open it as a **Draft PR** so maintainers know not to review it yet.

---

## 💬 Review Process & Feedback

- Maintainers and reviewers will review your PR as soon as possible.
- **Review Comments:** If changes are requested, do not close the PR. Simply make the changes locally, commit them, and push to your feature branch. The PR will update automatically.
- **Be Patient & Professional:** Open-source maintainers may be in different time zones. Avoid repeatedly pinging maintainers in issues or PRs within 24 hours of submission.
- **Celebration 🎉:** Once your PR is approved and CI passes, a maintainer will merge your PR and assign points/recognition according to NSoC guidelines!

---

**Happy Contributing! Together, let's make open source accessible to everyone.** ✨
