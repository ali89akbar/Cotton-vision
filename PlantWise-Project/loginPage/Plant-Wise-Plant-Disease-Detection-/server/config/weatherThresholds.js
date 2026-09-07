/**
 * Crop-weather risk thresholds and advisory map.
 * Centralising these values makes the rule engine easy to tune without
 * touching the cron or notification code.
 */

const THRESHOLDS = {
  heatwaveTempC: 40,
  frostTempC: 4,
  // Aligned with the in-app banner so a "spraying not advised" warning also
  // triggers a crop-specific email alert.
  stormWindKmh: 15,
  highHumidityPercent: 80,
  highHumidityHeatTempC: 35,
  heavyRainMmPerHour: 5,
};

const RISK_TYPES = {
  heat: "Heat Stress",
  frost: "Frost Warning",
  rain: "Heavy Rainfall / Hail",
  wind: "High Winds / Storm",
  humidityHeat: "Heat + Humidity Stress",
};

/**
 * Crop-specific sensitivity keys. If a crop is not listed here the engine
 * falls back to the "default" list so it still receives generic alerts.
 */
const CROP_SENSITIVITY = {
  default: ["heat", "frost", "rain", "wind", "humidityHeat"],
  Cotton: ["heat", "rain", "humidityHeat", "wind"],
  Wheat: ["frost", "heat", "wind"],
  Rice: ["heat", "wind", "rain"],
  Sugarcane: ["rain", "wind"],
  Maize: ["heat", "wind", "rain"],
  Tomato: ["rain", "humidityHeat", "frost"],
  Potato: ["frost", "rain", "heat"],
};

const ADVISORIES = {
  heat: "Provide shade or irrigate early morning and evening; avoid spraying during peak heat.",
  frost: "Cover young plants or use frost protection; delay irrigation until temperatures rise.",
  rain: "Ensure field drainage; postpone spraying and monitor for fungal or blight symptoms.",
  wind: "Secure young plants, avoid spraying, and check for physical damage after the event.",
  humidityHeat:
    "Increase airflow where possible; scout for fungal disease and avoid overhead irrigation.",
};

module.exports = {
  THRESHOLDS,
  RISK_TYPES,
  CROP_SENSITIVITY,
  ADVISORIES,
};
