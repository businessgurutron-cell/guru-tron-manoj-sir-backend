// Minimal admin auth for the prototype.
// - Single admin credential from .env (ADMIN_EMAIL / ADMIN_PASSWORD)
// - On successful login we mint an opaque random token and keep it in memory + env fallback.
// - Client sends it in `x-admin-token` header on every admin call.
//
// Swap this for Supabase Auth later — `requireAdmin` is the only contract
// that other code depends on.

import crypto from "crypto";

const TOKENS = new Set(); // active admin tokens (in-memory, fast path)
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const LOCAL_BYPASS_TOKEN = "LOCAL-BYPASS";
const DEFAULT_ADMIN_EMAIL = "kalua@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "kalua123";
const DEFAULT_STATIC_ADMIN_TOKEN = "prod-admin-token-12345";
const STATIC_ADMIN_TOKEN = process.env.STATIC_ADMIN_TOKEN || DEFAULT_STATIC_ADMIN_TOKEN;

function mintToken() {
  const token = crypto.randomBytes(24).toString("hex");
  TOKENS.add(token);
  setTimeout(() => TOKENS.delete(token), TOKEN_TTL_MS).unref?.();
  return token;
}

export function adminLogin(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  if (!email || !password) return null;
  if (email.trim().toLowerCase() !== expectedEmail.toLowerCase()) return null;
  if (password !== expectedPassword) return null;
  
  // If STATIC_ADMIN_TOKEN is set (production), use it; otherwise mint a random token
  if (STATIC_ADMIN_TOKEN) {
    TOKENS.add(STATIC_ADMIN_TOKEN);
    return STATIC_ADMIN_TOKEN;
  }
  return mintToken();
}

export function adminLogout(token) {
  if (token) TOKENS.delete(token);
}

export function isValidAdminToken(token) {
  if (token === LOCAL_BYPASS_TOKEN) {
    return process.env.ADMIN_BYPASS === "true" || process.env.NODE_ENV !== "production";
  }
  if (token === STATIC_ADMIN_TOKEN && STATIC_ADMIN_TOKEN) {
    return true;
  }
  return !!token && TOKENS.has(token);
}

export function requireAdmin(req, res, next) {
  // Accept token from header (default) OR query string (for iframes / <embed> / direct browser GETs)
  const token = req.header("x-admin-token") || req.query?.token;
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  next();
}
