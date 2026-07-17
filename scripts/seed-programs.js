require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const PROGRAMS_DATA = [
  {
    slug: "gsoc",
    name: "Google Summer of Code",
    organizer: "Google",
    stipendRange: "$1500 - $3300",
    durationWeeks: 12,
    tier: 1,
    accentColor: "#4285F4",
    eligibilitySummary: "University students and beginners 18+ to open source",
    officialWebsite: "https://summerofcode.withgoogle.com",
    applicationSteps: [
      "Browse participating organizations and their project ideas list starting in February.",
      "Engage with the community in their communication channels (Slack, Discord, IRC, mailing lists).",
      "Write a detailed technical proposal outlining your implementation plan.",
      "Submit your project proposal on the official GSoC dashboard."
    ],
    difficulty: "Intermediate",
    pastStats: [
      { year: "2025", contributors: 1220, orgs: 178, projects: 1220 },
      { year: "2024", contributors: 1180, orgs: 160, projects: 1180 }
    ],
    resources: [
      { title: "GSoC Contributor Guide", url: "https://google.github.io/gsocguides/student/" },
      { title: "Writing a Proposal Guide", url: "/resources#proposal-writing" },
      { title: "Git Guide", url: "/resources#git-guide" }
    ],
    timeline: [
      { event: "Organization Applications Open", date: "2026-01-22" },
      { event: "Accepted Orgs Announced", date: "2026-02-23" },
      { event: "Contributor Applications Open", date: "2026-03-24" },
      { event: "Application Deadline", date: "2026-04-13" },
      { event: "Accepted Projects Announced", date: "2026-05-04" },
      { event: "Coding Period Begins", date: "2026-06-01" },
      { event: "Results Announced", date: "2026-09-03" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "outreachy",
    name: "Outreachy",
    organizer: "Software Freedom Conservancy",
    stipendRange: "$7000",
    durationWeeks: 13,
    tier: 1,
    accentColor: "#E37154",
    eligibilitySummary: "Underrepresented groups subject to systemic bias in tech, 18+ globally, remote",
    officialWebsite: "https://www.outreachy.org",
    applicationSteps: [
      "Submit the initial application explaining your background and eligibility.",
      "Participate in the 4-week contribution period, submitting PRs to selected projects.",
      "Work with mentors to finalize a project proposal and submit it before the deadline."
    ],
    difficulty: "Beginner to Intermediate",
    pastStats: [
      { year: "2025", contributors: 154, orgs: 35, projects: 154 },
      { year: "2024", contributors: 142, orgs: 31, projects: 142 }
    ],
    resources: [
      { title: "Outreachy Applicant Guide", url: "https://www.outreachy.org/docs/applicant/" },
      { title: "Contribution Phase Tips", url: "/resources#finding-first-issues" }
    ],
    timeline: [
      { event: "Initial Applications Open", date: "2026-08-01" },
      { event: "Initial Application Deadline", date: "2026-08-31" },
      { event: "Contribution Period Begins", date: "2026-10-06" },
      { event: "Internships Start", date: "2026-12-07" },
      { event: "Internships End", date: "2027-03-05" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "lfx",
    name: "LFX Mentorship",
    organizer: "Linux Foundation",
    stipendRange: "$3000 - $6000",
    durationWeeks: 12,
    tier: 1,
    accentColor: "#00C0F3",
    eligibilitySummary: "Developers 18+ interested in cloud-native, kernel, and open-source infrastructure",
    officialWebsite: "https://mentorship.lfx.linuxfoundation.org",
    applicationSteps: [
      "Create a profile on the LFX Mentorship portal.",
      "Apply to up to 3 active projects in your cohort of interest (Spring, Summer, or Fall).",
      "Submit your resume, cover letter, and complete screening tasks if requested."
    ],
    difficulty: "Intermediate to Advanced",
    pastStats: [
      { year: "2025", contributors: 840, orgs: 48, projects: 840 },
      { year: "2024", contributors: 760, orgs: 42, projects: 760 }
    ],
    resources: [
      { title: "LFX Documentation", url: "https://docs.linuxfoundation.org/lfx/mentorship" },
      { title: "Interview Tips", url: "/resources#interview-tips" }
    ],
    timeline: [
      { event: "Applications Open (Summer)", date: "2026-04-15" },
      { event: "Application Deadline", date: "2026-05-15" },
      { event: "Mentorship Term Starts", date: "2026-06-01" },
      { event: "Mentorship Term Ends", date: "2026-08-28" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "hacktoberfest",
    name: "Hacktoberfest",
    organizer: "DigitalOcean",
    stipendRange: "Swag & Digital Badge",
    durationWeeks: 4,
    tier: 3,
    accentColor: "#FF7A00",
    eligibilitySummary: "Open to anyone worldwide, no experience required",
    officialWebsite: "https://hacktoberfest.com",
    applicationSteps: [
      "Register on the Hacktoberfest official site during October.",
      "Find repositories participating in Hacktoberfest (labeled with 'hacktoberfest').",
      "Make 4 valid pull requests to opt-in projects between Oct 1 and Oct 31."
    ],
    difficulty: "Beginner Friendly",
    pastStats: [
      { year: "2025", contributors: 142000, orgs: 8200, projects: 24000 },
      { year: "2024", contributors: 153000, orgs: 9100, projects: 28000 }
    ],
    resources: [
      { title: "Hacktoberfest Participant Guide", url: "https://hacktoberfest.com/participation/" },
      { title: "Git Guide", url: "/resources#git-guide" },
      { title: "First PR Guide", url: "/resources#first-pr" }
    ],
    timeline: [
      { event: "Registration Opens", date: "2026-09-26" },
      { event: "Coding Period Starts", date: "2026-10-01" },
      { event: "Coding Period Ends", date: "2026-10-31" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "summer-of-bitcoin",
    name: "Summer of Bitcoin",
    organizer: "Bitcoin Association",
    stipendRange: "$3000 (BTC)",
    durationWeeks: 12,
    tier: 2,
    accentColor: "#F7931A",
    eligibilitySummary: "University students worldwide, 18+",
    officialWebsite: "https://www.summerofbitcoin.org",
    applicationSteps: [
      "Fill out the application form on the website with your background.",
      "Complete the screening challenge consisting of algorithmic and cryptographic questions.",
      "Connect with Bitcoin core or ecosystem project mentors to write a proposal."
    ],
    difficulty: "Advanced",
    pastStats: [
      { year: "2025", contributors: 92, orgs: 18, projects: 92 },
      { year: "2024", contributors: 86, orgs: 14, projects: 86 }
    ],
    resources: [
      { title: "Getting Started with Bitcoin Dev", url: "https://bitcoin.design/guide/" },
      { title: "Proposals Tips", url: "/resources#proposal-writing" }
    ],
    timeline: [
      { event: "Applications Open", date: "2026-01-01" },
      { event: "Application Deadline", date: "2026-02-15" },
      { event: "Coding Phase Starts", date: "2026-05-18" },
      { event: "Coding Phase Ends", date: "2026-08-10" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "mlh-fellowship",
    name: "MLH Fellowship",
    organizer: "Major League Hacking",
    stipendRange: "$1000 - $5000",
    durationWeeks: 12,
    tier: 1,
    accentColor: "#0A2540",
    eligibilitySummary: "Students, bootcamp grads, and self-taught developers globally",
    officialWebsite: "https://fellowship.mlh.io",
    applicationSteps: [
      "Apply online with a high-quality code sample showing your skills.",
      "Complete a 10-minute behavior screening interview.",
      "Complete a 15-minute technical code review interview with a technical assessor."
    ],
    difficulty: "Intermediate",
    pastStats: [
      { year: "2025", contributors: 420, orgs: 15, projects: 420 },
      { year: "2024", contributors: 380, orgs: 12, projects: 380 }
    ],
    resources: [
      { title: "MLH Fellowship FAQ", url: "https://fellowship.mlh.io/faq" },
      { title: "Resume Tips", url: "/resources#resume-tips" },
      { title: "Interview Tips", url: "/resources#interview-tips" }
    ],
    timeline: [
      { event: "Applications Open (Summer)", date: "2026-01-15" },
      { event: "Application Deadline", date: "2026-04-01" },
      { event: "Summer Cohort Starts", date: "2026-06-08" },
      { event: "Summer Cohort Ends", date: "2026-08-28" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "gssoc",
    name: "GirlScript Summer of Code",
    organizer: "GirlScript Foundation",
    stipendRange: "Certificates & swag (unpaid mentorship)",
    durationWeeks: 12,
    tier: 2,
    accentColor: "#F98125",
    eligibilitySummary: "Students and beginners worldwide; no strict age barrier; beginner-friendly open source contributions",
    officialWebsite: "https://gssoc.girlscript.tech",
    applicationSteps: [
      "Register as a contributor on the official GSSoC portal when registrations open.",
      "Browse participating projects and pick repositories that match your stack.",
      "Open issues and PRs following project contribution guidelines during the coding period.",
      "Stay active on community channels and complete assigned milestones for certificates."
    ],
    difficulty: "Beginner Friendly",
    pastStats: [
      { year: "2025", contributors: 12000, orgs: 200, projects: 450 },
      { year: "2024", contributors: 10000, orgs: 180, projects: 400 }
    ],
    resources: [
      { title: "GirlScript Foundation", url: "https://www.girlscript.tech" },
      { title: "First PR Guide", url: "/resources#first-pr" },
      { title: "Git Guide", url: "/resources#git-guide" }
    ],
    timeline: [
      { event: "Contributor Registration Opens", date: "2026-05-01" },
      { event: "Projects Announced", date: "2026-05-20" },
      { event: "Coding Period Begins", date: "2026-06-01" },
      { event: "Coding Period Ends", date: "2026-08-31" },
      { event: "Results & Certificates", date: "2026-09-15" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "nsoc",
    name: "Nexus Spring of Code (NSoC)",
    organizer: "Nexus Spring of Code Community",
    stipendRange: "Certificates + mentorship (non-stipend program)",
    durationWeeks: 2,
    tier: 3,
    accentColor: "#8B5CF6",
    eligibilitySummary: "Developers and students of all levels looking to build practical open-source skills through hands-on, multi-day contribution sprints with industry mentors",
    officialWebsite: "https://nsoc.in",
    applicationSteps: [
      "Visit nsoc.in for project guidelines and registration details.",
      "Browse curated project listings and pick one aligned with your skills.",
      "Register as a participant and join the contributor community.",
      "Build, contribute, and receive mentorship from industry experts during the program sprint."
    ],
    difficulty: "Beginner",
    pastStats: [
      { year: "2025", contributors: 200, orgs: 15, projects: 25 },
      { year: "2024", contributors: 150, orgs: 10, projects: 18 }
    ],
    resources: [
      { title: "NSoC official site", url: "https://nsoc.in" },
      { title: "Contribution Guidelines", url: "/guidelines" }
    ],
    timeline: [
      { event: "Registration Opens", date: "2026-03-01" },
      { event: "Registration Closes", date: "2026-03-15" },
      { event: "Contribution Sprint Starts", date: "2026-03-20" },
      { event: "Sprint Ends + Results", date: "2026-04-05" }
    ],
    lastVerifiedAt: new Date()
  },
  {
    slug: "esoc",
    name: "European Summer of Code (ESoC)",
    organizer: "European Open Source & AI Hubs",
    stipendRange: "€4800+",
    durationWeeks: 12,
    tier: 1,
    accentColor: "#003399",
    eligibilitySummary: "Open to students, developers, and beginners worldwide, with a focus on European open-source and applied AI projects.",
    officialWebsite: "https://www.esoc.dev",
    applicationSteps: [
      "Register on the official esoc.dev platform during the application window.",
      "Explore the list of open-source and applied AI projects in the project registry.",
      "Connect with project mentors via the designated communication channels.",
      "Draft and submit a technical project proposal before the deadline."
    ],
    difficulty: "Beginner to Intermediate",
    pastStats: [
      { year: "2025", contributors: 120, orgs: 25, projects: 120 }
    ],
    resources: [
      { title: "ESoC Official Website", url: "https://www.esoc.dev" },
      { title: "Proposal Guidelines", url: "/resources#proposal-writing" }
    ],
    timeline: [
      { event: "Information Sessions", date: "2026-01-25" },
      { event: "Applications Open", date: "2026-02-15" },
      { event: "Application Deadline", date: "2026-03-15" },
      { event: "Accepted Projects Announced", date: "2026-04-10" },
      { event: "Coding Period Begins", date: "2026-05-01" },
      { event: "Coding Period Ends", date: "2026-07-31" },
      { event: "Final Evaluations & Results", date: "2026-08-15" }
    ],
    lastVerifiedAt: new Date()
  }
];

function resolveDatabaseName(uri) {
  if (process.env.MONGODB_DB && process.env.MONGODB_DB.trim()) {
    return process.env.MONGODB_DB.trim();
  }
  try {
    const parsed = new URL(
      uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://')
    );
    const pathName = parsed.pathname?.replace(/^\//, '').split('?')[0];
    if (pathName) return pathName;
  } catch {
    // ignore
  }
  return 'contribo';
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }

  const dbName = resolveDatabaseName(uri);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected successfully to MongoDB for program seeding (database: ${dbName}).`);
    const db = client.db(dbName);
    const programsCollection = db.collection('programs');

    for (const progData of PROGRAMS_DATA) {
      const existing = await programsCollection.findOne({ slug: progData.slug });
      
      // Keep dates clean
      const cleanedTimeline = progData.timeline.map(t => ({
        event: t.event,
        date: new Date(t.date)
      }));

      const docToSave = {
        ...progData,
        timeline: cleanedTimeline,
        lastVerifiedAt: new Date()
      };

      if (existing) {
        console.log(`Updating existing program: ${progData.name} (${progData.slug})...`);
        await programsCollection.updateOne(
          { _id: existing._id },
          { $set: docToSave }
        );
      } else {
        console.log(`Inserting new program: ${progData.name} (${progData.slug})...`);
        await programsCollection.insertOne(docToSave);
      }
    }

    console.log("Seeding program data completed successfully.");

  } catch (err) {
    console.error("Error seeding program data:", err);
  } finally {
    await client.close();
  }
}

main();
