const mongoose = require('mongoose');

const queryLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  query: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    default: '',
  },
  provider: {
    type: String,
    enum: ['gemini', 'mistral', 'cache', 'fallback'],
    default: 'gemini',
  },
  endpoint: {
    type: String,
    enum: ['chat', 'journey', 'scenario', 'booth', 'quiz', 'timeline', 'checklist'],
    default: 'chat',
  },
  category: {
    type: String,
    default: 'general',
    index: true,
  },
  responseTimeMs: {
    type: Number,
    default: 0,
  },
  cached: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for time-based queries
queryLogSchema.index({ createdAt: -1 });
queryLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QueryLog', queryLogSchema);
