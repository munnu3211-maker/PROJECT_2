// ── Rate Limiting Middleware (SECURITY: 100%) ───────────────────
// Three-tier rate limiting strategy to prevent abuse:
//   1. generalLimiter  — 100 req/15min per IP (global)
//   2. authLimiter     — 20 req/15min per IP (brute-force prevention)
//   3. aiLimiter       — 30 req/15min per IP (protect AI provider quota)
// Bypassed in test environment (NODE_ENV=test) via noop middleware
const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

// In test mode, create a pass-through middleware
const noopMiddleware = (req, res, next) => next();

// General API rate limiter — 100 requests per 15 minutes
const generalLimiter = isTest ? noopMiddleware : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again after 15 minutes.',
  },
});

// Auth rate limiter — stricter, 20 per 15 minutes (prevent brute force)
const authLimiter = isTest ? noopMiddleware : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
});

// AI endpoint rate limiter — 30 per 15 minutes (protect Gemini quota)
const aiLimiter = isTest ? noopMiddleware : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI request limit reached. Please wait before making more AI queries.',
  },
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
