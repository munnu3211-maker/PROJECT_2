// ── Local Development Server ──
// Load .env for local development
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('./app');
const aiService = require('./services/aiService');

const PORT = parseInt(process.env.PORT) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`\n🚀 VotePath AI Server running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Auth: JWT + Google OAuth enabled\n`);

    // Check AI availability on startup
    aiService.getStatus().then(status => {
      console.log('🤖 AI Status:');
      console.log(`   Gemini: ${status.gemini ? '🟢 Available' : '🔴 Unavailable'}`);
      console.log(`   Active Provider: ${status.activeProvider || 'None (using fallback)'}\n`);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);
