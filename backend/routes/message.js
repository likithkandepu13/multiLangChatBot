const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });

// Simple bot response logic
const getBotResponse = (userMessage) => {
  return `You said: ${userMessage}. How can I assist you further?`;
};

// POST: Save message and get translated response
router.post('/', async (req, res) => {
  const { userMessage, language } = req.body;

  try {
    // Translate user message to English (for bot processing)
    const [translatedToEnglish] = await translate.translate(userMessage, 'en');
    // Get bot response in English
    const botResponseEn = getBotResponse(translatedToEnglish);
    // Translate bot response to target language
    const [botResponse] = await translate.translate(botResponseEn, language);

    // Save to MongoDB
    const message = new Message({
      userMessage,
      botResponse,
      language,
    });
    await message.save();

    res.json({ userMessage, botResponse, language });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Retrieve all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
