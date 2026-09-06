const jwt = require("jsonwebtoken");

/**
 * JWT configuration.
 *
 * JWT_SECRET is mandatory for any deployment that is not running locally.
 * In development a fixed fallback is used so the server still boots, but a
 * loud warning is printed once at startup.
 */
const DEV_FALLBACK_SECRET = "dev-only-insecure-plantwise-jwt-secret";

const isProduction = process.env.NODE_ENV === "production";
const configuredSecret = (process.env.JWT_SECRET || "").trim();

if (!configuredSecret) {
  if (isProduction) {
    console.error(
      "FATAL: JWT_SECRET environment variable is required when NODE_ENV=production."
    );
    process.exit(1);
  }
  console.warn(
    "⚠️  JWT_SECRET is not set - using an insecure development fallback. " +
    "Add JWT_SECRET to server/.env before deploying."
  );
}

const JWT_SECRET = configuredSecret || DEV_FALLBACK_SECRET;
const JWT_ISSUER = "plantwise-api";

// Accepts "30d", "8h", "900" etc. Defaults to 30 days so farmers do not get
// logged out mid-season on the offline-friendly app.
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "30d").trim();

/**
 * Signs a token carrying the minimum necessary payload (no PII, no secrets).
 * @param {{ userId: string, role?: string }} payload
 */
const signToken = ({ userId, role = "farmer" }) =>
  jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });

/**
 * Verifies signature + expiry. Throws jwt.JsonWebTokenError / TokenExpiredError
 * so callers can distinguish "invalid" (401) from "expired" (403).
 * @param {string} token
 */
const verifyToken = (token) => jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });

module.exports = { signToken, verifyToken, JWT_EXPIRES_IN, JWT_ISSUER };
