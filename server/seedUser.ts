import "dotenv/config";
import { db } from "./db";
import * as schema from "../shared/schema"; // use @shared/schema if path alias works
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

async function seed() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing in .env");
    }

    const email = "admin@example.com";
    const password = "secret123";

    // 1. Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    // 2. If not, create one
    if (!user) {
      const id = randomUUID();
      await db.insert(schema.users).values({
        id,
        email,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
      user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
    }

    // 3. Hash password and upsert credentials
    const hash = await bcrypt.hash(password, 10);

    await db
      .insert(schema.localCredentials)
      .values({ userId: user!.id, passwordHash: hash })
      .onConflictDoUpdate({
        target: [schema.localCredentials.userId],
        set: { passwordHash: hash },
      });

    console.log("✅ Seeded default user:");
    console.log("   Email:", email);
    console.log("   Password:", password);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
