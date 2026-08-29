const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
    class_name: { type: String, required: true },
    morningCareRoutine: { type: [String], required: false, default: ["Not provided"] },
    nightCareRoutine: { type: [String], required: false, default: ["Not provided"] },
}, { timestamps: true });

const Plant = mongoose.model("PlantWiseDB", plantSchema);

module.exports = Plant;
