<p align="center">
  <img src="public/icon.svg" alt="Contribo Logo" width="120" height="120" />
</p>

# 🌐 Contribo — Universal Open Source Programs Hub

> **Contribo** is an enterprise-grade, data-first platform designed to aggregate, explore, and track applications across all major open-source mentorship programs. It serves as a unified command center where contributors can find projects, understand eligibility/stipends, prepare proposals, and track their application progress.

---

## 🚀 Supported Programs

Contribo generalizes open-source opportunity tracking, bringing multiple programs under one standard schema:
*   **Google Summer of Code (GSoC)**
*   **Outreachy**
*   **LFX Mentorship (Linux Foundation)**
*   **MLH Fellowship (Major League Hacking)**
*   *Designed for expansion:* Extendable to Hacktoberfest, Google Season of Docs, C4GT, Season of KDE, CNCF Mentoring, and others.

---

## ✨ Key Features & Pillars

### 1. Discover
*   **Unified Search & Directory:** Search and filter over **12,000+ projects** and **600+ organizations** across all open-source programs.
*   **Command Palette (`Cmd/Ctrl + K`):** Instantly navigate the application, search projects/orgs/guides, and trigger actions using a keyboard-driven palette.
*   **Granular Filtering:** Filter organizations and project ideas by tech stack, difficulty, program, and year.

### 2. Understand
*   **Structured Metadata:** Compare stipends (utility mono numerals), timelines, difficulty levels, and eligibility criteria side-by-side.
*   **Unified Deadline Calendar:** A visual calendar mapping key milestones and application timelines for all programs.
*   **Guidelines Hub:** A comprehensive library of markdown/MDX guides on writing proposals, Git basics, and community communication.

### 3. Prepare
*   **AI Semantic Matcher:** An embeddings-based matching engine. Input your skills and interests, and Contribo generates ranked project recommendations based on cosine similarity against project descriptions.
*   **Pre-application Checklists:** Checklist tools customized for each program to ensure you're application-ready.

### 4. Track (Personal Dashboard)
*   **GitHub-meets-Linear Interface:** Save organizations, track application proposal drafts, set milestones, and get countdown reminders for upcoming deadlines.
*   **Testimonials & Roadmaps:** Real contributor roadmaps and historical data charts.

---

## 🛠️ Technology Stack

