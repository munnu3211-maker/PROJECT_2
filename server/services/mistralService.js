// ── Mistral AI Service ──
// Fallback AI provider when Gemini is unavailable
// Uses Mistral's chat completions API (OpenAI-compatible format)

class MistralService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    this.model = process.env.MISTRAL_MODEL || 'mistral-small-latest';
    this.baseUrl = 'https://api.mistral.ai/v1/chat/completions';
    this.timeout = parseInt(process.env.MISTRAL_TIMEOUT) || 20000;
  }

  isAvailable() {
    return this.apiKey.length > 0 && this.apiKey !== 'your_mistral_api_key_here';
  }

  async generate(prompt, systemPrompt = '') {
    if (!this.isAvailable()) {
      throw new Error('Mistral API key not configured');
    }

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        const status = response.status;

        if (status === 429) {
          throw new Error(`Mistral 429: Rate limit exceeded`);
        }
        if (status === 401) {
          throw new Error(`Mistral 401: Invalid API key`);
        }

        throw new Error(`Mistral API error ${status}: ${errorBody}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('Mistral returned empty response');
      }

      const rawContent = data.choices[0].message.content;
      const content = this._cleanResponse(rawContent);

      return {
        content,
        provider: 'mistral',
        model: this.model,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Mistral request timed out after ${this.timeout}ms`);
      }

      throw error;
    }
  }

  // Clean Mistral response — strip ** asterisks used for headings
  _cleanResponse(text) {
    if (!text) return text;

    return text
      // Convert **Heading** on its own line → ## Heading (proper markdown)
      .replace(/^\*\*(.+?)\*\*\s*$/gm, '## $1')
      // Remove remaining inline ** bold markers
      .replace(/\*\*(.+?)\*\*/g, '$1')
      // Remove single * italic markers
      .replace(/\*(.+?)\*/g, '$1')
      // Clean up any leftover stray asterisks at line starts
      .replace(/^\*\s+/gm, '• ')
      .trim();
  }
}

module.exports = new MistralService();
