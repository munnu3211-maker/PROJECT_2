// ── Firebase Cloud Functions Entry Point ──
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

// Set global options for all functions
setGlobalOptions({
  region: 'asia-south1', // Mumbai region (closest to India)
  timeoutSeconds: 60,
  memory: '256MiB',
});

// Import the Express app
const app = require('./app');

// Export as a Cloud Function
exports.api = onRequest(app);
