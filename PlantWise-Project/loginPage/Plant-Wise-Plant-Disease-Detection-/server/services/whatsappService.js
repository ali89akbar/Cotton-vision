/**
 * ============================================================================
 * PlantWise - Meta WhatsApp Cloud API Service
 * ============================================================================
 * Handles sending WhatsApp template messages to verified farmer phone numbers.
 * ============================================================================
 */

// TODO: Store these credentials in server/.env for production security
const META_WA_TOKEN = process.env.META_WA_TOKEN || 'EAAQcTaZAebyQBSXJQnHt34cKzWSmi75kRPvJptKhm1NKr8ak2hcm4mQHIGbag1ZAt922PW8lbL1XOhxoKBYDhEXNd8kdcbFEvvKqL4V4x4bZAJp4WbeXlx2W8Q9oZCHdSMdqxKphZBYJcN54fpvvN7FA9QUCUa46SQAh9SHNi48vBE0kTjLhhxy0bnJxdZBdvHaAWZCk8sLasYwrOT8CTZATsZBFM0ZA8dhFuzE34N9uqYkoelCOwHlH6GoOzrbeQSOl1hXqm4BoMepCrCNQvHNViK';
const META_PHONE_NUMBER_ID = process.env.META_WA_PHONE_NUMBER_ID || '1354748474382369';

/**
 * Sends a dynamic WhatsApp template message via Meta Cloud API.
 * @param {string} toPhoneNumber - Recipient phone number (e.g. "923360069977" or "+923360069977")
 * @param {string} templateName - Meta registered template name (defaults to "hello_world")
 * @param {string} languageCode - Language code for the template (defaults to "en_US")
 * @returns {Promise<Object>} Meta API JSON response
 */
async function sendWhatsAppMessage(toPhoneNumber, templateName = 'hello_world', languageCode = 'en_US') {
  if (!toPhoneNumber) {
    throw new Error('Recipient phone number is required.');
  }

  // Sanitize phone number (remove any leading '+', spaces, or dashes)
  const cleanNumber = toPhoneNumber.toString().replace(/[^0-9]/g, '');

  const endpoint = `https://graph.facebook.com/v17.0/${META_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: cleanNumber,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || response.statusText || 'Failed to send WhatsApp message';
      console.error('❌ Meta WhatsApp API Error:', data);
      const error = new Error(errorMessage);
      error.details = data;
      error.statusCode = response.status;
      throw error;
    }

    console.log(`✅ WhatsApp message (${templateName}) sent successfully to +${cleanNumber}`);
    return data;
  } catch (error) {
    console.error('🚨 sendWhatsAppMessage Service Error:', error.message);
    throw error;
  }
}

module.exports = {
  sendWhatsAppMessage,
};
