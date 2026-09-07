function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Render an HTML + plain-text weather alert email.
 *
 * @param {Object} params
 * @param {string} params.displayName
 * @param {string} params.city
 * @param {string} params.riskType
 * @param {string[]} params.affectedCrops
 * @param {string} params.advisoryMessage
 * @param {number} params.temp
 * @param {number} params.humidity
 * @param {number} params.windSpeedKmh
 * @param {string} [params.conditionDescription]
 * @returns {{html: string, text: string}}
 */
function renderWeatherAlertEmail({
  displayName,
  city,
  riskType,
  affectedCrops,
  advisoryMessage,
  temp,
  humidity,
  windSpeedKmh,
  conditionDescription,
}) {
  const cropList = affectedCrops.join(", ");
  const appUrl = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  const plantsUrl = `${appUrl}/saved-plants`;
  const conditionText = conditionDescription
    ? `, ${conditionDescription}`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PlantWise Weather Alert</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#f4f7f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#059669; color:#ffffff; padding:24px; text-align:center;">
              <h1 style="margin:0; font-size:22px; font-weight:800;">PlantWise Weather Alert</h1>
              <p style="margin:8px 0 0; opacity:0.95; font-size:14px;">${escapeHtml(
                city
              )}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px; color:#1e293b;">
              <p style="margin:0 0 12px;">Hello ${escapeHtml(
                displayName || "Farmer"
              )},</p>
              <p style="margin:0 0 16px; line-height:1.6;">
                Current conditions in <strong>${escapeHtml(
                  city
                )}</strong> indicate a weather risk for your crops.
              </p>

              <div style="background:#f0fdf4; border-left:4px solid #059669; padding:16px; margin:16px 0; border-radius:8px;">
                <h2 style="margin:0 0 8px; color:#064e3b; font-size:18px; font-weight:800;">${escapeHtml(
                  riskType
                )}</h2>
                <p style="margin:0; color:#334155; font-size:14px;">
                  <strong>Affected crops:</strong> ${escapeHtml(cropList)}
                </p>
              </div>

              <p style="margin:16px 0; font-size:14px; color:#475569;">
                <strong>Conditions:</strong> ${temp}°C, ${humidity}% humidity, wind ${windSpeedKmh} km/h${conditionText}.
              </p>

              <h3 style="color:#064e3b; font-size:16px; margin:24px 0 8px; font-weight:800;">Recommended Actions</h3>
              <div style="white-space:pre-line; color:#334155; line-height:1.6; font-size:14px;">
                ${escapeHtml(advisoryMessage).replace(/\n/g, "<br>")}
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="${plantsUrl}" style="display:inline-block; background:#059669; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">View Your Plants</a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:24px;">
                You are receiving this because weather alerts are enabled in PlantWise.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
PlantWise Weather Alert - ${city}

Hello ${displayName || "Farmer"},

Risk: ${riskType}
Affected crops: ${cropList}
Conditions: ${temp}°C, ${humidity}% humidity, wind ${windSpeedKmh} km/h${conditionText}.

Recommended actions:
${advisoryMessage}

View your plants: ${plantsUrl}
  `.trim();

  return { html, text };
}

module.exports = { renderWeatherAlertEmail };
