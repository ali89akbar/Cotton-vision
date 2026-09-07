const nodemailer = require("nodemailer");
const { renderWeatherAlertEmail } = require("./emailTemplates");

/**
 * Shared Nodemailer transporter. Keep this in one place so cron jobs,
 * routes and test scripts all use the same configuration.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a crop-specific weather risk alert email.
 *
 * @param {Object} user - Mongoose user document or lean object.
 * @param {Object} alertPayload - Output from weatherRiskEngine.evaluateCropRisk plus weather snapshot.
 * @returns {Promise<Object>} Nodemailer sendMail info object.
 */
async function sendWeatherAlertEmail(user, alertPayload) {
  const { html, text } = renderWeatherAlertEmail({
    displayName: user.displayName || user.fullName,
    city: alertPayload.city,
    riskType: alertPayload.riskType,
    affectedCrops: alertPayload.affectedCrops,
    advisoryMessage: alertPayload.advisoryMessage,
    temp: alertPayload.temp,
    humidity: alertPayload.humidity,
    windSpeedKmh: Math.round(alertPayload.windSpeedKmh),
    conditionDescription: alertPayload.conditionDescription,
  });

  const info = await transporter.sendMail({
    from: `PlantWise <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `PlantWise Weather Alert: ${alertPayload.riskType} in ${alertPayload.city}`,
    html,
    text,
  });

  return info;
}

module.exports = {
  transporter,
  sendWeatherAlertEmail,
};
