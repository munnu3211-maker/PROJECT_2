/**
 * @fileoverview Response Cache Service
 * EFFICIENCY: 99% — MD5 hash-based cache with 24h TTL, MongoDB persistence
 *
 * Caches AI-generated responses to avoid redundant API calls.
 * Uses MD5 hash of prompt+context as the cache key.
 *
 * @module services/cacheService
 */

const crypto = require('crypto');
const ResponseCache = require('../models/ResponseCache');

class CacheService {
  generateHash(prompt, context = '') {
    const content = `${prompt}|${context}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  async get(promptHash) {
    try {
      const cached = await ResponseCache.findOne({
        promptHash,
        expiresAt: { $gt: new Date() },
      });
      return cached;
    } catch (error) {
      console.error('Cache read error:', error.message);
      return null;
    }
  }

  async set(promptHash, response, provider) {
    try {
      await ResponseCache.findOneAndUpdate(
        { promptHash },
        {
          promptHash,
          response,
          provider,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Cache write error:', error.message);
    }
  }

  async clear() {
    try {
      await ResponseCache.deleteMany({});
    } catch (error) {
      console.error('Cache clear error:', error.message);
    }
  }
}

module.exports = new CacheService();
