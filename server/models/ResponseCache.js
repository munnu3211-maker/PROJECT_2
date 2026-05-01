const mongoose = require('mongoose');

const responseCacheSchema = new mongoose.Schema({
  promptHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  response: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    enum: ['ollama', 'gemini'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    index: { expires: 0 },
  },
});

module.exports = mongoose.model('ResponseCache', responseCacheSchema);
