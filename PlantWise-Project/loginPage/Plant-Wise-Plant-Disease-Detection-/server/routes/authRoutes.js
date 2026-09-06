const express = require("express");
const userdb = require("../model/userSchema");
const { signToken, JWT_EXPIRES_IN } = require("../utils/jwt");
const { publicProfile } = require("../utils/serializeUser");
const { isAuthenticated, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Normalizes a Pakistani phone number to the E.164-ish digits form the WhatsApp
 * Cloud API expects ("923360069977"), mirroring the client-side helper.
 * @param {string|number} raw
 */
const normalizePhone = (raw) => {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  else if (!digits.startsWith("92") && digits.length === 10) digits = `92${digits}`;
  return digits;
};

const normalizeEmail = (raw) => (raw ? String(raw).trim().toLowerCase() : "");

const badRequest = (res, message, field) =>
  res.status(400).json({ success: false, message, ...(field ? { field } : {}) });

/**
 * @typedef {object} AuthResponse
 * @property {boolean} success
 * @property {string} token  Bearer token for `Authorization: Bearer <token>`
 * @property {string} tokenType Always "Bearer"
 * @property {string} expiresIn Value of JWT_EXPIRES_IN
 * @property {object} user Whitelisted profile (see utils/serializeUser)
 */

const authPayload = (user) => ({
  success: true,
  token: signToken({ userId: user._id, role: user.role || "farmer" }),
  tokenType: "Bearer",
  expiresIn: JWT_EXPIRES_IN,
  user: publicProfile(user),
});

/**
 * @route   POST /api/auth/register
 * @desc    Create a local (email + password) farmer account. Passwords are
 *          bcrypt-hashed by the schema pre-save hook and the account receives a
 *          signed JWT immediately so onboarding can continue authenticated.
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      whatsappNumber,
      city,
      landSize,
      irrigationSource,
      crops,
      mainCrop,
      isWhatsappVerified,
    } = req.body || {};

    const cleanName = (fullName || "").trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = normalizePhone(whatsappNumber);

    if (cleanName.length < 2) return badRequest(res, "Full name is required.", "fullName");
    if (!EMAIL_REGEX.test(cleanEmail)) return badRequest(res, "A valid email address is required.", "email");
    if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
      return badRequest(res, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, "password");
    }
    if (whatsappNumber && cleanPhone.length < 11) {
      return badRequest(res, "WhatsApp number must be a valid Pakistani number (e.g. 0336 0069977).", "whatsappNumber");
    }

    const existing = await userdb
      .findOne({ $or: [{ email: cleanEmail }, ...(cleanPhone ? [{ whatsappNumber: cleanPhone }] : [])] })
      .select("+password");

    if (existing) {
      const takenBy = existing.email === cleanEmail ? "email" : "whatsappNumber";

      // Account-linking path: a Google-only profile with this email exists but
      // has no password yet, so "registering" simply adds credentials to it.
      if (takenBy === "email" && !existing.password) {
        existing.password = password;
        existing.fullName = existing.fullName || cleanName;
        if (cleanPhone) existing.whatsappNumber = cleanPhone;
        const linked = await existing.save();
        return res.status(200).json({
          ...authPayload(linked),
          message: "Existing Google account linked - you are now signed in.",
          accountLinked: true,
        });
      }

      return res.status(409).json({
        success: false,
        message: `An account already exists with this ${takenBy === "email" ? "email" : "WhatsApp number"}.`,
        field: takenBy,
      });
    }

    // Farm details may arrive with the registration or later via complete-profile.
    const cropList = Array.isArray(crops) && crops.length ? crops : ["Cotton"];
    const hasFarmDetails = Boolean(cleanPhone && city && landSize);

    const created = await userdb.create({
      provider: "local",
      role: "farmer",
      fullName: cleanName,
      displayName: cleanName,
      email: cleanEmail,
      password, // hashed in the pre-save hook
      whatsappNumber: cleanPhone || undefined,
      // The onboarding form verifies the number by OTP before it gets here.
      isWhatsappVerified: Boolean(isWhatsappVerified),
      city: city || "Khairpur",
      landSize: landSize || "",
      irrigationSource: irrigationSource || "",
      crops: cropList,
      mainCrop: mainCrop || cropList[0],
      isProfileComplete: hasFarmDetails,
    });

    return res.status(201).json({
      ...authPayload(created),
      message: "Registration successful. Complete your farmer profile to activate alerts.",
      requiresProfileCompletion: !created.isProfileComplete,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({ success: false, message: "Could not create the account. Please try again." });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Exchange credentials (email OR WhatsApp number + password) for a JWT.
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const INVALID_CREDENTIALS = {
    success: false,
    message: "Incorrect email/WhatsApp number or password.",
  };

  try {
    const { identifier, email, whatsappNumber, password } = req.body || {};

    const rawIdentifier = identifier || email || whatsappNumber || "";
    const isPhoneAttempt = /\d{7,}/.test(String(rawIdentifier).replace(/\D/g, "")) && !String(rawIdentifier).includes("@");

    if (!rawIdentifier || !password) {
      return res.status(400).json({ success: false, message: "Email (or WhatsApp number) and password are required." });
    }

    const query = isPhoneAttempt
      ? { whatsappNumber: normalizePhone(rawIdentifier) }
      : { email: normalizeEmail(rawIdentifier) };

    // `password` has select:false, so it must be requested explicitly.
    const user = await userdb.findOne(query).select("+password");

    if (!user) {
      // Same response as a bad password so accounts cannot be enumerated.
      return res.status(401).json(INVALID_CREDENTIALS);
    }

    if (!user.password) {
      return res.status(403).json({
        success: false,
        code: "google_only_account",
        message: "This account was created with Google. Please continue with Google Sign-In.",
      });
    }

    const isValid = await user.comparePassword(String(password));
    if (!isValid) return res.status(401).json(INVALID_CREDENTIALS);

    return res.status(200).json({
      ...authPayload(user),
      message: "Login successful.",
      requiresProfileCompletion: !user.isProfileComplete,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: "Sign in failed. Please try again." });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Resolve the current account from a bearer token OR a Google session.
 * @access  Private (401 when anonymous)
 */
router.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    authenticatedVia: req.auth?.via || "jwt",
    user: publicProfile(req.user),
  });
});

/**
 * @route   GET /api/auth/session
 * @desc    Public probe used by the SPA on boot: always 200, never leaks an
 *          error into the console for anonymous visitors.
 * @access  Public
 */
router.get("/session", optionalAuth, (req, res) => {
  res.status(200).json({
    success: true,
    isAuthenticated: Boolean(req.user),
    authenticatedVia: req.auth?.via || null,
    user: req.user ? publicProfile(req.user) : null,
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Stateless logout - the server confirms and the client drops the
 *          token; also clears the legacy Passport session when one exists.
 * @access  Public
 */
router.post("/logout", (req, res) => {
  if (typeof req.logout === "function") {
    return req.logout((err) => {
      if (err) console.warn("Session logout warning:", err.message);
      return res.status(200).json({ success: true, message: "Signed out." });
    });
  }
  return res.status(200).json({ success: true, message: "Signed out." });
});

module.exports = router;
