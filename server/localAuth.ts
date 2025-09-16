import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import * as schema from "@shared/schema"; // or "../shared/schema"
import { eq } from "drizzle-orm";

function devSession() {
  const week = 7 * 24 * 60 * 60 * 1000;
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: week }, // http://localhost
  });
}

export async function setupLocalAuth(app: Express) {
  app.use(devSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, email),
        });
        if (!user) return done(null, false, { message: "Invalid credentials" });

        const cred = await db.query.localCredentials.findFirst({
          where: eq(schema.localCredentials.userId, user.id),
        });
        if (!cred) return done(null, false, { message: "Invalid credentials" });

        const ok = await bcrypt.compare(password, cred.passwordHash);
        if (!ok) return done(null, false, { message: "Invalid credentials" });

        return done(null, { id: user.id, email: user.email, firstName: user.firstName });
      } catch (e) {
        return done(e);
      }
    }
  ));

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // Register (optional helper)
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body ?? {};
      if (!email || !password) return res.status(400).json({ message: "email and password required" });

      let user = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });
      if (!user) {
        const id = randomUUID();
        await db.insert(schema.users).values({
          id, email, firstName: firstName ?? null, lastName: lastName ?? null, role: "admin",
        });
        user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
      }

      const hash = await bcrypt.hash(password, 10);
      await db
        .insert(schema.localCredentials)
        .values({ userId: user!.id, passwordHash: hash })
        .onConflictDoUpdate({
          target: [schema.localCredentials.userId],
          set: { passwordHash: hash },
        });

      res.status(201).json({ message: "registered" });
    } catch (e: any) {
      res.status(500).json({ message: e?.message ?? "error" });
    }
  });

  // Login (POST)
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: { message: any; }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message ?? "Unauthorized" });
      req.logIn(user, (err2) => {
        if (err2) return next(err2);
        return res.json({ message: "ok", user });
      });
    })(req, res, next);
  });

  // Current user
  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) return res.json({ user: req.user });
    return res.status(401).json({ message: "Unauthorized" });
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.logout(() => res.json({ message: "ok" }));
  });
}

export const isAuthenticatedLocal: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};
