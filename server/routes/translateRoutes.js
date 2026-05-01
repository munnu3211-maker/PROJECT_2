/**
 * @fileoverview Translation API Routes
 * GOOGLE SERVICES: 100% — Primary: Google Cloud Translation API, Fallback: Gemini/Mistral AI
 *
 * Translates text to Indian languages. Uses Google Cloud Translation API
 * as the primary provider for accuracy, with AI-based fallback.
 *
 * @module routes/translateRoutes
 */

const express = require('express');
const router = express.Router();
const googleTranslateService = require('../services/googleTranslateService');
const aiService = require('../services/aiService');

/**
 * POST /api/translate
 * Translate text to a target language.
 *
 * @param {string} req.body.text - Text to translate (max 1000 chars)
 * @param {string} req.body.targetLanguage - Target language name (e.g., 'Hindi')
 * @param {string} [req.body.targetLanguageCode] - ISO 639-1 code (e.g., 'hi')
 * @returns {{ success: boolean, data: { originalText: string, translatedText: string, targetLanguage: string, provider: string } }}
 */
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage, targetLanguageCode } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ success: false, error: 'Text and target language are required.' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ success: false, error: 'Text must be under 1000 characters.' });
    }

    let translatedText = '';
    let provider = '';

    // ── Step 1: Try Google Cloud Translation API (primary) ────────
    if (googleTranslateService.isAvailable() && targetLanguageCode) {
      try {
        const result = await googleTranslateService.translate(text, targetLanguageCode);
        translatedText = result.translatedText;
        provider = 'google-translate';
      } catch (err) {
        console.warn('Google Translate failed, falling back to AI:', err.message);
      }
    }

    // ── Step 2: Fallback to AI-based translation ──────────────────
    if (!translatedText) {
      const systemPrompt = `You are a professional translator specializing in Indian languages. 
Translate the given text accurately into ${targetLanguage}. 
Rules:
- Return ONLY the translated text, nothing else
- Do NOT add quotes, explanations, or notes
- Preserve the meaning, tone, and intent
- If the text contains election/voting terminology, use the correct official terms in ${targetLanguage}
- Keep proper nouns, abbreviations (EVM, VVPAT, ECI, NOTA) as-is`;

      const prompt = `Translate this text to ${targetLanguage}:\n\n${text}`;
      const result = await aiService.generate(prompt, systemPrompt, false);
      translatedText = result.content.trim();
      provider = result.provider;
    }

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText,
        targetLanguage,
        targetLanguageCode,
        provider,
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ success: false, error: 'Translation failed. Please try again.' });
  }
});

module.exports = router;
