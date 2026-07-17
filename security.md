test 1 : 
Before deploying this app, do a full secret safety pass across the entire codebase. Here's exactly what to check and fix: 

1. Move all secrets to environment variables. Find every API key, password, token, database URL, and credential in the code. No secret should exist as a string literal anywhere in the source code — not in config files, not in utility functions, not in comments, nowhere. 

2. Check these specifically: Supabase keys — the anon key is designed to be used client-side, but ONLY if Row Level Security is enabled on every table; without RLS it exposes your entire database. The service role key must NEVER appear in client-side code under any circumstances. Stripe keys (publishable AND secret) — only the publishable key goes client-side; the secret key stays server-side only. Database connection strings (MongoDB URI, PostgreSQL URL) — environment variable only, never hardcoded. OAuth client secrets and JWT signing secrets — server-side only. Any third-party API key (OpenAI, SendGrid, Twilio, Firebase, AWS) — all must be in env vars. 

3. Check frontend exposure. React/Next.js exposes any env var prefixed with NEXT_PUBLIC_ or REACT_APP_ to the browser — make sure no sensitive key uses these prefixes. Only public-safe values (like a Supabase anon key WITH RLS enforced) should be exposed to the client. 

4. Gitignore and .env.example. Make sure .env is in .gitignore. Create a .env.example file that lists all required variables with placeholder values but no real secrets. 

5. Check logs and responses. Check console.log, error handlers, and API responses — make sure none of them accidentally print or return secrets, tokens, or connection strings. 

6. Git history warning. If any secret was previously hardcoded, that old value is still in git history. Add a warning in README: rotate any previously hardcoded secrets immediately. Show me a summary of every secret you found, where it was, and what you moved it to.

test 2 : Do a full audit of how user personal data moves through this app. I need to know exactly where sensitive data enters, where it travels, and where it ends up. 

1. Map all data collection points. Find every place the app collects user data — emails, phone numbers, passwords, names, addresses, dates of birth, payment info, IP addresses, device info. For each one, trace where that data goes after collection. 

2. Clean all logs. Check every console.log, logger, print statement, and error handler. If ANY of them output user emails, passwords, phone numbers, tokens, or any personal data — remove that data immediately. Replace with "[REDACTED]" or remove the log entirely. 

3. Audit third-party integrations. Check every third-party API integration and SDK (analytics, error tracking, payment processors, email services, AI APIs). For each one, list exactly what user data is being sent. Strip any extra fields the service doesn't need. 

4. Password handling. Passwords must be hashed (bcrypt, argon2, or scrypt — never MD5 or SHA256 alone) before storage. Plaintext passwords should never be stored, logged, returned in API responses, or sent anywhere other than the hashing function. 

5. Cookie and storage audit. If sensitive data is stored in cookies, make sure cookies have httpOnly, secure, and sameSite flags. User PII should not be in localStorage — it's accessible to any JavaScript on the page, including XSS attacks. 

6. API response filtering. No endpoint should return more user data than the client needs. Implement field-level filtering on every response. No password hashes, no internal IDs, no other users' data. 

7. Data deletion. Check if there's a way for users to delete their data. If not, add a basic account deletion flow that removes or anonymizes all personal data. Show me a complete map: what data is collected, where it's stored, where it's sent externally, and what you fixed. 