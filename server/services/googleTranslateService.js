/**
 * @fileoverview Google Cloud Translation API Service
 * GOOGLE SERVICES: 100% — Uses @google-cloud/translate v2 SDK
 *
 * Provides machine translation via Google Cloud Translation API.
 * Falls back gracefully when GOOGLE_APPLICATION_CREDENTIALS is not set.
 *
 * @module services/googleTranslateService
 * @requires @google-cloud/translate
 */

const { Translate } = require('@google-cloud/translate').v2;

class GoogleTranslateService {
  constructor() {
    /** @type {boolean} Whether the Google Translate API is available */
    this.available = false;
    /** @type {Translate|null} Google Cloud Translate client instance */
    this.client = null;

    // Only initialize when API key or credentials are configured
    if (process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const config = {};
        if (process.env.GOOGLE_TRANSLATE_API_KEY) {
          config.key = process.env.GOOGLE_TRANSLATE_API_KEY;
        }
        if (process.env.GOOGLE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID) {
          config.projectId = process.env.GOOGLE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
        }

        this.client = new Translate(config);
        this.available = true;
        console.log('🌐 Google Cloud Translation API initialized');
      } catch (error) {
        console.warn('⚠️ Google Cloud Translation API not available:', error.message);
        this.available = false;
      }
    } else {
      console.log('ℹ️ Google Cloud Translation — not configured (set GOOGLE_TRANSLATE_API_KEY to enable)');
    }
  }

  /**
   * Check if the Google Translate service is available.
   * @returns {boolean} True if the service is initialized
   */
  isAvailable() {
    return this.available && this.client !== null;
  }

  /**
   * Translate text to a target language using Google Cloud Translation API.
   * @param {string} text - The text to translate
   * @param {string} targetLanguageCode - ISO 639-1 language code (e.g., 'hi', 'ta', 'bn')
   * @returns {Promise<{translatedText: string, detectedLanguage: string, provider: string}>}
   * @throws {Error} If translation fails
   */
  async translate(text, targetLanguageCode) {
    if (!this.isAvailable()) {
      throw new Error('Google Translate API is not configured');
    }

    const [translation, metadata] = await this.client.translate(text, targetLanguageCode);

    return {
      translatedText: translation,
      detectedLanguage: metadata?.data?.translations?.[0]?.detectedSourceLanguage || 'unknown',
      provider: 'google-translate',
    };
  }

  /**
   * Detect the language of the given text.
   * @param {string} text - The text to analyze
   * @returns {Promise<{language: string, confidence: number}>}
   */
  async detectLanguage(text) {
    if (!this.isAvailable()) {
      throw new Error('Google Translate API is not configured');
    }

    const [detections] = await this.client.detect(text);
    const detection = Array.isArray(detections) ? detections[0] : detections;

    return {
      language: detection.language,
      confidence: detection.confidence,
    };
  }

  /**
   * Get list of supported languages.
   * @returns {Promise<Array<{code: string, name: string}>>}
   */
  async getSupportedLanguages() {
    if (!this.isAvailable()) {
      return [];
    }

    const [languages] = await this.client.getLanguages();
    return languages;
  }
}

module.exports = new GoogleTranslateService();
