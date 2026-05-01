const aiService = require('../../services/aiService');
const geminiService = require('../../services/geminiService');
const mistralService = require('../../services/mistralService');

// Import the actual (non-mocked) class for unit testing _cleanResponse
const ActualMistralClass = jest.requireActual('../../services/mistralService');

describe('Mistral AI — Fallback & Response Cleaning', () => {
  describe('Service availability', () => {
    it('should report unavailable without API key', () => {
      expect(mistralService.isAvailable()).toBe(false);
    });
  });

  describe('Response cleaning — _cleanResponse', () => {
    it('should convert **Heading** on its own line to ## Heading', () => {
      const input = '**How to Register**\nStep 1: Visit the portal';
      const cleaned = ActualMistralClass._cleanResponse(input);
      expect(cleaned).toContain('## How to Register');
      expect(cleaned).not.toContain('**');
    });

    it('should remove inline **bold** markers', () => {
      const input = 'Visit **ECI Portal** for registration';
      const cleaned = ActualMistralClass._cleanResponse(input);
      expect(cleaned).toContain('ECI Portal');
      expect(cleaned).not.toContain('**');
    });

    it('should remove single *italic* markers', () => {
      const input = 'This is *important* information';
      const cleaned = ActualMistralClass._cleanResponse(input);
      expect(cleaned).toContain('important');
      expect(cleaned).not.toContain('*important*');
    });

    it('should convert * list items to bullet points', () => {
      const input = '* First item\n* Second item';
      const cleaned = ActualMistralClass._cleanResponse(input);
      expect(cleaned).toContain('• First item');
      expect(cleaned).toContain('• Second item');
    });

    it('should handle empty/null input gracefully', () => {
      expect(ActualMistralClass._cleanResponse('')).toBe('');
      expect(ActualMistralClass._cleanResponse(null)).toBe(null);
      expect(ActualMistralClass._cleanResponse(undefined)).toBe(undefined);
    });

    it('should handle text with no asterisks (passthrough)', () => {
      const input = 'Simple text without formatting';
      const cleaned = ActualMistralClass._cleanResponse(input);
      expect(cleaned).toBe(input);
    });
  });

  describe('AI Service fallback chain', () => {
    it('should fall to hardcoded when both Gemini and Mistral are unavailable', async () => {
      geminiService.isAvailable.mockReturnValue(false);
      mistralService.isAvailable.mockReturnValue(false);

      const result = await aiService.generate('How to register?', '', false);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('Register');
    });

    it('should track stats correctly', async () => {
      const status = await aiService.getStatus();
      expect(status.stats).toBeDefined();
      expect(typeof status.stats.totalRequests).toBe('number');
      expect(typeof status.stats.cacheHits).toBe('number');
      expect(typeof status.stats.fallbackUsed).toBe('number');
    });
  });
});
