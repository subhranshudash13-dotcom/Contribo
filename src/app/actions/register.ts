"use server";

import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/hash";

export async function registerUser(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString()?.trim() || email?.split("@")[0];

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length > 72) {
    return { error: "Password must be 72 characters or less." };
  }

  try {
    const db = await getDb();
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return { error: "User already exists." };
    }

    const hashedPassword = hashPassword(password);

    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      skills: [],
      interests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    return { error: "Something went wrong during registration." };
  }
}
