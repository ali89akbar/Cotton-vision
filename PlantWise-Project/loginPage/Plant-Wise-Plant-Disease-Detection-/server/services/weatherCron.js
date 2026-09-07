const cron = require("node-cron");
const axios = require("axios");
const userdb = require("../model/userSchema");
const { sendWeatherAlertEmail } = require("./emailService");
const { evaluateCropRisk } = require("./weatherRiskEngine");

/**
 * OpenWeatherMap API key. Falls back to the demo key used by the React client
 * so local development works immediately, but a dedicated server key should be
 * set in production.
 */
const OPENWEATHER_API_KEY =
  process.env.OPENWEATHER_API_KEY || "2c68cac827dd9e327fdd97b4e39326ed";

const ALERT_COOLDOWN_MS =
  Number(process.env.WEATHER_ALERT_COOLDOWN_MS) || 12 * 60 * 60 * 1000; // 12 hours
const SCHEDULE = process.env.WEATHER_CRON_SCHEDULE || "0 */4 * * *"; // every 4 hours

function normalizeCity(city) {
  return (city || "").trim().toLowerCase();
}

async function fetchWeatherForCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  try {
    const res = await axios.get(url, {
      timeout: 10000,
      // OpenWeatherMap returns Access-Control-Allow-Origin:* so credentials
      // must be false, even on the server side.
      withCredentials: false,
    });

    const d = res.data;
    return {
      city: d.name || city,
      temp: d.main?.temp ?? null,
      humidity: d.main?.humidity ?? null,
      windSpeedKmh: (d.wind?.speed ?? 0) * 3.6,
      conditionId: d.weather?.[0]?.id ?? null,
      conditionDescription: d.weather?.[0]?.description || "",
      rainMm: d.rain?.["1h"] || d.rain?.["3h"] || 0,
    };
  } catch (err) {
    console.error(
      `[weatherCron] Failed to fetch weather for ${city}:`,
      err.response?.data?.message || err.message
    );
    return null;
  }
}

function isDuplicateAlert(user, riskType) {
  const last = user.notifications?.lastWeatherAlert;
  if (!last || !last.sentAt || !last.riskType) return false;
  if (last.riskType !== riskType) return false;
  return Date.now() - new Date(last.sentAt).getTime() < ALERT_COOLDOWN_MS;
}

async function runWeatherAlertJob() {
  console.log("[weatherCron] Starting weather risk alert job");

  if (!OPENWEATHER_API_KEY) {
    console.warn("[weatherCron] No OpenWeatherMap API key configured. Skipping job.");
    return;
  }

  try {
    const users = await userdb
      .find({
        email: { $exists: true, $ne: "" },
        $or: [
          { "notifications.weatherAlerts": { $ne: false } },
          { "notifications.weatherAlerts": { $exists: false } },
        ],
      })
      .lean();

    console.log(`[weatherCron] ${users.length} user(s) eligible for alerts`);

    // Group users by city so we call OpenWeatherMap once per unique location.
    const cityMap = new Map();
    for (const user of users) {
      const city = normalizeCity(user.city || "Khairpur");
      if (!cityMap.has(city)) cityMap.set(city, []);
      cityMap.get(city).push(user);
    }

    console.log(`[weatherCron] Evaluating ${cityMap.size} unique location(s): ${[...cityMap.keys()].join(", ")}`);

    for (const [city, cityUsers] of cityMap) {
      const weather = await fetchWeatherForCity(city);
      if (!weather || weather.temp === null) {
        console.log(`[weatherCron] No usable weather data for ${city}; skipping`);
        continue;
      }

      console.log(
        `[weatherCron] ${weather.city}: temp=${weather.temp}°C, humidity=${weather.humidity}%, wind=${Math.round(weather.windSpeedKmh)} km/h, rain=${weather.rainMm}mm, condition=${weather.conditionDescription || "n/a"}`
      );

      for (const user of cityUsers) {
        try {
          const crops =
            Array.isArray(user.crops) && user.crops.length
              ? user.crops
              : ["Cotton"];

          const alert = evaluateCropRisk(weather, crops);
          if (!alert.hasRisk) {
            console.log(`[weatherCron] No risk for ${user.email} (${crops.join(", ")}) in ${weather.city}`);
            continue;
          }

          if (isDuplicateAlert(user, alert.riskType)) {
            console.log(
              `[weatherCron] Skipping duplicate alert for ${user.email}: ${alert.riskType}`
            );
            continue;
          }

          await sendWeatherAlertEmail(user, { ...alert, ...weather });

          await userdb.updateOne(
            { _id: user._id },
            {
              $set: {
                "notifications.lastWeatherAlert": {
                  riskType: alert.riskType,
                  affectedCrops: alert.affectedCrops,
                  city: weather.city,
                  sentAt: new Date(),
                },
              },
            }
          );

          console.log(
            `[weatherCron] Alert sent to ${user.email}: ${alert.riskType}`
          );
        } catch (userErr) {
          console.error(
            `[weatherCron] Error processing user ${user.email}:`,
            userErr.message
          );
        }
      }
    }

    console.log("[weatherCron] Weather risk alert job completed");
  } catch (err) {
    console.error("[weatherCron] Job error:", err);
  }
}

let task = null;

function init() {
  if (!cron.validate(SCHEDULE)) {
    console.error("[weatherCron] Invalid cron schedule:", SCHEDULE);
    return;
  }
  if (task) return;

  task = cron.schedule(SCHEDULE, runWeatherAlertJob, {
    scheduled: true,
    timezone: process.env.TZ,
  });

  console.log(`[weatherCron] Scheduled weather alert job with "${SCHEDULE}"`);
}

function stop() {
  if (task) {
    task.stop();
    task = null;
  }
}

module.exports = {
  init,
  stop,
  runWeatherAlertJob,
};
