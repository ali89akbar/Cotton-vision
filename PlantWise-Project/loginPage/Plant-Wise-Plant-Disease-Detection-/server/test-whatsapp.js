/**
 * ============================================================================
 * PlantWise - Meta WhatsApp Cloud API Test Script
 * ============================================================================
 * Tests sending the standard 'hello_world' template message to a verified
 * WhatsApp recipient phone number using Node.js native fetch.
 *
 * HOW TO RUN:
 * 1. Enter your verified WhatsApp phone number in `myNumber` below.
 * 2. In terminal run:
 *    cd server
 *    node test-whatsapp.js
 * ============================================================================
 */

// 1. Meta WhatsApp Cloud API Credentials
const token = 'EAAQcTaZAebyQBSXJQnHt34cKzWSmi75kRPvJptKhm1NKr8ak2hcm4mQHIGbag1ZAt922PW8lbL1XOhxoKBYDhEXNd8kdcbFEvvKqL4V4x4bZAJp4WbeXlx2W8Q9oZCHdSMdqxKphZBYJcN54fpvvN7FA9QUCUa46SQAh9SHNi48vBE0kTjLhhxy0bnJxdZBdvHaAWZCk8sLasYwrOT8CTZATsZBFM0ZA8dhFuzE34N9uqYkoelCOwHlH6GoOzrbeQSOl1hXqm4BoMepCrCNQvHNViK';
const phoneNumberId = '1354748474382369';

// 2. Target Recipient Phone Number
const myNumber = '923360069977';

async function testWhatsAppAPI() {
  console.log('----------------------------------------------------');
  console.log('🌿 PlantWise: Testing Meta WhatsApp Cloud API');
  console.log('----------------------------------------------------');

  if (!myNumber || myNumber.trim() === '') {
    console.error('❌ ERROR: Recipient number is missing!');
    console.error('👉 Please open `test-whatsapp.js` and enter your phone number in `myNumber`.');
    console.error('   Example: const myNumber = "923001234567";');
    return;
  }

  const endpoint = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: myNumber.trim(),
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US',
      },
    },
  };

  try {
    console.log(`📤 Sending 'hello_world' template to: +${myNumber.trim()}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('✅ SUCCESS! Meta WhatsApp Message Sent Successfully!');
      console.log('📦 Meta Response Details:');
      console.dir(data, { depth: null, colors: true });
    } else {
      console.error('❌ FAILED: Meta WhatsApp API Error Response:');
      console.dir(data, { depth: null, colors: true });
    }
  } catch (error) {
    console.error('🚨 Unexpected Network / Runtime Error:', error.message);
  }
}

// Execute the test function
testWhatsAppAPI();