*   **Frontend:** [Next.js 16](https://nextjs.org/) (App Router, Server-side Rendering & Static Site Generation), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling & Motion:** [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (for smooth schematic/line-drawing animations)
*   **Database:** [MongoDB](https://www.mongodb.com/) (with text search and compound indexing)
*   **Authentication:** [NextAuth.js Beta 5](https://next-auth.js.org/) (GitHub & Google OAuth)
*   **AI Integration:** [OpenAI SDK](https://github.com/openai/openai-node) (for generating embeddings and matcher logic)
*   **Content Delivery:** [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) (for guidelines and roadmaps)

---

## 🎨 Visual Identity & Aesthetic ("Ledger")

Contribo follows a strict, premium instrument-panel design system:
*   **Color System (Dark & Light modes):**
    *   `bg-base`: Graphite-black (`#0D1013`) in dark mode, cool paper (`#F6F6F4`) in light mode.
    *   `accent-brass`: Muted gold/brass (`#C9A24B` / `#9C7A2E`) used as a premium signal color for stipend highlights and primary CTAs.
    *   `accent-slate`: Slate blue (`#5B7C99` / `#365974`) for informational tags and secondary actions.
    *   `accent-merge`: Forest green (`#3E8863` / `#276B49`) for git-style accepted states.
    *   `accent-alert`: Burnt copper (`#C77B3B` / `#A85A22`) for deadlines and closing states.
*   **Typography:**
    *   *Display:* Neue Haas Grotesk or Söhne for weights at large heading sizes.
    *   *Body:* Inter or IBM Plex Sans for legible copy.
    *   *Utility:* IBM Plex Mono or JetBrains Mono for numbers, dates, tech-tags, stipend amounts, and metadata.

---

## 📂 Project Structure

```bash
Contribo/
├── .agents/                    # Custom agent instructions and workflows
├── public/                     # Static assets, SVG logos, and icons
├── scripts/                    # Database seeding and migration scripts
│   ├── templates/              # Ingestion templates (e.g., CSV formats)
│   ├── ingest-csv.js           # CLI tool to ingest orgs/projects from CSV
│   ├── migrate-gsoc.js         # GSoC specific migration scripts
│   ├── seed-programs.js        # Program-level data seeder
│   └── setup-indexes.js        # MongoDB index configuration
├── src/
│   ├── app/                    # Next.js App Router (Layouts, Pages, APIs)
│   │   ├── api/                # API routes (matcher, programs, auth)
│   │   ├── dashboard/          # Contributor application workspace
│   │   ├── guidelines/         # MDX-based guide pages
│   │   ├── matcher/            # AI Matcher frontend
│   │   ├── organizations/      # Organizations directory
│   │   ├── projects/           # Projects directory
│   │   └── globals.css         # Tailwind v4 configuration and design system tokens
│   ├── components/             # Reusable React components
│   │   ├── hero/               # Hero sections (Schematic hero animation, search, stats)
│   │   └── ui/                 # Command Palette, Cards, Badges, Buttons, etc.
│   ├── lib/                    # Shared library files (Database connection, Hash utilities)
│   ├── auth.ts                 # NextAuth configuration
│   └── proxy.ts                # Dev proxy helper
├── types/                      # TypeScript definitions
├── package.json                # Project dependencies and script runner
└── tsconfig.json               # TypeScript compiler config
```

---

## 🗄️ Database Schema & Collections

Contribo relies on a MongoDB cluster structured with the following collections:

1.  **`programs`**:
    Tracks core mentorship programs. Key fields: `slug`, `name`, `organizer`, `stipendRange`, `durationWeeks`, `tier`, `accentColor`, `eligibilitySummary`, `timeline` (array of events/dates), `applicationSteps`.
2.  **`organizations`**:
    Contains organizations participating in the programs. Key fields: `name`, `slug`, `logoUrl`, `techTags`, `description`, `programId` (Foreign key linking to `programs`).
3.  **`projects`**:
    Contains specific project ideas. Key fields: `title`, `description`, `orgSlug`, `programId` (Foreign key linking to `programs`), `techStack`, `year`, `difficulty`.
4.  **`users` / `accounts` / `sessions`**:
    NextAuth-managed tables for contributor authentication and dashboard persistence.

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB Instance (local or Atlas URI)
*   OpenAI API Key (needed for AI matcher embeddings)
*   GitHub Developer App client credentials (for authentication)

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/contribo-db

# NextAuth Configuration
AUTH_SECRET=your-next-auth-secret
NEXTAUTH_SECRET=your-next-auth-secret
AUTH_URL=http://localhost:3000

# GitHub OAuth Credentials
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Google OAuth Credentials (Optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# AI Matcher Configuration
OPENAI_API_KEY=your-openai-api-key
AI_PROVIDER=openai

# Application Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GSOC_YEAR=2026

# Offline settings (optional - set to 1 if building without internet to mock Google Fonts)
NEXT_FONT_GOOGLE_MOCK=0
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Initialization & Seeding
To populate your MongoDB cluster with core data and indexes:

```bash
# 1. Seed the core open-source programs (GSoC, Outreachy, LFX, MLH)
node scripts/seed-programs.js

# 2. Configure MongoDB search indexes and compound keys
node scripts/setup-indexes.js
```

### 5. Ingesting Organization and Project Data
You can import organizations and projects from CSV files using the CLI ingester script:

```bash
# Ingest Organizations
node scripts/ingest-csv.js --type org --program gsoc --file scripts/templates/organization_template.csv

# Ingest Projects
node scripts/ingest-csv.js --type project --program gsoc --file path/to/your/projects.csv

# Dry-run mode (validates CSV without inserting to the database)
node scripts/ingest-csv.js --type org --program gsoc --file path/to/file.csv --dry-run
```

---

## 🖥️ Development & Building

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build and Run for Production
```bash
# Compile and build the Next.js production bundle
npm run build

# Start the built production server
npm run start
```

### Linting
```bash
npm run lint
```

---

## 🛡️ Guardrails & Core Policies

*   **Additive Schema Only:** Never modify or drop existing shared database fields in the `organizations` or `projects` collections. Only add new fields (e.g., `programId`) to preserve backward compatibility.
*   **Information Integrity:** No placeholder icons, mock names, or `lorem ipsum` in production. Always show clean empty states rather than fallback mock/random data when queries return empty.
*   **Accessibility (WCAG AA):** Entire application must support keyboard navigation (Tab/Shift+Tab), high-contrast focus rings, and proper ARIA semantic structure.

---

## 🛡️ Security Notice

> [!WARNING]
> **Git History Secret Rotation:** If any database connection strings, OAuth client secrets, Auth secrets, or OpenAI API keys were previously hardcoded or committed to git history, those credentials are still retrievable in the git logs. **Rotate any previously exposed credentials immediately** before deploying this application to production.

