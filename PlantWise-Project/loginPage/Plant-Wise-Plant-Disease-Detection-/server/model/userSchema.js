const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { publicProfile } = require("../utils/serializeUser");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const badgeSchema = new mongoose.Schema({
  name: String,
  earnedAt: { type: Date, default: Date.now },
  plantClassName: String,
});

const predictionSchema = new mongoose.Schema({
  className: String,
  morningCareRoutine: [String],
  nightCareRoutine: [String],
  recommendation: String,
  chemicalRecommendation: String,
  dosagePerAcre: String,
  urgencyLevel: String,
  region: String,
  weatherSafetyStatus: String,
  language: String,
  timestamp: { type: Date, default: Date.now },
  completedMorning: { type: Boolean, default: false },
  completedNight: { type: Boolean, default: false },
  badgeEarned: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  // --- Identity (either Google OAuth or local email/WhatsApp credentials) ---
  googleId: String,
  displayName: String,
  // Not declared `unique` on purpose: legacy Google accounts may already share
  // or omit emails, which would break index creation. Uniqueness for local
  // sign-up is enforced in /api/auth/register instead.
  email: { type: String, index: true, trim: true, lowercase: true },
  password: { type: String, select: false, default: null },
  image: String,
  role: {
    type: String,
    enum: ["farmer", "agronomist", "admin"],
    default: "farmer",
  },
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  // --- Farmer profile (filled during onboarding / complete-profile) ---
  fullName: String,
  whatsappNumber: { type: String, index: true, trim: true },
  isWhatsappVerified: { type: Boolean, default: false },
  city: { type: String, default: "Khairpur" },
  landSize: String,
  irrigationSource: String,
  mainCrop: String,
  crops: { type: [String], default: ["Cotton"] },
  isProfileComplete: { type: Boolean, default: false },

  // --- Gamification / history ---
  predictions: [predictionSchema],
  badges: [badgeSchema],
  badgeProgress: {
    imageDetections: { type: Number, default: 0 },
    postsCreated: { type: Number, default: 0 },
  },

  // --- Weather alert notifications ---
  notifications: {
    weatherAlerts: { type: Boolean, default: true },
    lastWeatherAlert: {
      riskType: String,
      affectedCrops: [String],
      city: String,
      sentAt: Date,
    },
  },
}, { timestamps: true });

// Never leak the hash, even when a document is serialized by accident.
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

/** Hashes the password whenever it is created or changed. */
userSchema.pre("save", async function hashPasswordIfNeeded() {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Constant-time password check. Returns false for Google-only accounts that
 * have no password set instead of throwing.
 * @param {string} candidate
 */
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password || !candidate) return false;
  return bcrypt.compare(candidate, this.password);
};

/** The whitelisted shape the client is allowed to see about an account. */
userSchema.methods.toPublicProfile = function toPublicProfile() {
  return publicProfile(this);
};

module.exports = mongoose.model("users", userSchema);
