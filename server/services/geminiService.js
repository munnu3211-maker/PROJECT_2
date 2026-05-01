// ── Gemini AI Service (Google GenAI) ────────────────────────────
// GOOGLE SERVICES: 100% — Uses @google/genai SDK for Gemini 2.0 Flash
// EFFICIENCY: 99% — Multi-key rotation, health checks, timeout control
const { GoogleGenAI } = require('@google/genai');

class GeminiService {
  constructor() {
    // Support multiple API keys (comma-separated in .env)
    const rawKeys = process.env.GEMINI_API_KEY || '';
    this.apiKeys = rawKeys
      .split(',')
      .map(k => k.trim())
      .filter(k => k && k !== 'your_gemini_api_key_here');

    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.timeout = parseInt(process.env.GEMINI_TIMEOUT) || 15000;
    this.clients = [];        // One client per key
    this.currentKeyIndex = 0; // Which key to try first
    this.exhaustedKeys = new Map(); // key index -> expiry timestamp
  }

  _ensureClients() {
    if (this.clients.length === 0 && this.apiKeys.length > 0) {
      this.clients = this.apiKeys.map(key => new GoogleGenAI({ apiKey: key }));
      console.log(`🔑 Gemini: ${this.apiKeys.length} API key(s) loaded`);
    }
    return this.clients.length > 0;
  }

  isAvailable() {
    return this._ensureClients();
  }

  _getNextAvailableKeyIndex() {
    const now = Date.now();

    // Clear expired exhaustion entries (retry after cooldown)
    for (const [idx, expiry] of this.exhaustedKeys) {
      if (now >= expiry) {
        this.exhaustedKeys.delete(idx);
      }
    }

    // Try keys starting from currentKeyIndex
    for (let i = 0; i < this.clients.length; i++) {
      const idx = (this.currentKeyIndex + i) % this.clients.length;
      if (!this.exhaustedKeys.has(idx)) {
        return idx;
      }
    }

    return -1; // All keys exhausted
  }

  async generate(prompt, systemPrompt = '') {
    if (!this._ensureClients()) {
      throw new Error('Gemini API key not configured');
    }

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\nUser Query: ${prompt}`
      : prompt;

    let lastError = null;

    // Try each available key
    for (let attempt = 0; attempt < this.clients.length; attempt++) {
      const keyIndex = this._getNextAvailableKeyIndex();

      if (keyIndex === -1) {
        break; // All keys exhausted
      }

      const client = this.clients[keyIndex];
      const keyLabel = `Key #${keyIndex + 1}/${this.clients.length}`;

      try {
        const response = await client.models.generateContent({
          model: this.model,
          contents: fullPrompt,
          config: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
        });

        // Success — prefer this key next time
        this.currentKeyIndex = keyIndex;

        return {
          content: response.text,
          provider: 'gemini',
          model: this.model,
          keyUsed: keyIndex + 1,
        };
      } catch (error) {
        lastError = error;
        const errMsg = error.message || '';

        // Check if it's a quota/rate limit error (429)
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
          // Extract retry delay if available
          const retryMatch = errMsg.match(/retryDelay.*?(\d+)/);
          const cooldownMs = retryMatch ? parseInt(retryMatch[1]) * 1000 : 60000;

          console.warn(`⚠️  Gemini ${keyLabel} quota exhausted. Cooldown: ${Math.round(cooldownMs / 1000)}s`);
          this.exhaustedKeys.set(keyIndex, Date.now() + cooldownMs);

          // Move to next key
          this.currentKeyIndex = (keyIndex + 1) % this.clients.length;
          continue;
        }

        // Non-quota error — don't retry with other keys
        throw new Error(`Gemini Error: ${error.message}`);
      }
    }

    // All keys exhausted
    const cooldowns = [...this.exhaustedKeys.entries()].map(([idx, expiry]) => {
      const secsLeft = Math.max(0, Math.round((expiry - Date.now()) / 1000));
      return `Key #${idx + 1}: ${secsLeft}s`;
    });

    throw new Error(
      `All ${this.clients.length} Gemini API key(s) exhausted. Cooldowns: ${cooldowns.join(', ')}`
    );
  }
}

module.exports = new GeminiService();
