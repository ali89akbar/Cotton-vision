const express = require("express");
const userdb = require("../model/userSchema");
const { publicProfile } = require("../utils/serializeUser");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

const normalizePhone = (raw) => {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  else if (!digits.startsWith("92") && digits.length === 10) digits = `92${digits}`;
  return digits;
};

/**
 * Shared upsert for the farmer profile. Mounted under both /api/users and
 * /api/user so the new and the legacy client calls hit one implementation.
 *
 * The account is identified by req.user (JWT `userId` claim or Google session),
 * never by anything in the body - so a caller can only complete their own
 * profile.
 */
const saveProfile = async (req, res) => {
  try {
    const {
      fullName,
      whatsappNumber,
      city,
      landSize,
      irrigationSource,
      crops,
      mainCrop,
      isWhatsappVerified,
    } = req.body || {};

    const cleanName = (fullName || "").trim();
    const cleanPhone = normalizePhone(whatsappNumber);

    if (cleanName.length < 2) {
      return res.status(400).json({ success: false, message: "Full name is required.", field: "fullName" });
    }
    if (!cleanPhone || cleanPhone.length < 11) {
      return res.status(400).json({
        success: false,
        message: "A valid WhatsApp number is required (e.g. 0336 0069977).",
        field: "whatsappNumber",
      });
    }
    if (!city || !String(city).trim()) {
      return res.status(400).json({ success: false, message: "District / city is required.", field: "city" });
    }
    if (!landSize || !String(landSize).trim()) {
      return res.status(400).json({ success: false, message: "Land size is required.", field: "landSize" });
    }

    const userId = req.user._id || req.user.id;

    // A WhatsApp number is the alert routing address, so it must stay unique.
    const phoneOwner = await userdb.findOne({ whatsappNumber: cleanPhone }).select("_id").lean();
    if (phoneOwner && String(phoneOwner._id) !== String(userId)) {
      return res.status(409).json({
        success: false,
        message: "This WhatsApp number is already linked to another account.",
        field: "whatsappNumber",
      });
    }

    // Hydrated document (req.user is loaded lean) so we can .save() and get the
    // timestamps / validators applied.
    const user = await userdb.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const cropList = Array.isArray(crops) ? crops.filter(Boolean) : [];

    user.fullName = cleanName;
    user.displayName = user.displayName || cleanName;
    user.whatsappNumber = cleanPhone;
    user.isWhatsappVerified = Boolean(isWhatsappVerified);
    user.city = String(city).trim();
    user.landSize = String(landSize).trim();
    if (irrigationSource !== undefined) user.irrigationSource = irrigationSource;
    if (cropList.length) {
      user.crops = cropList;
      user.mainCrop = mainCrop || cropList[0];
    } else if (mainCrop) {
      user.mainCrop = mainCrop;
    }
    user.isProfileComplete = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Farmer profile saved successfully.",
      user: publicProfile(user),
    });
  } catch (error) {
    console.error("❌ Profile completion error:", error);
    return res.status(500).json({ success: false, message: "Error saving profile", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userdb.findById(req.user._id || req.user.id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user: publicProfile(user) });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Error fetching user profile", error: error.message });
  }
};

// ============ New canonical endpoint ============
router.post("/complete-profile", isAuthenticated, saveProfile);
router.get("/complete-profile", isAuthenticated, getProfile);

// ============ Backwards-compatible aliases (existing client calls) ============
router.post("/profile", isAuthenticated, saveProfile);
router.put("/profile", isAuthenticated, saveProfile);
router.get("/profile", isAuthenticated, getProfile);

module.exports = router;
