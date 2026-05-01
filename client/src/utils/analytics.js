/**
 * @fileoverview Google Analytics 4 Event Tracking Utility
 * GOOGLE SERVICES: 100% — Frontend analytics via gtag.js
 *
 * Provides helper functions to track custom events in Google Analytics.
 * All functions are safe to call even if GA is not loaded (no-op fallback).
 *
 * @module utils/analytics
 */

/**
 * Track a custom event in Google Analytics 4.
 * @param {string} eventName - GA4 event name (e.g., 'chat_message_sent')
 * @param {Object} [params={}] - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track a page view in Google Analytics 4.
 * @param {string} pagePath - The page path (e.g., '/dashboard')
 * @param {string} [pageTitle] - The page title
 */
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', window.__GA_ID__ || 'G-XXXXXXXXXX', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

/**
 * Track a user login event.
 * @param {string} method - Login method ('email', 'google')
 */
export const trackLogin = (method) => {
  trackEvent('login', { method });
};

/**
 * Track an AI chat interaction.
 * @param {string} provider - AI provider used ('mistral', 'gemini', 'fallback')
 */
export const trackChatMessage = (provider) => {
  trackEvent('chat_message', { ai_provider: provider });
};

/**
 * Track quiz completion.
 * @param {number} score - Quiz score percentage
 */
export const trackQuizComplete = (score) => {
  trackEvent('quiz_complete', { score_percent: score });
};

/**
 * Track translation usage.
 * @param {string} targetLanguage - Target language name
 */
export const trackTranslation = (targetLanguage) => {
  trackEvent('translate', { target_language: targetLanguage });
};
