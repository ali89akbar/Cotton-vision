const mongoose = require("mongoose");

const careProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  plantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "PlantWiseDB" }, // Reference to your Plant collection
  date: { type: String, required: true }, // Format: 'YYYY-MM-DD'
  routineType: { type: String, enum: ["morning", "night"], required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const CareProgress = mongoose.model("CareProgress", careProgressSchema);

module.exports = CareProgress;
