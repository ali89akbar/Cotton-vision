const {
  THRESHOLDS,
  RISK_TYPES,
  CROP_SENSITIVITY,
  ADVISORIES,
} = require("../config/weatherThresholds");

function getSensitiveCrops(riskKey, userCrops) {
  return userCrops.filter((crop) => {
    const sensitivities = CROP_SENSITIVITY[crop] || CROP_SENSITIVITY.default;
    return sensitivities.includes(riskKey);
  });
}

function isSeverePrecipitation(conditionId) {
  if (!conditionId) return false;
  // Thunderstorm, drizzle, rain, snow
  return (
    (conditionId >= 200 && conditionId <= 232) ||
    (conditionId >= 300 && conditionId <= 321) ||
    (conditionId >= 500 && conditionId <= 531) ||
    (conditionId >= 600 && conditionId <= 622)
  );
}

/**
 * Evaluate OpenWeatherMap current weather data against crop sensitivities.
 *
 * @param {Object} weatherData - Normalised weather snapshot.
 * @param {number} weatherData.temp - Celsius.
 * @param {number} weatherData.humidity - Percentage.
 * @param {number} weatherData.windSpeedKmh - km/h.
 * @param {number} weatherData.conditionId - OpenWeatherMap weather[0].id.
 * @param {number} weatherData.rainMm - Rain in the last hour.
 * @param {string[]} userCrops - Crops registered to the user.
 * @returns {Object} { hasRisk, riskType, affectedCrops, advisoryMessage }
 */
function evaluateCropRisk(weatherData, userCrops = ["Cotton"]) {
  const { temp, humidity, windSpeedKmh, conditionId, rainMm } = weatherData;
  const triggered = [];

  if (temp > THRESHOLDS.heatwaveTempC) {
    const affected = getSensitiveCrops("heat", userCrops);
    if (affected.length) {
      triggered.push({
        key: "heat",
        riskType: RISK_TYPES.heat,
        affected,
        advisory: ADVISORIES.heat,
      });
    }
  }

  if (temp < THRESHOLDS.frostTempC) {
    const affected = getSensitiveCrops("frost", userCrops);
    if (affected.length) {
      triggered.push({
        key: "frost",
        riskType: RISK_TYPES.frost,
        affected,
        advisory: ADVISORIES.frost,
      });
    }
  }

  if (windSpeedKmh > THRESHOLDS.stormWindKmh) {
    const affected = getSensitiveCrops("wind", userCrops);
    if (affected.length) {
      triggered.push({
        key: "wind",
        riskType: RISK_TYPES.wind,
        affected,
        advisory: ADVISORIES.wind,
      });
    }
  }

  if (
    rainMm >= THRESHOLDS.heavyRainMmPerHour ||
    isSeverePrecipitation(conditionId)
  ) {
    const affected = getSensitiveCrops("rain", userCrops);
    if (affected.length) {
      triggered.push({
        key: "rain",
        riskType: RISK_TYPES.rain,
        affected,
        advisory: ADVISORIES.rain,
      });
    }
  }

  if (
    humidity > THRESHOLDS.highHumidityPercent &&
    temp > THRESHOLDS.highHumidityHeatTempC
  ) {
    const affected = getSensitiveCrops("humidityHeat", userCrops);
    if (affected.length) {
      triggered.push({
        key: "humidityHeat",
        riskType: RISK_TYPES.humidityHeat,
        affected,
        advisory: ADVISORIES.humidityHeat,
      });
    }
  }

  if (!triggered.length) {
    return {
      hasRisk: false,
      riskType: null,
      affectedCrops: [],
      advisoryMessage: "",
    };
  }

  const allAffected = [
    ...new Set(triggered.flatMap((t) => t.affected)),
  ];

  const riskType = triggered.map((t) => t.riskType).join(" + ");
  const advisoryMessage = triggered
    .map((t, i) => `${i + 1}. ${t.riskType}: ${t.advisory}`)
    .join("\n");

  return {
    hasRisk: true,
    riskType,
    affectedCrops: allAffected,
    advisoryMessage,
  };
}

module.exports = { evaluateCropRisk };
