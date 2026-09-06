const { verifyToken } = require("../utils/jwt");
const userdb = require("../model/userSchema");

/**
 * Pulls the bearer token out of the Authorization header.
 * Accepts only the strict `Authorization: Bearer <token>` form (case-insensitive
 * scheme), which is what the client request interceptor sends.
 * @param {import("express").Request} req
 * @returns {string|null}
 */
const extractBearerToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (typeof header !== "string" || !header.trim()) return null;

  const [scheme, ...rest] = header.trim().split(" ");
  if (scheme.toLowerCase() !== "bearer") return null;

  const token = rest.join(" ").trim();
  return token || null;
};

const sendAuthError = (res, status, code, message) =>
  res.status(status).json({ success: false, code, message });

/**
 * Loads (and caches) the account for a verified token payload.
 * @param {object} userClaims
 * @returns {Promise<object|null>} the mongoose document, or null when deleted
 */
const loadUserFromClaims = async (userClaims) => {
  if (!userClaims || userClaims.userId === undefined) return null;
  // A token minted before an account deletion must not keep working.
  return userdb.findById(userClaims.userId).select("-__v").lean();
};

/**
 * Strict JWT guard: requires a valid `Authorization: Bearer <token>`.
 *
 * Status code contract used across the API:
 *   401 - header missing / wrong scheme / malformed or forged token / dead account
 *   403 - token is well-formed and genuine but expired (authenticated, not allowed)
 */
const authenticateToken = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return sendAuthError(
      res,
      401,
      "missing_token",
      "Authentication required. Send 'Authorization: Bearer <token>'."
    );
  }

  try {
    const claims = verifyToken(token);
    const user = await loadUserFromClaims(claims);

    if (!user) {
      return sendAuthError(res, 401, "account_not_found", "The account for this token no longer exists.");
    }

    req.auth = { claims, token, via: "jwt" };
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendAuthError(res, 403, "token_expired", "Session expired. Please sign in again.");
    }
    return sendAuthError(res, 401, "invalid_token", "Invalid authentication token.");
  }
};

/**
 * Guard used by every protected route in app.js.
 *
 * Accepts EITHER a bearer JWT (local email/WhatsApp registration + login) OR a
 * Passport Google OAuth session cookie, so both identity providers keep working
 * through one code path. req.user is always a plain user object on success.
 */
const isAuthenticated = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (token) {
    return authenticateToken(req, res, next);
  }

  // No bearer token - fall back to the legacy Passport session, if present.
  const hasSession = typeof req.isAuthenticated === "function" && req.isAuthenticated();
  if (hasSession && req.user) {
    req.auth = { via: "session" };
    if (!req.user._id && req.user.id) req.user._id = req.user.id;
    return next();
  }

  return sendAuthError(
    res,
    401,
    "unauthenticated",
    "No valid credentials found. Sign in or attach 'Authorization: Bearer <token>'."
  );
};

/**
 * Non-rejecting variant: populates req.user when the caller happens to be
 * authenticated, otherwise continues anonymously. Used to personalize public
 * endpoints without breaking anonymous access.
 */
const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractBearerToken(req);

    if (token) {
      const claims = verifyToken(token);
      const user = await loadUserFromClaims(claims);
      if (user) {
        req.auth = { claims, token, via: "jwt" };
        req.user = user;
        return next();
      }
    }

    if (typeof req.isAuthenticated === "function" && req.isAuthenticated() && req.user) {
      req.auth = { via: "session" };
      return next();
    }
  } catch (error) {
    // A stale/invalid token simply means "anonymous" here - never a failure.
    req.auth = undefined;
    req.user = undefined;
  }

  return next();
};

module.exports = {
  extractBearerToken,
  authenticateToken,
  isAuthenticated,
  optionalAuth,
};
