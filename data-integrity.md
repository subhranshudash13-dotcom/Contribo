# Rule: Data Integrity

- Contribo is a new codebase that shares GSoCHub's MongoDB cluster. Treat
  `organizations` and `projects` as production data belonging to a live system
  from day one — not test/seed data, even though this repo is brand new.
- Every stat or count shown in the UI ("12,482 projects", "624 organizations")
  must come from a live query against this shared cluster — never hardcoded,
  even as a temporary placeholder during UI building. Use a real query with a
  loading state instead.
- When adding new schema (a `programs` collection, a `programId` field on
  existing documents, matcher-related collections), the change must be
  additive and reviewed before running against the shared cluster. Test
  schema changes against a local MongoDB instance seeded from a READ-ONLY
  export first if there's any doubt.
- Never run a script that deletes or bulk-modifies `organizations`/`projects`
  documents without explicit human approval immediately before running it.