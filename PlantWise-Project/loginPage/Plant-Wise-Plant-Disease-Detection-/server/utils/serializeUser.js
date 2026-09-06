/**
 * Single source of truth for the user shape returned to the client.
 *
 * Works for hydrated mongoose documents AND `.lean()` / plain objects, because
 * the JWT middleware loads users lean for speed. Never add secret fields here.
 * @param {object} user
 */
const publicProfile = (user) => {
  if (!user) return null;
  const crops = Array.isArray(user.crops) && user.crops.length ? user.crops : ["Cotton"];

  return {
    _id: user._id || user.id || null,
    displayName: user.displayName || user.fullName || "Registered Farmer",
    email: user.email || "",
    image: user.image || "",
    fullName: user.fullName || user.displayName || "",
    role: user.role || "farmer",
    provider: user.provider || "local",
    whatsappNumber: user.whatsappNumber || "",
    isWhatsappVerified: !!user.isWhatsappVerified,
    city: user.city || "Khairpur",
    landSize: user.landSize || "",
    irrigationSource: user.irrigationSource || "",
    mainCrop: user.mainCrop || crops[0] || "Cotton",
    crops,
    isProfileComplete: !!user.isProfileComplete,
  };
};

module.exports = { publicProfile };
