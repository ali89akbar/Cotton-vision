const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: String,
  earnedAt: { type: Date, default: Date.now },
  plantClassName: String, // New: link badge to specific plant
});

const predictionSchema = new mongoose.Schema({
  className: String,
  morningCareRoutine: [String],
  nightCareRoutine: [String],
  timestamp: { type: Date, default: Date.now },
  completedMorning: { type: Boolean, default: false },
  completedNight: { type: Boolean, default: false },
  badgeEarned: { type: Boolean, default: false }, // for full completion
});

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  image: String,
  predictions: [predictionSchema],
  badges: [badgeSchema],
  badgeProgress: {
    imageDetections: { type: Number, default: 0 },
    postsCreated: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model("users", userSchema);
