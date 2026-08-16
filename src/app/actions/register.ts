"use server";

import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { headers } from "next/headers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;
const MAX_PASSWORD_LEN = 72;
const MAX_NAME_LEN = 100;

/** Simple per-IP registration throttle (single-instance; pair with edge rate limits). */
const registerHits = new Map<string, { count: number; resetAt: number }>();
const REGISTER_LIMIT = 8;
const REGISTER_WINDOW_MS = 15 * 60_000;

function isRegisterRateLimited(ip: string): boolean {
  const now = Date.now();
  const row = registerHits.get(ip);
  if (!row || now > row.resetAt) {
    registerHits.set(ip, { count: 1, resetAt: now + REGISTER_WINDOW_MS });
    return false;
  }
  row.count += 1;
  return row.count > REGISTER_LIMIT;
}

function passwordStrengthOk(password: string): boolean {
  // Require mixed character classes without being overly hostile to passphrases
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

export async function registerUser(formData: FormData) {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
    if (isRegisterRateLimited(ip)) {
      return { error: "Too many registration attempts. Please try again later." };
    }
  } catch {
    // headers() unavailable in some test contexts — continue
  }

  const emailRaw = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();
  const nameRaw = formData.get("name")?.toString()?.trim();

  if (!emailRaw || !password) {
    return { error: "Email and password are required." };
  }

  if (!EMAIL_RE.test(emailRaw) || emailRaw.length > 254) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < MIN_PASSWORD_LEN) {
    return { error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` };
  }

  if (password.length > MAX_PASSWORD_LEN) {
    return { error: `Password must be ${MAX_PASSWORD_LEN} characters or less.` };
  }

  if (!passwordStrengthOk(password)) {
    return {
      error: "Password must include at least one letter and one number.",
    };
  }

  const name =
    (nameRaw && nameRaw.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, MAX_NAME_LEN)) ||
    emailRaw.split("@")[0].slice(0, MAX_NAME_LEN);

  try {
    const db = await getDb();
    const existingUser = await db.collection("users").findOne({ email: emailRaw });

    if (existingUser) {
      // Generic message — avoid user enumeration
      return { error: "Unable to create account with that email. Try logging in instead." };
    }

    const hashedPassword = hashPassword(password);

    await db.collection("users").insertOne({
      name,
      email: emailRaw,
      password: hashedPassword,
      skills: [],
      interests: [],
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch {
    return { error: "Something went wrong during registration." };
  }
}
