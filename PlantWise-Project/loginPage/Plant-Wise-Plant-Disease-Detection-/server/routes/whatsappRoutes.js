const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../services/whatsappService');

/**
 * @route   POST /api/whatsapp/send-alert
 * @desc    Send a dynamic WhatsApp alert or notification to a farmer
 * @access  Public / Application
 * @body    { phoneNumber: string, alertType?: string }
 */
router.post('/send-alert', async (req, res) => {
  try {
    const { phoneNumber, alertType } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required in request body (e.g., "923360069977")',
      });
    }

    // Map alertType to approved Meta templates (defaults to 'hello_world')
    let templateName = 'hello_world';

    if (alertType === 'welcome') {
      templateName = 'hello_world';
    } else if (alertType) {
      // Future custom weather / pest alert templates once approved by Meta
      templateName = alertType;
    }

    // Send message via service
    const metaResponse = await sendWhatsAppMessage(phoneNumber, templateName);

    return res.status(200).json({
      success: true,
      message: 'Alert sent successfully',
      recipient: phoneNumber,
      template: templateName,
      metaMessageId: metaResponse?.messages?.[0]?.id,
    });
  } catch (error) {
    console.error('❌ WhatsApp Send Alert Route Error:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send WhatsApp alert',
      details: error.details || null,
    });
  }
});

module.exports = router;
